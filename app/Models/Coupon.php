<?php

namespace App\Models;

use App\Enums\CouponType;
use App\Enums\GeneralStatus;
use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'minimum_order_amount',
        'maximum_discount',
        'starts_at',
        'expires_at',
        'usage_limit',
        'used_count',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'minimum_order_amount' => 'decimal:2',
            'maximum_discount' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'type' => CouponType::class,
            'status' => GeneralStatus::class,
        ];
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Determine whether the coupon can currently be applied to the given subtotal.
     */
    public function validationError(float $subtotal): ?string
    {
        if ($this->status !== GeneralStatus::Active) {
            return 'This coupon is not active.';
        }

        $now = now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return 'This coupon is not yet valid.';
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return 'This coupon has expired.';
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return 'This coupon has reached its usage limit.';
        }

        if ($this->minimum_order_amount !== null && $subtotal < (float) $this->minimum_order_amount) {
            return 'Order total does not meet the minimum for this coupon.';
        }

        return null;
    }

    public function discountFor(float $subtotal): float
    {
        $discount = $this->type === CouponType::Percentage
            ? $subtotal * ((float) $this->value / 100)
            : (float) $this->value;

        if ($this->maximum_discount !== null) {
            $discount = min($discount, (float) $this->maximum_discount);
        }

        return round(min($discount, $subtotal), 2);
    }
}
