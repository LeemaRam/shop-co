<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_review_purchased_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->approved()->create(['vendor_id' => Vendor::factory()->create()->id]);

        $order = Order::factory()->create(['user_id' => $user->id]);
        OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

        $this->actingAs($user)->postJson("/api/products/{$product->slug}/reviews", [
            'rating' => 5,
            'comment' => 'Great product!',
        ])->assertCreated();

        $this->assertDatabaseHas('reviews', ['product_id' => $product->id, 'user_id' => $user->id, 'rating' => 5]);
        $this->assertEquals(5.0, (float) $product->fresh()->rating);
        $this->assertEquals(1, $product->fresh()->reviews_count);
    }

    public function test_customer_cannot_review_unpurchased_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->approved()->create(['vendor_id' => Vendor::factory()->create()->id]);

        $this->actingAs($user)->postJson("/api/products/{$product->slug}/reviews", ['rating' => 5])
            ->assertForbidden();
    }

    public function test_rating_must_be_between_1_and_5(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->approved()->create(['vendor_id' => Vendor::factory()->create()->id]);
        $order = Order::factory()->create(['user_id' => $user->id]);
        OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

        $this->actingAs($user)->postJson("/api/products/{$product->slug}/reviews", ['rating' => 9])
            ->assertStatus(422)
            ->assertJsonValidationErrors('rating');
    }
}
