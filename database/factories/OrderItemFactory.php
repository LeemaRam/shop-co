<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 3);
        $price = fake()->numberBetween(50, 200);

        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'vendor_id' => Vendor::factory(),
            'product_variant_id' => null,
            'product_name' => fake()->words(3, true),
            'variant_label' => 'Large / Black',
            'quantity' => $quantity,
            'unit_price' => $price,
            'total' => $price * $quantity,
        ];
    }
}
