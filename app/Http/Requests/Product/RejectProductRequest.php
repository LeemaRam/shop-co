<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class RejectProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
