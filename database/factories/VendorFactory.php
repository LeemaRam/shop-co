<?php

namespace Database\Factories;

use App\Enums\GeneralStatus;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    protected $model = Vendor::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'user_id' => User::factory()->vendor(),
            'store_name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'description' => fake()->sentence(12),
            'phone' => fake()->phoneNumber(),
            'status' => GeneralStatus::Active,
        ];
    }
}
