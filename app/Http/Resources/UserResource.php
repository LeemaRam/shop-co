<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'createdAt' => $this->created_at?->toIso8601String(),
            'vendor' => $this->whenLoaded('vendor', fn () => $this->vendor ? [
                'id' => $this->vendor->id,
                'storeName' => $this->vendor->store_name,
                'slug' => $this->vendor->slug,
            ] : null),
        ];
    }
}
