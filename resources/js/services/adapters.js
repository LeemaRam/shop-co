// Small transformation layer between the Laravel API responses and the shapes
// the existing (Figma-verified) React components already expect. Keeping these
// mappings centralized means the UI components stay untouched.

// Image paths returned by the API are root-relative (e.g. "/images/foo.webp")
// and are served from the frontend's own public/ folder, exactly like before —
// so absolute URLs pass through and relative paths are returned unchanged.
export function resolveImageUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return path
}

// The frontend routes and keys products by `id`, which historically held the
// slug. We preserve that contract by mapping the API slug onto `id`, while
// exposing the numeric id as `productId` for cart/wishlist API calls.
export function adaptProduct(p) {
  if (!p) return null
  const gallery = (p.gallery && p.gallery.length ? p.gallery : [p.image]).filter(Boolean)
  return {
    id: p.slug,
    slug: p.slug,
    productId: p.id,
    name: p.name,
    image: resolveImageUrl(p.image || gallery[0]),
    gallery: gallery.map(resolveImageUrl),
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    discount: p.discount ?? 0,
    rating: p.rating ?? 0,
    reviewsCount: p.reviewsCount ?? 0,
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    style: p.style ?? null,
    category: p.category ?? null,
    tags: p.tags ?? [],
    description: p.description ?? '',
    variants: p.variants ?? [],
  }
}

export function adaptProducts(list = []) {
  return list.map(adaptProduct)
}

// Maps an API review to the shape used by the existing ReviewCard component.
export function adaptReview(r) {
  return {
    id: r.id,
    name: r.name || 'Anonymous',
    rating: r.rating,
    date: r.date,
    text: r.comment ?? '',
  }
}

// Maps an API cart item to the shape used by the existing Cart UI.
export function adaptCartItem(it) {
  return {
    uid: String(it.id),
    id: it.id,
    productId: it.productId,
    slug: it.slug,
    name: it.name,
    image: resolveImageUrl(it.image),
    size: it.size,
    color: it.color,
    price: it.price,
    quantity: it.quantity,
    variantId: it.variantId,
  }
}
