<?php

namespace App\Http\Controllers\Api;

use App\Enums\GeneralStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $categories = Category::where('status', GeneralStatus::Active)
            ->withCount(['products' => fn ($q) => $q->published()])
            ->orderBy('name')
            ->get();

        return $this->success(CategoryResource::collection($categories), 'Categories retrieved successfully');
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        return $this->success(new CategoryResource($category), 'Category retrieved successfully');
    }

    public function products(string $slug, Request $request): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $perPage = min((int) $request->input('per_page', 12), 60);
        $products = $category->products()
            ->published()
            ->with(['category', 'vendor', 'images', 'variants'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return $this->success(
            ProductResource::collection($products),
            'Category products retrieved successfully',
            200,
            ['meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]]
        );
    }
}
