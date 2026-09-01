<?php

namespace App\Models;

use App\Enums\ApprovalStatus;
use App\Enums\ProductStatus;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'compare_at_price',
        'discount',
        'style',
        'tags',
        'status',
        'approval_status',
        'rejection_reason',
        'rating',
        'reviews_count',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'rating' => 'decimal:2',
            'tags' => 'array',
            'is_featured' => 'boolean',
            'status' => ProductStatus::class,
            'approval_status' => ApprovalStatus::class,
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope products that are publicly visible in the customer catalog.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('approval_status', ApprovalStatus::Approved)
            ->where('status', ProductStatus::Active);
    }

    public function recalculateRating(): void
    {
        $approved = $this->reviews()->where('is_approved', true);
        $this->rating = round((float) $approved->avg('rating'), 2);
        $this->reviews_count = $approved->count();
        $this->save();
    }
}
