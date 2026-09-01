<?php

namespace Database\Factories;

use App\Enums\CouponType;
use App\Enums\GeneralStatus;
use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(Str::random(8)),
            'type' => CouponType::Percentage,
            'value' => 10,
            'minimum_order_amount' => null,
            'maximum_discount' => null,
            'starts_at' => null,
            'expires_at' => now()->addMonth(),
            'usage_limit' => null,
            'used_count' => 0,
            'status' => GeneralStatus::Active,
        ];
    }
}
