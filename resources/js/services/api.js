// Centralized API client for the whole Shop.co SPA (customer + vendor + admin).
// One origin: the app is served by Laravel, so the API base is relative (/api).
// Handles the Sanctum Bearer token and the guest cart token (X-Cart-Token).

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const CART_TOKEN_KEY = 'shopco_cart_token'
const AUTH_TOKEN_KEY = 'shopco_token'

function getCartToken() {
  let token = localStorage.getItem(CART_TOKEN_KEY)
  if (!token) {
    token =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`
    localStorage.setItem(CART_TOKEN_KEY, token)
  }
  return token
}

export function setToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

// Backwards-compatible aliases.
export const setAuthToken = setToken
export const getAuthToken = getToken

export function isAuthenticated() {
  return Boolean(getToken())
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  // Guests are identified with a persistent cart token so the cart survives reloads.
  if (!token) headers['X-Cart-Token'] = getCartToken()

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw Object.assign(new Error('Network error. Is the API server running?'), { status: 0 })
  }

  const payload = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw Object.assign(new Error(payload.message || 'Request failed'), {
      status: res.status,
      errors: payload.errors,
    })
  }

  return payload
}

// ---------------------------------------------------------------------------
// Customer / public storefront (default export)
// ---------------------------------------------------------------------------
export const api = {
  // Catalog
  products: (query = '') => request(`/products${query}`),
  product: (slug) => request(`/products/${slug}`),
  featured: () => request('/products/featured'),
  newArrivals: () => request('/products/new-arrivals'),
  sale: () => request('/products/sale'),
  productReviews: (slug) => request(`/products/${slug}/reviews`),
  categories: () => request('/categories'),
  categoryProducts: (slug, query = '') => request(`/categories/${slug}/products${query}`),

  // Cart
  cart: () => request('/cart'),
  addToCart: (item) => request('/cart/items', { method: 'POST', body: item }),
  updateCartItem: (id, quantity) => request(`/cart/items/${id}`, { method: 'PATCH', body: { quantity } }),
  removeCartItem: (id) => request(`/cart/items/${id}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),
  validateCoupon: (code, subtotal) => request('/coupons/validate', { method: 'POST', body: { code, subtotal } }),
  checkout: (data) => request('/checkout', { method: 'POST', body: data }),

  // Auth (shared by all roles)
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // Authenticated customer
  orders: () => request('/orders'),
  wishlist: () => request('/wishlist'),
  addToWishlist: (productId) => request('/wishlist/items', { method: 'POST', body: { product_id: productId } }),
  removeFromWishlist: (productId) => request(`/wishlist/items/${productId}`, { method: 'DELETE' }),
}

// ---------------------------------------------------------------------------
// Vendor portal
// ---------------------------------------------------------------------------
export const vendorApi = {
  dashboard: () => request('/vendor/dashboard'),
  products: (query = '') => request(`/vendor/products${query}`),
  product: (id) => request(`/vendor/products/${id}`),
  createProduct: (data) => request('/vendor/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/vendor/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/vendor/products/${id}`, { method: 'DELETE' }),
  orders: (query = '') => request(`/vendor/orders${query}`),
  order: (id) => request(`/vendor/orders/${id}`),
  updateOrderStatus: (id, status) => request(`/vendor/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  profile: () => request('/vendor/profile'),
  updateProfile: (data) => request('/vendor/profile', { method: 'PUT', body: data }),
}

// ---------------------------------------------------------------------------
// Admin portal
// ---------------------------------------------------------------------------
export const adminApi = {
  dashboard: () => request('/admin/dashboard'),
  users: (query = '') => request(`/admin/users${query}`),
  vendors: (query = '') => request(`/admin/vendors${query}`),
  products: (query = '') => request(`/admin/products${query}`),
  pendingProducts: (query = '') => request(`/admin/products/pending${query}`),
  approveProduct: (id) => request(`/admin/products/${id}/approve`, { method: 'PATCH' }),
  rejectProduct: (id, reason) => request(`/admin/products/${id}/reject`, { method: 'PATCH', body: { reason } }),
  orders: (query = '') => request(`/admin/orders${query}`),
  order: (id) => request(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  categories: () => request('/admin/categories'),
  createCategory: (data) => request('/admin/categories', { method: 'POST', body: data }),
  updateCategory: (id, data) => request(`/admin/categories/${id}`, { method: 'PUT', body: data }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
  reviews: (query = '') => request(`/admin/reviews${query}`),
  deleteReview: (id) => request(`/admin/reviews/${id}`, { method: 'DELETE' }),
  coupons: (query = '') => request(`/admin/coupons${query}`),
  createCoupon: (data) => request('/admin/coupons', { method: 'POST', body: data }),
  updateCoupon: (id, data) => request(`/admin/coupons/${id}`, { method: 'PUT', body: data }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),
}

export default api
