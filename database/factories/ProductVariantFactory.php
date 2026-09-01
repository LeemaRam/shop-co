<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => strtoupper(Str::random(8)),
            'size' => fake()->randomElement(['Small', 'Medium', 'Large', 'X-Large']),
            'color' => fake()->hexColor(),
            'price' => null,
            'stock' => fake()->numberBetween(0, 50),
        ];
    }
}
