<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    public function store(StoreReviewRequest $request, Product $product): JsonResponse
    {
        $user = $request->user();

        $hasPurchased = $product->orderItems()
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))
            ->exists();

        if (! $hasPurchased) {
            return $this->error('You can only review products you have purchased.', 403);
        }

        if ($product->reviews()->where('user_id', $user->id)->exists()) {
            return $this->error('You have already reviewed this product.', 422);
        }

        $review = $product->reviews()->create([
            'user_id' => $user->id,
            'rating' => $request->integer('rating'),
            'comment' => $request->input('comment'),
            'is_approved' => true,
        ]);

        $product->recalculateRating();

        return $this->success(new ReviewResource($review->load('user')), 'Review submitted successfully', 201);
    }

    public function update(StoreReviewRequest $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id) {
            return $this->error('Review not found.', 404);
        }

        $review->update([
            'rating' => $request->integer('rating'),
            'comment' => $request->input('comment'),
        ]);

        $review->product->recalculateRating();

        return $this->success(new ReviewResource($review->load('user')), 'Review updated successfully');
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id) {
            return $this->error('Review not found.', 404);
        }

        $product = $review->product;
        $review->delete();
        $product->recalculateRating();

        return $this->success(null, 'Review deleted successfully');
    }
}
