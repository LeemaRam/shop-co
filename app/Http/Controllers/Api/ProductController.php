<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->published()
            ->with(['category', 'vendor', 'images', 'variants']);

        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        $perPage = min((int) $request->input('per_page', 12), 60);
        $products = $query->paginate($perPage)->withQueryString();

        return $this->success(
            ProductResource::collection($products),
            'Products retrieved successfully',
            200,
            ['meta' => $this->paginationMeta($products)]
        );
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::published()
            ->with(['category', 'vendor', 'images', 'variants'])
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->success(new ProductResource($product), 'Product retrieved successfully');
    }

    public function featured(Request $request): JsonResponse
    {
        $products = Product::published()
            ->where('is_featured', true)
            ->with(['category', 'vendor', 'images', 'variants'])
            ->latest()
            ->take((int) $request->input('limit', 8))
            ->get();

        return $this->success(ProductResource::collection($products), 'Featured products retrieved successfully');
    }

    public function newArrivals(Request $request): JsonResponse
    {
        $products = Product::published()
            ->with(['category', 'vendor', 'images', 'variants'])
            ->latest()
            ->take((int) $request->input('limit', 8))
            ->get();

        return $this->success(ProductResource::collection($products), 'New arrivals retrieved successfully');
    }

    public function sale(Request $request): JsonResponse
    {
        $products = Product::published()
            ->where('discount', '>', 0)
            ->with(['category', 'vendor', 'images', 'variants'])
            ->latest()
            ->take((int) $request->input('limit', 8))
            ->get();

        return $this->success(ProductResource::collection($products), 'Sale products retrieved successfully');
    }

    public function reviews(string $slug): JsonResponse
    {
        $product = Product::published()->where('slug', $slug)->firstOrFail();

        $reviews = $product->reviews()
            ->where('is_approved', true)
            ->with('user')
            ->latest()
            ->paginate(10);

        return $this->success(
            ReviewResource::collection($reviews),
            'Reviews retrieved successfully',
            200,
            ['meta' => $this->paginationMeta($reviews)]
        );
    }

    protected function applyFilters($query, Request $request): void
    {
        $query->when($request->filled('category'), function ($q) use ($request) {
            $slug = $request->input('category');
            $q->whereHas('category', fn ($c) => $c->where('slug', $slug)->orWhere('name', $slug));
        });

        $query->when($request->filled('min_price'), fn ($q) => $q->where('price', '>=', (float) $request->input('min_price')));
        $query->when($request->filled('max_price'), fn ($q) => $q->where('price', '<=', (float) $request->input('max_price')));
        $query->when($request->filled('style'), fn ($q) => $q->where('style', $request->input('style')));
        $query->when($request->filled('rating'), fn ($q) => $q->where('rating', '>=', (float) $request->input('rating')));

        $query->when($request->filled('vendor'), function ($q) use ($request) {
            $vendor = $request->input('vendor');
            $q->whereHas('vendor', fn ($v) => $v->where('slug', $vendor));
        });

        $query->when($request->filled('size'), function ($q) use ($request) {
            $q->whereHas('variants', fn ($v) => $v->where('size', $request->input('size')));
        });

        $query->when($request->filled('color'), function ($q) use ($request) {
            $q->whereHas('variants', fn ($v) => $v->where('color', $request->input('color')));
        });

        $query->when($request->filled('search'), function ($q) use ($request) {
            $term = $request->input('search');
            $q->where(fn ($sub) => $sub->where('name', 'like', "%{$term}%")->orWhere('description', 'like', "%{$term}%"));
        });
    }

    protected function applySorting($query, Request $request): void
    {
        match ($request->input('sort')) {
            'price_low' => $query->orderBy('price'),
            'price_high' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('rating'),
            default => $query->latest(),
        };
    }

    protected function paginationMeta($paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
