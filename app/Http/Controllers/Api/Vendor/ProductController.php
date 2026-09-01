<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Enums\ApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductWriter;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ProductWriter $writer) {}

    public function index(Request $request): JsonResponse
    {
        $products = $request->user()->vendor->products()
            ->with(['category', 'images', 'variants'])
            ->latest()
            ->paginate(15);

        return $this->success(
            ProductResource::collection($products),
            'Vendor products retrieved successfully',
            200,
            ['meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]]
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $vendor = $request->user()->vendor;
        $data = $request->validated();

        $product = DB::transaction(function () use ($vendor, $data) {
            $product = Product::create([
                'vendor_id' => $vendor->id,
                'category_id' => $data['category_id'] ?? null,
                'name' => $data['name'],
                'slug' => $this->writer->uniqueSlug($data['name']),
                'description' => $data['description'] ?? null,
                'price' => $data['price'],
                'compare_at_price' => $data['compare_at_price'] ?? null,
                'discount' => $data['discount'] ?? 0,
                'style' => $data['style'] ?? null,
                'tags' => $data['tags'] ?? [],
                'status' => $data['status'] ?? 'active',
                'approval_status' => ApprovalStatus::Pending,
            ]);

            $this->writer->syncImages($product, $data['images'] ?? []);
            $this->writer->syncVariants($product, $data['variants'] ?? []);

            return $product;
        });

        return $this->success(
            new ProductResource($product->load(['category', 'images', 'variants'])),
            'Product created and submitted for approval',
            201
        );
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        $this->authorizeVendor($request, $product);

        return $this->success(
            new ProductResource($product->load(['category', 'images', 'variants'])),
            'Product retrieved successfully'
        );
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorizeVendor($request, $product);
        $data = $request->validated();

        DB::transaction(function () use ($product, $data) {
            $payload = collect($data)->only([
                'category_id', 'name', 'description', 'price', 'compare_at_price',
                'discount', 'style', 'tags', 'status',
            ])->toArray();

            // Any content change re-enters the approval queue.
            $payload['approval_status'] = ApprovalStatus::Pending;
            $payload['rejection_reason'] = null;

            $product->update($payload);

            if (array_key_exists('images', $data)) {
                $this->writer->syncImages($product, $data['images'] ?? []);
            }

            if (array_key_exists('variants', $data)) {
                $this->writer->syncVariants($product, $data['variants'] ?? []);
            }
        });

        return $this->success(
            new ProductResource($product->fresh()->load(['category', 'images', 'variants'])),
            'Product updated and resubmitted for approval'
        );
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->authorizeVendor($request, $product);
        $product->delete();

        return $this->success(null, 'Product deleted successfully');
    }

    private function authorizeVendor(Request $request, Product $product): void
    {
        abort_if($product->vendor_id !== $request->user()->vendor->id, 403, 'This action is unauthorized.');
    }
}
