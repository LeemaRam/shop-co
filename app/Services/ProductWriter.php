<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Str;

class ProductWriter
{
    /**
     * Sync images from a request payload, replacing existing images when provided.
     *
     * @param  array<int, array{image: string, is_primary?: bool}>  $images
     */
    public function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach (array_values($images) as $index => $image) {
            $product->images()->create([
                'image' => $image['image'],
                'sort_order' => $index,
                'is_primary' => (bool) ($image['is_primary'] ?? $index === 0),
            ]);
        }
    }

    /**
     * Sync variants from a request payload, replacing existing variants when provided.
     *
     * @param  array<int, array{size?: string, color?: string, price?: float, stock?: int}>  $variants
     */
    public function syncVariants(Product $product, array $variants): void
    {
        $product->variants()->delete();

        foreach ($variants as $variant) {
            $product->variants()->create([
                'sku' => strtoupper($product->slug.'-'.Str::random(4)),
                'size' => $variant['size'] ?? null,
                'color' => $variant['color'] ?? null,
                'price' => $variant['price'] ?? null,
                'stock' => $variant['stock'] ?? 0,
            ]);
        }
    }

    public function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $i = 1;

        while (Product::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
