<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items');
        $subtotal = $this->relationLoaded('items')
            ? $this->items->sum(fn ($item) => (float) $item->price * $item->quantity)
            : 0;

        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'itemsCount' => $this->relationLoaded('items') ? $this->items->sum('quantity') : 0,
            'subtotal' => round($subtotal, 2),
        ];
    }
}
