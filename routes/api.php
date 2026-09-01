<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\Vendor;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public authentication
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('register/vendor', [AuthController::class, 'registerVendor']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

/*
|--------------------------------------------------------------------------
| Public catalog
|--------------------------------------------------------------------------
*/
Route::get('products', [ProductController::class, 'index']);
Route::get('products/featured', [ProductController::class, 'featured']);
Route::get('products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('products/sale', [ProductController::class, 'sale']);
Route::get('products/{slug}', [ProductController::class, 'show']);
Route::get('products/{slug}/reviews', [ProductController::class, 'reviews']);

Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{slug}', [CategoryController::class, 'show']);
Route::get('categories/{slug}/products', [CategoryController::class, 'products']);

Route::post('coupons/validate', [CouponController::class, 'validateCode']);

/*
|--------------------------------------------------------------------------
| Cart (guest + authenticated; guests identify via X-Cart-Token header)
|--------------------------------------------------------------------------
*/
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'show']);
    Route::post('items', [CartController::class, 'store']);
    Route::patch('items/{item}', [CartController::class, 'update']);
    Route::delete('items/{item}', [CartController::class, 'destroy']);
    Route::delete('/', [CartController::class, 'clear']);
});

// Guest checkout is permitted; authenticated checkout attaches the user.
Route::post('checkout', [OrderController::class, 'checkout']);

/*
|--------------------------------------------------------------------------
| Authenticated customer
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);

    Route::get('wishlist', [WishlistController::class, 'index']);
    Route::post('wishlist/items', [WishlistController::class, 'store']);
    Route::delete('wishlist/items/{product:id}', [WishlistController::class, 'destroy']);

    Route::post('products/{product}/reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Vendor
|--------------------------------------------------------------------------
*/
Route::prefix('vendor')->middleware(['auth:sanctum', 'role:vendor'])->group(function () {
    Route::get('dashboard', [Vendor\DashboardController::class, 'index']);

    Route::get('products', [Vendor\ProductController::class, 'index']);
    Route::post('products', [Vendor\ProductController::class, 'store']);
    Route::get('products/{product:id}', [Vendor\ProductController::class, 'show']);
    Route::put('products/{product:id}', [Vendor\ProductController::class, 'update']);
    Route::delete('products/{product:id}', [Vendor\ProductController::class, 'destroy']);

    Route::get('orders', [Vendor\OrderController::class, 'index']);
    Route::get('orders/{order}', [Vendor\OrderController::class, 'show']);
    Route::patch('orders/{order}/status', [Vendor\OrderController::class, 'updateStatus']);

    Route::get('profile', [Vendor\ProfileController::class, 'show']);
    Route::put('profile', [Vendor\ProfileController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('dashboard', [Admin\DashboardController::class, 'index']);

    Route::get('users', [Admin\UserController::class, 'index']);
    Route::get('vendors', [Admin\VendorController::class, 'index']);

    Route::get('products', [Admin\ProductController::class, 'index']);
    Route::get('products/pending', [Admin\ProductController::class, 'pending']);
    Route::patch('products/{product:id}/approve', [Admin\ProductController::class, 'approve']);
    Route::patch('products/{product:id}/reject', [Admin\ProductController::class, 'reject']);

    Route::get('orders', [Admin\OrderController::class, 'index']);
    Route::get('orders/{order}', [Admin\OrderController::class, 'show']);
    Route::patch('orders/{order}/status', [Admin\OrderController::class, 'updateStatus']);

    Route::get('categories', [Admin\CategoryController::class, 'index']);
    Route::post('categories', [Admin\CategoryController::class, 'store']);
    Route::put('categories/{category:id}', [Admin\CategoryController::class, 'update']);
    Route::delete('categories/{category:id}', [Admin\CategoryController::class, 'destroy']);

    Route::get('reviews', [Admin\ReviewController::class, 'index']);
    Route::delete('reviews/{review}', [Admin\ReviewController::class, 'destroy']);

    Route::get('coupons', [Admin\CouponController::class, 'index']);
    Route::post('coupons', [Admin\CouponController::class, 'store']);
    Route::put('coupons/{coupon}', [Admin\CouponController::class, 'update']);
    Route::delete('coupons/{coupon}', [Admin\CouponController::class, 'destroy']);
});
