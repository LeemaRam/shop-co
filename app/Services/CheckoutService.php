<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public const SHIPPING_FLAT = 15.00;

    /**
     * Create an order from a cart within a single transaction.
     *
     * @throws ValidationException
     */
    public function checkout(Cart $cart, array $data, ?User $user): Order
    {
        $cart->load(['items.product.vendor', 'items.variant']);

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
        }

        return DB::transaction(function () use ($cart, $data, $user) {
            $subtotal = 0.0;
            $lines = [];

            foreach ($cart->items as $item) {
                $product = $item->product;

                if (! $product || $product->approval_status->value !== 'approved' || $product->status->value !== 'active') {
                    throw ValidationException::withMessages([
                        'cart' => "Product '{$item->product?->name}' is no longer available.",
                    ]);
                }

                $variant = $item->variant;

                // Lock the variant row to prevent oversell under concurrency.
                if ($variant) {
                    $variant = ProductVariant::whereKey($variant->id)->lockForUpdate()->first();

                    if (! $variant || $variant->stock < $item->quantity) {
                        throw ValidationException::withMessages([
                            'cart' => "Insufficient stock for '{$product->name}'.",
                        ]);
                    }
                }

                // Authoritative price snapshot from the database, never from the client.
                $unitPrice = (float) ($variant->price ?? $product->price);
                $lineTotal = round($unitPrice * $item->quantity, 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'product' => $product,
                    'variant' => $variant,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'total' => $lineTotal,
                ];
            }

            $subtotal = round($subtotal, 2);

            [$coupon, $discount] = $this->resolveCoupon($data['coupon_code'] ?? null, $subtotal);

            $shipping = self::SHIPPING_FLAT;
            $total = round($subtotal - $discount + $shipping, 2);

            $order = Order::create([
                'user_id' => $user?->id,
                'coupon_id' => $coupon?->id,
                'order_number' => Order::generateOrderNumber(),
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping' => $shipping,
                'total' => $total,
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Pending,
                'shipping_address' => $data['shipping_address'],
                'billing_address' => $data['billing_address'] ?? $data['shipping_address'],
            ]);

            foreach ($lines as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'vendor_id' => $line['product']->vendor_id,
                    'product_variant_id' => $line['variant']?->id,
                    'product_name' => $line['product']->name,
                    'variant_label' => $line['variant']?->label(),
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'total' => $line['total'],
                ]);

                if ($line['variant']) {
                    $line['variant']->decrement('stock', $line['quantity']);
                }
            }

            if ($coupon) {
                $coupon->increment('used_count');
                CouponUsage::create([
                    'coupon_id' => $coupon->id,
                    'user_id' => $user?->id,
                    'order_id' => $order->id,
                ]);
            }

            $cart->items()->delete();

            return $order->load('items');
        });
    }

    /**
     * @return array{0: ?Coupon, 1: float}
     *
     * @throws ValidationException
     */
    protected function resolveCoupon(?string $code, float $subtotal): array
    {
        if (! $code) {
            return [null, 0.0];
        }

        $coupon = Coupon::where('code', $code)->lockForUpdate()->first();

        if (! $coupon) {
            throw ValidationException::withMessages(['coupon_code' => 'Invalid coupon code.']);
        }

        if ($error = $coupon->validationError($subtotal)) {
            throw ValidationException::withMessages(['coupon_code' => $error]);
        }

        return [$coupon, $coupon->discountFor($subtotal)];
    }
}
