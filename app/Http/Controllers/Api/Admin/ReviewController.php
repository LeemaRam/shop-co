<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $reviews = Review::query()
            ->when($request->filled('product_id'), fn ($q) => $q->where('product_id', $request->input('product_id')))
            ->with(['user', 'product'])
            ->latest()
            ->paginate(20);

        return $this->success(
            ReviewResource::collection($reviews),
            'Reviews retrieved successfully',
            200,
            ['meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ]]
        );
    }

    public function destroy(Review $review): JsonResponse
    {
        $product = $review->product;
        $review->delete();
        $product?->recalculateRating();

        return $this->success(null, 'Review deleted successfully');
    }
}
