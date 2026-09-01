<?php

namespace App\Http\Controllers\Api\Admin;

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
        $orders = Order::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->with('items')
            ->latest()
            ->paginate(20);

        return $this->success(
            OrderResource::collection($orders),
            'Orders retrieved successfully',
            200,
            ['meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]]
        );
    }

    public function show(Order $order): JsonResponse
    {
        return $this->success(new OrderResource($order->load('items')), 'Order retrieved successfully');
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_column(OrderStatus::cases(), 'value'))],
        ]);

        $order->update(['status' => $data['status']]);

        return $this->success(new OrderResource($order->load('items')), 'Order status updated successfully');
    }
}
