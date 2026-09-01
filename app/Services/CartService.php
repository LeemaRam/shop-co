<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartService
{
    /**
     * Resolve the active cart for the current request (authenticated user or guest token).
     */
    public function resolveCart(Request $request, bool $create = true): ?Cart
    {
        if ($user = $request->user()) {
            return $create
                ? Cart::firstOrCreate(['user_id' => $user->id])
                : $user->cart;
        }

        $token = $this->guestToken($request);

        if (! $token) {
            return null;
        }

        return $create
            ? Cart::firstOrCreate(['session_id' => $token])
            : Cart::where('session_id', $token)->first();
    }

    public function guestToken(Request $request): ?string
    {
        return $request->header('X-Cart-Token') ?: $request->input('cart_token');
    }

    /**
     * Validate a product/variant is purchasable and return the authoritative price.
     *
     * @throws ValidationException
     */
    public function resolvePurchasable(Product $product, ?ProductVariant $variant, int $quantity): float
    {
        if (! $product->scopePublished($product->newQuery())->whereKey($product->id)->exists()) {
            throw ValidationException::withMessages([
                'product_id' => 'This product is not available for purchase.',
            ]);
        }

        if ($variant && $variant->product_id !== $product->id) {
            throw ValidationException::withMessages([
                'variant_id' => 'The selected variant does not belong to this product.',
            ]);
        }

        if ($variant) {
            if ($variant->stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Only {$variant->stock} item(s) are in stock.",
                ]);
            }

            return (float) ($variant->price ?? $product->price);
        }

        return (float) $product->price;
    }
}
