import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'

// Customer storefront
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'

// Vendor portal
import VendorLayout from './layouts/VendorLayout'
import VendorDashboard from './pages/vendor/Dashboard'
import VendorProducts from './pages/vendor/Products'
import VendorProductCreate from './pages/vendor/ProductCreate'
import VendorProductEdit from './pages/vendor/ProductEdit'
import VendorOrders from './pages/vendor/Orders'
import VendorOrderDetail from './pages/vendor/OrderDetail'
import VendorProfile from './pages/vendor/Profile'

// Admin portal
import AdminLayout from './layouts/AdminLayout'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminVendors from './pages/admin/Vendors'
import AdminProducts from './pages/admin/Products'
import AdminPendingProducts from './pages/admin/PendingProducts'
import AdminOrders from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import AdminCategories from './pages/admin/Categories'
import AdminReviews from './pages/admin/Reviews'
import AdminCoupons from './pages/admin/Coupons'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Customer storefront */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:slug" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
        </Route>

        {/* Vendor portal */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute role="vendor">
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/create" element={<VendorProductCreate />} />
          <Route path="products/:id/edit" element={<VendorProductEdit />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="orders/:id" element={<VendorOrderDetail />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>

        {/* Admin portal */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin" loginPath="/admin/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/pending" element={<AdminPendingProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
