<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'storeName' => $this->store_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo,
            'phone' => $this->phone,
            'status' => $this->status->value,
            'productsCount' => $this->when(isset($this->products_count), fn () => (int) $this->products_count),
            'owner' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ]),
        ];
    }
}
