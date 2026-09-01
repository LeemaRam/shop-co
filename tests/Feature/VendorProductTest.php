<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorProductTest extends TestCase
{
    use RefreshDatabase;

    private function vendorUser(): User
    {
        $user = User::factory()->vendor()->create();
        Vendor::factory()->create(['user_id' => $user->id]);

        return $user->fresh();
    }

    public function test_vendor_can_create_product_that_becomes_pending(): void
    {
        $user = $this->vendorUser();

        $response = $this->actingAs($user)->postJson('/api/vendor/products', [
            'name' => 'New Tee',
            'price' => 99,
            'variants' => [['size' => 'Large', 'color' => '#000000', 'stock' => 5]],
            'images' => [['image' => '/images/x.webp', 'is_primary' => true]],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('products', [
            'name' => 'New Tee',
            'vendor_id' => $user->vendor->id,
            'approval_status' => 'pending',
        ]);
    }

    public function test_vendor_cannot_modify_another_vendors_product(): void
    {
        $owner = $this->vendorUser();
        $other = $this->vendorUser();

        $product = Product::factory()->create(['vendor_id' => $other->vendor->id]);

        $this->actingAs($owner)->putJson("/api/vendor/products/{$product->id}", ['name' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_vendor_product_ignores_client_supplied_vendor_id(): void
    {
        $user = $this->vendorUser();

        $this->actingAs($user)->postJson('/api/vendor/products', [
            'name' => 'Tee',
            'price' => 50,
            'vendor_id' => 9999,
        ])->assertCreated();

        $this->assertDatabaseHas('products', ['name' => 'Tee', 'vendor_id' => $user->vendor->id]);
    }

    public function test_customer_cannot_access_vendor_endpoints(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)->getJson('/api/vendor/products')->assertForbidden();
    }
}
