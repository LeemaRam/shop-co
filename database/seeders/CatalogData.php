<?php

namespace Database\Seeders;

/**
 * Product catalog mirrored from the React frontend (frontend/src/data/products.js).
 *
 * Image paths are preserved exactly as the frontend references them so that the
 * existing, Figma-verified UI renders identically when powered by the API. The two
 * products that intentionally reuse another product's image in the frontend
 * (faded-skinny-jeans -> skinny_jeans.webp, black-striped-tshirt -> sleeve_striped_t_shirt.webp)
 * keep that mapping unchanged.
 */
class CatalogData
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public static function products(): array
    {
        return [
            [
                'id' => 'tshirt-tape-details', 'name' => 'T-shirt with Tape Details',
                'gallery' => ['/images/T_Shirt_Black.webp'], 'price' => 120, 'oldPrice' => null, 'discount' => 0,
                'rating' => 4.5, 'colors' => ['#4F4631', '#314F4A', '#31344F'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'T-shirts',
                'tags' => ['new'], 'description' => 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
            ],
            [
                'id' => 'skinny-fit-jeans', 'name' => 'Skinny Fit Jeans',
                'gallery' => ['/images/skinny_jeans.webp'], 'price' => 240, 'oldPrice' => 260, 'discount' => 20,
                'rating' => 3.5, 'colors' => ['#31344F', '#4F4631', '#000000'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'Jeans',
                'tags' => ['new'], 'description' => 'A timeless pair of skinny fit jeans made from premium stretch denim for all-day comfort and a sharp silhouette.',
            ],
            [
                'id' => 'checkered-shirt', 'name' => 'Checkered Shirt',
                'gallery' => ['/images/checkered_shirt.webp'], 'price' => 180, 'oldPrice' => null, 'discount' => 0,
                'rating' => 4.5, 'colors' => ['#7B2D2D', '#31344F', '#4F4631'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'Shirts',
                'tags' => ['new'], 'description' => 'A classic checkered shirt tailored for a relaxed fit. Perfect layered or worn on its own for a smart casual look.',
            ],
            [
                'id' => 'sleeve-striped-tshirt', 'name' => 'Sleeve Striped T-shirt',
                'gallery' => ['/images/sleeve_striped_t_shirt.webp'], 'price' => 130, 'oldPrice' => 160, 'discount' => 30,
                'rating' => 4.5, 'colors' => ['#D96E30', '#31344F', '#000000'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'T-shirts',
                'tags' => ['new'], 'description' => 'A bold striped-sleeve t-shirt combining sporty contrast panels with everyday comfort.',
            ],
            [
                'id' => 'vertical-striped-shirt', 'name' => 'Vertical Striped Shirt',
                'gallery' => ['/images/vertical_striped_shirt.webp'], 'price' => 212, 'oldPrice' => 232, 'discount' => 20,
                'rating' => 5.0, 'colors' => ['#4F6231', '#31344F', '#000000'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Formal', 'category' => 'Shirts',
                'tags' => ['top'], 'description' => 'An elegant vertical striped shirt crafted from breathable cotton, ideal for both office and evening wear.',
            ],
            [
                'id' => 'courage-graphic-tshirt', 'name' => 'Courage Graphic T-shirt',
                'gallery' => ['/images/courage_graphic_t_shirt.webp'], 'price' => 145, 'oldPrice' => null, 'discount' => 0,
                'rating' => 4.0, 'colors' => ['#D96E30', '#000000', '#31344F'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'T-shirts',
                'tags' => ['top'], 'description' => 'Make a statement with this vibrant graphic t-shirt featuring an expressive hand-drawn print.',
            ],
            [
                'id' => 'loose-fit-bermuda-shorts', 'name' => 'Loose Fit Bermuda Shorts',
                'gallery' => ['/images/loose_fit_barmuda_shorts.webp'], 'price' => 80, 'oldPrice' => null, 'discount' => 0,
                'rating' => 3.0, 'colors' => ['#31344F', '#4F4631', '#000000'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'Shorts',
                'tags' => ['top'], 'description' => 'Relaxed loose-fit bermuda shorts made from lightweight denim, perfect for warm-weather days.',
            ],
            [
                'id' => 'faded-skinny-jeans', 'name' => 'Faded Skinny Jeans',
                'gallery' => ['/images/skinny_jeans.webp'], 'price' => 210, 'oldPrice' => null, 'discount' => 0,
                'rating' => 4.5, 'colors' => ['#000000', '#31344F', '#4F4631'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'Jeans',
                'tags' => ['top'], 'description' => 'Faded-wash skinny jeans with a comfortable stretch and a modern tapered leg.',
            ],
            [
                'id' => 'gradient-graphic-tshirt', 'name' => 'Gradient Graphic T-shirt',
                'gallery' => ['/images/product3.webp'], 'price' => 145, 'oldPrice' => null, 'discount' => 0,
                'rating' => 3.5, 'colors' => ['#FFFFFF', '#31344F', '#000000'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'T-shirts',
                'tags' => ['shop'], 'description' => 'A soft gradient graphic t-shirt with a striking watercolour print that stands out from the crowd.',
            ],
            [
                'id' => 'polo-tipping-details', 'name' => 'Polo with Tipping Details',
                'gallery' => ['/images/product2.webp'], 'price' => 180, 'oldPrice' => null, 'discount' => 0,
                'rating' => 4.5, 'colors' => ['#7B2D2D', '#31344F', '#4F4631'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Formal', 'category' => 'Shirts',
                'tags' => ['shop'], 'description' => 'A refined polo shirt finished with contrast tipping on the collar and cuffs for a sharp, sporty look.',
            ],
            [
                'id' => 'black-striped-tshirt', 'name' => 'Black Striped T-shirt',
                'gallery' => ['/images/sleeve_striped_t_shirt.webp'], 'price' => 120, 'oldPrice' => 150, 'discount' => 30,
                'rating' => 5.0, 'colors' => ['#000000', '#31344F', '#4F4631'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'T-shirts',
                'tags' => ['shop'], 'description' => 'A crisp black-and-white striped t-shirt cut for an easy, everyday fit.',
            ],
            [
                'id' => 'one-life-graphic-tshirt', 'name' => 'One Life Graphic T-shirt',
                'gallery' => [
                    '/images/one_graphic_t_shirt_img1.webp',
                    '/images/one_graphic_t_shirt_img2.webp',
                    '/images/one_graphic_t_shirt_img3.webp',
                ],
                'price' => 260, 'oldPrice' => 300, 'discount' => 40, 'rating' => 4.5,
                'colors' => ['#4F4631', '#314F4A', '#31344F'],
                'sizes' => ['Small', 'Medium', 'Large', 'X-Large'], 'style' => 'Casual', 'category' => 'T-shirts',
                'tags' => ['shop', 'top'], 'description' => 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
            ],
        ];
    }

    /**
     * @return array<int, array{name: string, image: ?string}>
     */
    public static function categories(): array
    {
        return [
            ['name' => 'T-shirts', 'image' => null],
            ['name' => 'Shorts', 'image' => null],
            ['name' => 'Shirts', 'image' => null],
            ['name' => 'Hoodie', 'image' => null],
            ['name' => 'Jeans', 'image' => null],
        ];
    }
}
