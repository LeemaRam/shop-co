<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type->value,
            'value' => (float) $this->value,
            'minimumOrderAmount' => $this->minimum_order_amount !== null ? (float) $this->minimum_order_amount : null,
            'maximumDiscount' => $this->maximum_discount !== null ? (float) $this->maximum_discount : null,
            'startsAt' => $this->starts_at?->toIso8601String(),
            'expiresAt' => $this->expires_at?->toIso8601String(),
            'usageLimit' => $this->usage_limit,
            'usedCount' => (int) $this->used_count,
            'status' => $this->status->value,
        ];
    }
}
