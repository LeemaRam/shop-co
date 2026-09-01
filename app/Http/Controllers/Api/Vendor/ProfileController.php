<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Resources\VendorResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        return $this->success(
            new VendorResource($request->user()->vendor->load('user')),
            'Vendor profile retrieved successfully'
        );
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'store_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'logo' => ['nullable', 'string', 'max:2048'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $vendor = $request->user()->vendor;
        $vendor->update($data);

        return $this->success(new VendorResource($vendor->fresh()->load('user')), 'Vendor profile updated successfully');
    }
}
