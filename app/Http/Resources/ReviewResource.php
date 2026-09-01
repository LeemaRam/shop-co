<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => (int) $this->rating,
            'comment' => $this->comment,
            'name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product?->id,
                'name' => $this->product?->name,
                'slug' => $this->product?->slug,
            ]),
            'date' => $this->created_at?->format('F j, Y'),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
