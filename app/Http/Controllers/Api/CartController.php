<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\CartService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly CartService $cartService) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartService->resolveCart($request, create: false);

        if (! $cart) {
            return $this->success(['items' => [], 'itemsCount' => 0, 'subtotal' => 0], 'Cart is empty');
        }

        $cart->load(['items.product.images', 'items.variant']);

        return $this->success(new CartResource($cart), 'Cart retrieved successfully');
    }

    public function store(AddCartItemRequest $request): JsonResponse
    {
        $product = Product::findOrFail($request->integer('product_id'));
        $variant = $request->filled('variant_id')
            ? ProductVariant::find($request->integer('variant_id'))
            : null;

        $quantity = $request->integer('quantity');
        $price = $this->cartService->resolvePurchasable($product, $variant, $quantity);

        $cart = $this->cartService->resolveCart($request);

        $item = $cart->items()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant?->id)
            ->first();

        if ($item) {
            $newQty = $item->quantity + $quantity;
            $this->cartService->resolvePurchasable($product, $variant, $newQty);
            $item->update(['quantity' => $newQty, 'price' => $price]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'quantity' => $quantity,
                'price' => $price,
            ]);
        }

        $cart->load(['items.product.images', 'items.variant']);

        return $this->success(new CartResource($cart), 'Item added to cart', 201);
    }

    public function update(UpdateCartItemRequest $request, CartItem $item): JsonResponse
    {
        $cart = $this->requireOwnedCart($request);

        if (! $cart || $item->cart_id !== $cart->id) {
            return $this->error('Cart item not found.', 404);
        }

        $item->load('product', 'variant');
        $price = $this->cartService->resolvePurchasable($item->product, $item->variant, $request->integer('quantity'));
        $item->update(['quantity' => $request->integer('quantity'), 'price' => $price]);

        $cart->load(['items.product.images', 'items.variant']);

        return $this->success(new CartResource($cart), 'Cart item updated');
    }

    public function destroy(Request $request, CartItem $item): JsonResponse
    {
        $cart = $this->requireOwnedCart($request);

        if (! $cart || $item->cart_id !== $cart->id) {
            return $this->error('Cart item not found.', 404);
        }

        $item->delete();
        $cart->load(['items.product.images', 'items.variant']);

        return $this->success(new CartResource($cart), 'Cart item removed');
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->requireOwnedCart($request);

        $cart?->items()->delete();

        return $this->success(['items' => [], 'itemsCount' => 0, 'subtotal' => 0], 'Cart cleared');
    }

    private function requireOwnedCart(Request $request)
    {
        return $this->cartService->resolveCart($request, create: false);
    }
}
