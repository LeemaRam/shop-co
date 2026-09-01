<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class VendorController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $vendors = Vendor::with('user')
            ->withCount('products')
            ->latest()
            ->paginate(20);

        return $this->success(
            VendorResource::collection($vendors),
            'Vendors retrieved successfully',
            200,
            ['meta' => [
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
                'per_page' => $vendors->perPage(),
                'total' => $vendors->total(),
            ]]
        );
    }
}
