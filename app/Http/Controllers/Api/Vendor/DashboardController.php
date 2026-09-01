<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Enums\ApprovalStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;

        $productStats = $vendor->products()
            ->selectRaw('approval_status, count(*) as total')
            ->groupBy('approval_status')
            ->pluck('total', 'approval_status');

        $revenue = $vendor->orderItems()
            ->whereHas('order', fn ($q) => $q->whereNotIn('status', [OrderStatus::Cancelled->value]))
            ->sum('total');

        return $this->success([
            'products' => [
                'total' => $vendor->products()->count(),
                'approved' => (int) ($productStats[ApprovalStatus::Approved->value] ?? 0),
                'pending' => (int) ($productStats[ApprovalStatus::Pending->value] ?? 0),
                'rejected' => (int) ($productStats[ApprovalStatus::Rejected->value] ?? 0),
            ],
            'orderItems' => $vendor->orderItems()->count(),
            'revenue' => round((float) $revenue, 2),
        ], 'Vendor dashboard retrieved successfully');
    }
}
