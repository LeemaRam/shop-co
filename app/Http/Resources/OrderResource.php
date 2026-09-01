<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
            ],
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'shipping' => (float) $this->shipping,
            'total' => (float) $this->total,
            'status' => $this->status->value,
            'paymentStatus' => $this->payment_status->value,
            'shippingAddress' => $this->shipping_address,
            'billingAddress' => $this->billing_address,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
