<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Wishlist;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $wishlist = Wishlist::firstOrCreate(['user_id' => $request->user()->id]);

        $products = Product::whereIn('id', $wishlist->items()->pluck('product_id'))
            ->with(['category', 'vendor', 'images', 'variants'])
            ->get();

        return $this->success(ProductResource::collection($products), 'Wishlist retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $wishlist = Wishlist::firstOrCreate(['user_id' => $request->user()->id]);

        $wishlist->items()->firstOrCreate(['product_id' => $data['product_id']]);

        return $this->success(null, 'Product added to wishlist', 201);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $wishlist = Wishlist::firstOrCreate(['user_id' => $request->user()->id]);

        $wishlist->items()->where('product_id', $product->id)->delete();

        return $this->success(null, 'Product removed from wishlist');
    }
}
