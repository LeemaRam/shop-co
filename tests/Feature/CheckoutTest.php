<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private array $address = [
        'line1' => '123 Main St',
        'city' => 'Metropolis',
        'state' => 'NY',
        'postal_code' => '10001',
        'country' => 'USA',
    ];

    private function seedCart(string $token, int $stock = 10, float $price = 100, int $qty = 2): array
    {
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->approved()->create(['vendor_id' => $vendor->id, 'price' => $price]);
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock' => $stock, 'price' => null]);

        $this->withHeader('X-Cart-Token', $token)
            ->postJson('/api/cart/items', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => $qty])
            ->assertCreated();

        return [$product, $variant];
    }

    public function test_guest_checkout_creates_order_and_reduces_stock(): void
    {
        [$product, $variant] = $this->seedCart('guest-1', stock: 10, price: 100, qty: 2);

        $response = $this->withHeader('X-Cart-Token', 'guest-1')
            ->postJson('/api/checkout', [
                'customer_name' => 'Guest User',
                'customer_email' => 'guest@example.com',
                'shipping_address' => $this->address,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.subtotal', 200)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('orders', ['customer_email' => 'guest@example.com', 'user_id' => null]);
        $this->assertEquals(8, $variant->fresh()->stock);
        // Cart cleared after checkout
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_order_items_snapshot_price(): void
    {
        [$product, $variant] = $this->seedCart('guest-2', price: 100, qty: 1);

        $this->withHeader('X-Cart-Token', 'guest-2')->postJson('/api/checkout', [
            'customer_name' => 'Guest',
            'customer_email' => 'g@example.com',
            'shipping_address' => $this->address,
        ])->assertCreated();

        // Change product price afterwards; historical order item stays the same.
        $product->update(['price' => 999]);

        $this->assertDatabaseHas('order_items', ['product_id' => $product->id, 'unit_price' => 100.00]);
    }

    public function test_authenticated_checkout_attaches_user(): void
    {
        $user = User::factory()->create();
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->approved()->create(['vendor_id' => $vendor->id, 'price' => 50]);
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock' => 5, 'price' => null]);

        $this->actingAs($user)->postJson('/api/cart/items', [
            'product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 1,
        ])->assertCreated();

        $this->actingAs($user)->postJson('/api/checkout', [
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'shipping_address' => $this->address,
        ])->assertCreated();

        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
    }

    public function test_coupon_discount_is_applied_from_backend(): void
    {
        [$product, $variant] = $this->seedCart('guest-3', price: 100, qty: 2); // subtotal 200
        Coupon::factory()->create(['code' => 'SAVE10', 'value' => 10, 'minimum_order_amount' => 100]);

        $this->withHeader('X-Cart-Token', 'guest-3')->postJson('/api/checkout', [
            'customer_name' => 'Guest',
            'customer_email' => 'g@example.com',
            'shipping_address' => $this->address,
            'coupon_code' => 'SAVE10',
        ])
            ->assertCreated()
            ->assertJsonPath('data.discount', 20); // 10% of 200
    }

    public function test_checkout_fails_on_empty_cart(): void
    {
        $this->withHeader('X-Cart-Token', 'empty')->postJson('/api/checkout', [
            'customer_name' => 'Guest',
            'customer_email' => 'g@example.com',
            'shipping_address' => $this->address,
        ])->assertStatus(422);
    }
}
