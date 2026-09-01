<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponse;

    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:60'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::where('code', strtoupper($data['code']))->first();

        if (! $coupon) {
            return $this->error('Invalid coupon code.', 422);
        }

        if ($error = $coupon->validationError((float) $data['subtotal'])) {
            return $this->error($error, 422);
        }

        return $this->success([
            'code' => $coupon->code,
            'discount' => $coupon->discountFor((float) $data['subtotal']),
        ], 'Coupon applied successfully');
    }
}
