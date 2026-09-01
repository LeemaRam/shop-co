<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = $this->whenLoaded('images');
        $variants = $this->whenLoaded('variants');

        $gallery = $this->relationLoaded('images')
            ? $this->images->pluck('image')->all()
            : [];

        $primary = $this->relationLoaded('images')
            ? ($this->images->firstWhere('is_primary', true)?->image ?? $this->images->first()?->image)
            : null;

        $colors = $this->relationLoaded('variants')
            ? $this->variants->pluck('color')->filter()->unique()->values()->all()
            : [];

        $sizes = $this->relationLoaded('variants')
            ? $this->variants->pluck('size')->filter()->unique()->values()->all()
            : [];

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'image' => $primary,
            'gallery' => $gallery,
            'price' => (float) $this->price,
            'oldPrice' => $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            'discount' => (int) $this->discount,
            'rating' => (float) $this->rating,
            'reviewsCount' => (int) $this->reviews_count,
            'colors' => $colors,
            'sizes' => $sizes,
            'style' => $this->style,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'categoryId' => $this->category_id,
            'tags' => $this->tags ?? [],
            'description' => $this->description,
            'status' => $this->status->value,
            'approvalStatus' => $this->approval_status->value,
            'rejectionReason' => $this->rejection_reason,
            'stock' => $this->relationLoaded('variants')
                ? (int) $this->variants->sum('stock')
                : null,
            'createdAt' => $this->created_at?->toIso8601String(),
            'vendor' => $this->whenLoaded('vendor', fn () => [
                'id' => $this->vendor?->id,
                'name' => $this->vendor?->store_name,
                'slug' => $this->vendor?->slug,
            ]),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
