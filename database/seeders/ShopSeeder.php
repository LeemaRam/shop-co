<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Enums\CouponType;
use App\Enums\GeneralStatus;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        // --- Admin ---
        User::create([
            'name' => 'Site Admin',
            'email' => 'admin@shop.co',
            'password' => 'password',
            'role' => UserRole::Admin,
        ]);

        // --- Customer ---
        $customer = User::create([
            'name' => 'Jane Customer',
            'email' => 'customer@shop.co',
            'password' => 'password',
            'role' => UserRole::Customer,
        ]);
        User::factory()->count(5)->customer()->create();

        // --- Vendors ---
        $vendors = collect([
            ['name' => 'Urban Threads', 'email' => 'vendor@shop.co', 'store' => 'Urban Threads'],
            ['name' => 'Denim Co', 'email' => 'vendor2@shop.co', 'store' => 'Denim Co'],
            ['name' => 'Classic Wear', 'email' => 'vendor3@shop.co', 'store' => 'Classic Wear'],
        ])->map(function (array $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => 'password',
                'role' => UserRole::Vendor,
            ]);

            return Vendor::create([
                'user_id' => $user->id,
                'store_name' => $data['store'],
                'slug' => Str::slug($data['store']),
                'description' => "Quality apparel from {$data['store']}.",
                'status' => GeneralStatus::Active,
            ]);
        })->values();

        // --- Categories ---
        $categories = collect(CatalogData::categories())->mapWithKeys(function (array $c) {
            $category = Category::create([
                'name' => $c['name'],
                'slug' => Str::slug($c['name']),
                'image' => $c['image'],
                'status' => GeneralStatus::Active,
            ]);

            return [$c['name'] => $category];
        });

        // --- Products (mirrored from the frontend catalog) ---
        foreach (CatalogData::products() as $index => $data) {
            $vendor = $vendors[$index % $vendors->count()];
            $category = $categories[$data['category']] ?? null;

            $product = Product::create([
                'vendor_id' => $vendor->id,
                'category_id' => $category?->id,
                'name' => $data['name'],
                'slug' => $data['id'],
                'description' => $data['description'],
                'price' => $data['price'],
                'compare_at_price' => $data['oldPrice'],
                'discount' => $data['discount'],
                'style' => $data['style'],
                'tags' => $data['tags'],
                'status' => ProductStatus::Active,
                'approval_status' => ApprovalStatus::Approved,
                'rating' => $data['rating'],
                'is_featured' => in_array('top', $data['tags'], true),
            ]);

            foreach ($data['gallery'] as $i => $image) {
                $product->images()->create([
                    'image' => $image,
                    'sort_order' => $i,
                    'is_primary' => $i === 0,
                ]);
            }

            foreach ($data['sizes'] as $size) {
                foreach ($data['colors'] as $color) {
                    $product->variants()->create([
                        'sku' => strtoupper($data['id'].'-'.Str::slug($size).'-'.ltrim($color, '#')),
                        'size' => $size,
                        'color' => $color,
                        'price' => null,
                        'stock' => 25,
                    ]);
                }
            }
        }

        // --- A pending product to exercise the approval workflow ---
        $pending = Product::create([
            'vendor_id' => $vendors[0]->id,
            'category_id' => $categories['Hoodie']->id,
            'name' => 'Essential Pullover Hoodie',
            'slug' => 'essential-pullover-hoodie',
            'description' => 'A cozy fleece-lined pullover hoodie awaiting admin approval.',
            'price' => 150,
            'discount' => 0,
            'style' => 'Casual',
            'tags' => ['new'],
            'status' => ProductStatus::Active,
            'approval_status' => ApprovalStatus::Pending,
        ]);
        $pending->images()->create(['image' => '/images/product4.webp', 'sort_order' => 0, 'is_primary' => true]);
        foreach (['Small', 'Medium', 'Large'] as $size) {
            $pending->variants()->create(['sku' => strtoupper('hoodie-'.$size), 'size' => $size, 'color' => '#000000', 'stock' => 10]);
        }

        // --- Coupons ---
        Coupon::create([
            'code' => 'WELCOME10',
            'type' => CouponType::Percentage,
            'value' => 10,
            'minimum_order_amount' => 100,
            'maximum_discount' => 50,
            'expires_at' => now()->addYear(),
            'status' => GeneralStatus::Active,
        ]);
        Coupon::create([
            'code' => 'SAVE20',
            'type' => CouponType::Fixed,
            'value' => 20,
            'minimum_order_amount' => 150,
            'expires_at' => now()->addYear(),
            'status' => GeneralStatus::Active,
        ]);
    }
}
