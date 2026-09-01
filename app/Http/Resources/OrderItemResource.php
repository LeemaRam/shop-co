<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'productId' => $this->product_id,
            'vendorId' => $this->vendor_id,
            'name' => $this->product_name,
            'variant' => $this->variant_label,
            'quantity' => (int) $this->quantity,
            'unitPrice' => (float) $this->unit_price,
            'total' => (float) $this->total,
        ];
    }
}
