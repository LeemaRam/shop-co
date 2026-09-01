<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $vendorId = $request->user()->vendor->id;

        $orders = Order::whereHas('items', fn ($q) => $q->where('vendor_id', $vendorId))
            ->with(['items' => fn ($q) => $q->where('vendor_id', $vendorId)])
            ->latest()
            ->paginate(15);

        return $this->success(
            OrderResource::collection($orders),
            'Vendor orders retrieved successfully',
            200,
            ['meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]]
        );
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $vendorId = $request->user()->vendor->id;

        abort_unless(
            $order->items()->where('vendor_id', $vendorId)->exists(),
            404,
            'Order not found.'
        );

        $order->setRelation('items', $order->items()->where('vendor_id', $vendorId)->get());

        return $this->success(new OrderResource($order), 'Order retrieved successfully');
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $vendorId = $request->user()->vendor->id;

        abort_unless(
            $order->items()->where('vendor_id', $vendorId)->exists(),
            404,
            'Order not found.'
        );

        // A vendor may only change the order status when every item belongs to them.
        $foreignItems = $order->items()->where('vendor_id', '!=', $vendorId)->exists();
        if ($foreignItems) {
            return $this->error('This order contains items from other vendors and cannot be updated here.', 403);
        }

        $data = $request->validate([
            'status' => ['required', Rule::in(array_column(OrderStatus::cases(), 'value'))],
        ]);

        $order->update(['status' => $data['status']]);

        $order->setRelation('items', $order->items()->where('vendor_id', $vendorId)->get());

        return $this->success(new OrderResource($order), 'Order status updated successfully');
    }
}
