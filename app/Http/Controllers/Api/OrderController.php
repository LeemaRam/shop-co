<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly CartService $cartService,
        private readonly CheckoutService $checkoutService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with('items')
            ->latest()
            ->paginate(10);

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

    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return $this->error('Order not found.', 404);
        }

        return $this->success(new OrderResource($order->load('items')), 'Order retrieved successfully');
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $cart = $this->cartService->resolveCart($request, create: false);

        if (! $cart || $cart->items()->count() === 0) {
            return $this->error('Your cart is empty.', 422);
        }

        $order = $this->checkoutService->checkout($cart, $request->validated(), $request->user());

        return $this->success(new OrderResource($order), 'Order placed successfully', 201);
    }
}
