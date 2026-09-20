import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Shell } from './components/layout/Shell';
import { RequireAuth } from './components/auth/RequireAuth';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { CartComparePage } from './pages/CartComparePage';
import { OrdersPage } from './pages/OrdersPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ShoppingRoomLobbyPage } from './pages/ShoppingRoomLobbyPage';
import { ShoppingRoomPage } from './pages/ShoppingRoomPage';
import { PostPurchaseDashboardPage } from './pages/PostPurchaseDashboardPage';
import { CheckoutAddressPage } from './pages/checkout/CheckoutAddressPage';
import { CheckoutPaymentPage } from './pages/checkout/CheckoutPaymentPage';
import { AccountSettingsPage } from './pages/account/AccountSettingsPage';
import { AddressesPage } from './pages/account/AddressesPage';
import { ReturnRequestPage } from './pages/account/ReturnRequestPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HelpPage } from './pages/HelpPage';
import { ShippingReturnsPage } from './pages/ShippingReturnsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage, TermsPage } from './pages/LegalPages';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#111111',
                  color: '#fafafa',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<RequireAuth><AdminDashboardPage /></RequireAuth>} />
              <Route path="/admin/*" element={<RequireAuth><AdminDashboardPage /></RequireAuth>} />
              <Route element={<Shell />}>
                <Route index element={<HomePage />} />
                <Route path="browse" element={<BrowsePage />} />
                <Route path="product/:productId" element={<ProductDetailPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="shipping-returns" element={<ShippingReturnsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="404" element={<NotFoundPage />} />
                <Route path="wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
                <Route path="shopping-room" element={<RequireAuth><ShoppingRoomLobbyPage /></RequireAuth>} />
                <Route path="room/:roomCode" element={<RequireAuth><ShoppingRoomPage /></RequireAuth>} />
                <Route path="dashboard" element={<RequireAuth><PostPurchaseDashboardPage /></RequireAuth>} />
                <Route path="cart" element={<RequireAuth><CartPage /></RequireAuth>} />
                <Route path="cart/compare" element={<RequireAuth><CartComparePage /></RequireAuth>} />
                <Route path="checkout/address" element={<RequireAuth><CheckoutAddressPage /></RequireAuth>} />
                <Route path="checkout/payment" element={<RequireAuth><CheckoutPaymentPage /></RequireAuth>} />
                <Route path="checkout" element={<Navigate to="/checkout/address" replace />} />
                <Route path="orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
                <Route path="orders/confirmation/:orderId" element={<RequireAuth><OrderConfirmationPage /></RequireAuth>} />
                <Route path="orders/:orderId" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
                <Route path="account/settings" element={<RequireAuth><AccountSettingsPage /></RequireAuth>} />
                <Route path="account/addresses" element={<RequireAuth><AddressesPage /></RequireAuth>} />
                <Route path="account/returns/:orderId" element={<RequireAuth><ReturnRequestPage /></RequireAuth>} />
                <Route path="seller" element={<RequireAuth><SellerDashboardPage /></RequireAuth>} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
