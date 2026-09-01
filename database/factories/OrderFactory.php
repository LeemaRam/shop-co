<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $address = [
            'line1' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->stateAbbr(),
            'postal_code' => fake()->postcode(),
            'country' => 'USA',
        ];

        return [
            'user_id' => null,
            'coupon_id' => null,
            'order_number' => Order::generateOrderNumber(),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'subtotal' => 100,
            'discount' => 0,
            'shipping' => 15,
            'total' => 115,
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Pending,
            'shipping_address' => $address,
            'billing_address' => $address,
        ];
    }
}
