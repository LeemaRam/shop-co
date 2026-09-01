<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Coupon\StoreCouponRequest;
use App\Http\Requests\Coupon\UpdateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class CouponController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $coupons = Coupon::latest()->paginate(20);

        return $this->success(
            CouponResource::collection($coupons),
            'Coupons retrieved successfully',
            200,
            ['meta' => [
                'current_page' => $coupons->currentPage(),
                'last_page' => $coupons->lastPage(),
                'per_page' => $coupons->perPage(),
                'total' => $coupons->total(),
            ]]
        );
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['code'] = strtoupper($data['code']);
        $data['status'] = $data['status'] ?? 'active';

        $coupon = Coupon::create($data);

        return $this->success(new CouponResource($coupon), 'Coupon created successfully', 201);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $coupon->update($data);

        return $this->success(new CouponResource($coupon->fresh()), 'Coupon updated successfully');
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return $this->success(null, 'Coupon deleted successfully');
    }
}
