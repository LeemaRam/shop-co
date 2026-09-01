<?php

namespace App\Http\Requests\Coupon;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['sometimes', 'required', 'string', 'max:60', Rule::unique('coupons', 'code')->ignore($this->route('coupon'))],
            'type' => ['sometimes', 'required', Rule::in(['percentage', 'fixed'])],
            'value' => ['sometimes', 'required', 'numeric', 'min:0'],
            'minimum_order_amount' => ['nullable', 'numeric', 'min:0'],
            'maximum_discount' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ];
    }
}
