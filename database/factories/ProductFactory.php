<?php

namespace Database\Factories;

use App\Enums\ApprovalStatus;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $price = fake()->numberBetween(50, 300);

        return [
            'vendor_id' => Vendor::factory(),
            'category_id' => Category::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name).'-'.Str::random(5),
            'description' => fake()->paragraph(),
            'price' => $price,
            'compare_at_price' => null,
            'discount' => 0,
            'style' => fake()->randomElement(['Casual', 'Formal', 'Party', 'Gym']),
            'tags' => [],
            'status' => ProductStatus::Active,
            'approval_status' => ApprovalStatus::Approved,
            'rating' => 0,
            'reviews_count' => 0,
            'is_featured' => false,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['approval_status' => ApprovalStatus::Pending]);
    }

    public function approved(): static
    {
        return $this->state(fn () => ['approval_status' => ApprovalStatus::Approved]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => ['approval_status' => ApprovalStatus::Rejected]);
    }
}
