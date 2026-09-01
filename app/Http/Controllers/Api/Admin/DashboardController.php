<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ApprovalStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success([
            'users' => User::count(),
            'customers' => User::where('role', UserRole::Customer)->count(),
            'vendors' => Vendor::count(),
            'products' => Product::count(),
            'pendingProducts' => Product::where('approval_status', ApprovalStatus::Pending)->count(),
            'orders' => Order::count(),
            'revenue' => round((float) Order::sum('total'), 2),
        ], 'Admin dashboard retrieved successfully');
    }
}
