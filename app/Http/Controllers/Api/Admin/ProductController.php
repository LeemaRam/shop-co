<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\RejectProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->when($request->filled('approval_status'), fn ($q) => $q->where('approval_status', $request->input('approval_status')))
            ->when($request->filled('vendor_id'), fn ($q) => $q->where('vendor_id', $request->input('vendor_id')))
            ->with(['category', 'vendor', 'images', 'variants'])
            ->latest()
            ->paginate(20);

        return $this->success(
            ProductResource::collection($products),
            'Products retrieved successfully',
            200,
            ['meta' => $this->meta($products)]
        );
    }

    public function pending(): JsonResponse
    {
        $products = Product::where('approval_status', ApprovalStatus::Pending)
            ->with(['category', 'vendor', 'images', 'variants'])
            ->latest()
            ->paginate(20);

        return $this->success(
            ProductResource::collection($products),
            'Pending products retrieved successfully',
            200,
            ['meta' => $this->meta($products)]
        );
    }

    public function approve(Product $product): JsonResponse
    {
        $product->update([
            'approval_status' => ApprovalStatus::Approved,
            'rejection_reason' => null,
        ]);

        return $this->success(
            new ProductResource($product->load(['category', 'vendor', 'images', 'variants'])),
            'Product approved successfully'
        );
    }

    public function reject(RejectProductRequest $request, Product $product): JsonResponse
    {
        $product->update([
            'approval_status' => ApprovalStatus::Rejected,
            'rejection_reason' => $request->string('reason'),
        ]);

        return $this->success(
            new ProductResource($product->load(['category', 'vendor', 'images', 'variants'])),
            'Product rejected successfully'
        );
    }

    private function meta($paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
