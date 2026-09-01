<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_cannot_access_admin_apis(): void
    {
        $vendorUser = User::factory()->vendor()->create();
        Vendor::factory()->create(['user_id' => $vendorUser->id]);

        $this->actingAs($vendorUser)->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_customer_cannot_access_admin_or_vendor_apis(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)->getJson('/api/admin/dashboard')->assertForbidden();
        $this->actingAs($customer)->getJson('/api/vendor/dashboard')->assertForbidden();
    }

    public function test_vendor_only_sees_own_order_items(): void
    {
        $vendorAUser = User::factory()->vendor()->create();
        $vendorA = Vendor::factory()->create(['user_id' => $vendorAUser->id]);
        $vendorB = Vendor::factory()->create();

        $productA = Product::factory()->approved()->create(['vendor_id' => $vendorA->id]);
        $productB = Product::factory()->approved()->create(['vendor_id' => $vendorB->id]);

        $order = Order::factory()->create();
        OrderItem::factory()->create(['order_id' => $order->id, 'vendor_id' => $vendorA->id, 'product_id' => $productA->id]);
        OrderItem::factory()->create(['order_id' => $order->id, 'vendor_id' => $vendorB->id, 'product_id' => $productB->id]);

        $response = $this->actingAs($vendorAUser)->getJson("/api/vendor/orders/{$order->id}")->assertOk();

        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals($vendorA->id, $response->json('data.items.0.vendorId'));
    }

    public function test_vendor_cannot_update_mixed_vendor_order_status(): void
    {
        $vendorAUser = User::factory()->vendor()->create();
        $vendorA = Vendor::factory()->create(['user_id' => $vendorAUser->id]);
        $vendorB = Vendor::factory()->create();

        $order = Order::factory()->create();
        OrderItem::factory()->create(['order_id' => $order->id, 'vendor_id' => $vendorA->id]);
        OrderItem::factory()->create(['order_id' => $order->id, 'vendor_id' => $vendorB->id]);

        $this->actingAs($vendorAUser)->patchJson("/api/vendor/orders/{$order->id}/status", ['status' => 'shipped'])
            ->assertForbidden();
    }
}
