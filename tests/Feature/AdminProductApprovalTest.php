<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_approve_product(): void
    {
        $admin = User::factory()->admin()->create();
        $product = Product::factory()->pending()->create(['vendor_id' => Vendor::factory()->create()->id]);

        $this->actingAs($admin)->patchJson("/api/admin/products/{$product->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.slug', $product->slug);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'approval_status' => 'approved']);
    }

    public function test_admin_can_reject_product_with_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $product = Product::factory()->pending()->create(['vendor_id' => Vendor::factory()->create()->id]);

        $this->actingAs($admin)->patchJson("/api/admin/products/{$product->id}/reject", ['reason' => 'Poor quality images'])
            ->assertOk();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'approval_status' => 'rejected',
            'rejection_reason' => 'Poor quality images',
        ]);
    }

    public function test_non_admin_cannot_approve_products(): void
    {
        $vendorUser = User::factory()->vendor()->create();
        Vendor::factory()->create(['user_id' => $vendorUser->id]);
        $product = Product::factory()->pending()->create(['vendor_id' => Vendor::factory()->create()->id]);

        $this->actingAs($vendorUser)->patchJson("/api/admin/products/{$product->id}/approve")
            ->assertForbidden();
    }

    public function test_admin_pending_list_only_shows_pending(): void
    {
        $admin = User::factory()->admin()->create();
        $vendor = Vendor::factory()->create();
        Product::factory()->pending()->count(2)->create(['vendor_id' => $vendor->id]);
        Product::factory()->approved()->create(['vendor_id' => $vendor->id]);

        $this->actingAs($admin)->getJson('/api/admin/products/pending')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
