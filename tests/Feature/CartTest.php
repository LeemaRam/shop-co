<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    private function makeProduct(int $stock = 10, float $price = 100): array
    {
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->approved()->create(['vendor_id' => $vendor->id, 'price' => $price]);
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock' => $stock, 'price' => null]);

        return [$product, $variant];
    }

    public function test_guest_can_add_item_to_cart(): void
    {
        [$product, $variant] = $this->makeProduct();

        $this->withHeader('X-Cart-Token', 'guest-abc')
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 2,
            ])
            ->assertCreated()
            ->assertJsonPath('data.itemsCount', 2)
            ->assertJsonPath('data.subtotal', 200);
    }

    public function test_cart_price_uses_backend_value_not_client(): void
    {
        [$product, $variant] = $this->makeProduct(price: 100);

        $response = $this->withHeader('X-Cart-Token', 'guest-abc')
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 1,
                'price' => 1, // malicious client price is ignored
            ])
            ->assertCreated();

        $this->assertEquals(100.0, $response->json('data.items.0.price'));
    }

    public function test_cannot_add_more_than_available_stock(): void
    {
        [$product, $variant] = $this->makeProduct(stock: 3);

        $this->withHeader('X-Cart-Token', 'guest-abc')
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 5,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('quantity');
    }

    public function test_can_update_and_remove_cart_item(): void
    {
        [$product, $variant] = $this->makeProduct();

        $add = $this->withHeader('X-Cart-Token', 'guest-abc')
            ->postJson('/api/cart/items', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 1]);
        $itemId = $add->json('data.items.0.id');

        $this->withHeader('X-Cart-Token', 'guest-abc')
            ->patchJson("/api/cart/items/{$itemId}", ['quantity' => 3])
            ->assertOk()
            ->assertJsonPath('data.itemsCount', 3);

        $this->withHeader('X-Cart-Token', 'guest-abc')
            ->deleteJson("/api/cart/items/{$itemId}")
            ->assertOk()
            ->assertJsonPath('data.itemsCount', 0);
    }

    public function test_unapproved_product_cannot_be_added(): void
    {
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->pending()->create(['vendor_id' => $vendor->id]);
        $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock' => 10]);

        $this->withHeader('X-Cart-Token', 'guest-abc')
            ->postJson('/api/cart/items', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 1])
            ->assertStatus(422);
    }
}
