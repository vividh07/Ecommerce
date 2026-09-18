import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Shell } from './components/layout/Shell';
import { RequireAuth } from './components/auth/RequireAuth';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrdersPage } from './pages/OrdersPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#141a26',
                color: '#e8ecf4',
                border: '1px solid rgba(255,255,255,0.08)',
              },
            }}
          />
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<HomePage />} />
              <Route path="browse" element={<BrowsePage />} />
              <Route path="product/:productId" element={<ProductDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="cart" element={<RequireAuth><CartPage /></RequireAuth>} />
              <Route path="checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
              <Route path="orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
              <Route path="orders/confirmation/:orderId" element={<RequireAuth><OrderConfirmationPage /></RequireAuth>} />
              <Route path="seller" element={<RequireAuth><SellerDashboardPage /></RequireAuth>} />
              <Route path="admin" element={<RequireAuth><AdminDashboardPage /></RequireAuth>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
