<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->whenLoaded('product');
        $variant = $this->whenLoaded('variant');

        $image = $this->relationLoaded('product') && $this->product?->relationLoaded('images')
            ? ($this->product->images->firstWhere('is_primary', true)?->image ?? $this->product->images->first()?->image)
            : null;

        return [
            'id' => $this->id,
            'productId' => $this->product_id,
            'slug' => $this->relationLoaded('product') ? $this->product?->slug : null,
            'name' => $this->relationLoaded('product') ? $this->product?->name : null,
            'image' => $image,
            'variantId' => $this->product_variant_id,
            'size' => $this->relationLoaded('variant') ? $this->variant?->size : null,
            'color' => $this->relationLoaded('variant') ? $this->variant?->color : null,
            'price' => (float) $this->price,
            'quantity' => (int) $this->quantity,
            'lineTotal' => round((float) $this->price * $this->quantity, 2),
        ];
    }
}
