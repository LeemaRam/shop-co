<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_list_approved_products(): void
    {
        $vendor = Vendor::factory()->create();
        Product::factory()->count(3)->approved()->create(['vendor_id' => $vendor->id]);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_unapproved_products_are_hidden_from_catalog(): void
    {
        $vendor = Vendor::factory()->create();
        Product::factory()->approved()->create(['vendor_id' => $vendor->id]);
        Product::factory()->pending()->create(['vendor_id' => $vendor->id]);
        Product::factory()->rejected()->create(['vendor_id' => $vendor->id]);

        $this->getJson('/api/products')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_product_detail_returns_frontend_shape(): void
    {
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->approved()->create([
            'vendor_id' => $vendor->id,
            'slug' => 'demo-product',
            'compare_at_price' => 200,
            'discount' => 10,
        ]);
        $product->images()->create(['image' => '/images/x.webp', 'is_primary' => true, 'sort_order' => 0]);
        $product->variants()->create(['size' => 'Large', 'color' => '#000000', 'stock' => 5]);

        $this->getJson('/api/products/demo-product')
            ->assertOk()
            ->assertJsonPath('data.slug', 'demo-product')
            ->assertJsonPath('data.oldPrice', 200)
            ->assertJsonPath('data.discount', 10)
            ->assertJsonPath('data.colors.0', '#000000')
            ->assertJsonPath('data.sizes.0', 'Large');
    }

    public function test_products_can_be_filtered_by_price_and_sorted(): void
    {
        $vendor = Vendor::factory()->create();
        Product::factory()->approved()->create(['vendor_id' => $vendor->id, 'price' => 50]);
        Product::factory()->approved()->create(['vendor_id' => $vendor->id, 'price' => 150]);
        Product::factory()->approved()->create(['vendor_id' => $vendor->id, 'price' => 500]);

        $response = $this->getJson('/api/products?min_price=100&max_price=200&sort=price_low')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->assertEquals(150.0, $response->json('data.0.price'));
    }

    public function test_catalog_is_paginated(): void
    {
        $vendor = Vendor::factory()->create();
        Product::factory()->count(15)->approved()->create(['vendor_id' => $vendor->id]);

        $this->getJson('/api/products?per_page=10')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.total', 15)
            ->assertJsonPath('meta.last_page', 2);
    }

    public function test_category_products_endpoint(): void
    {
        $vendor = Vendor::factory()->create();
        $category = Category::factory()->create(['slug' => 'tees']);
        Product::factory()->count(2)->approved()->create(['vendor_id' => $vendor->id, 'category_id' => $category->id]);

        $this->getJson('/api/categories/tees/products')->assertOk()->assertJsonCount(2, 'data');
    }
}
