import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Shell } from './components/layout/Shell';
import { AdminLayout } from './components/layout/AdminLayout';
import { SellerLayout } from './components/layout/SellerLayout';
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
import { OverviewPage } from './pages/admin/OverviewPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { ProductEditorPage } from './pages/admin/ProductEditorPage';
import { OrdersPage as AdminOrdersPage } from './pages/admin/OrdersPage';
import { OrderDetailPage as AdminOrderDetailPage } from './pages/admin/OrderDetailPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { DiscountsPage } from './pages/admin/DiscountsPage';
import { ReturnsPage } from './pages/admin/ReturnsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { OverviewPage as SellerOverviewPage } from './pages/seller/OverviewPage';
import { ProductsPage as SellerProductsPage } from './pages/seller/ProductsPage';
import { ProductEditorPage as SellerProductEditorPage } from './pages/seller/ProductEditorPage';
import { OrdersPage as SellerOrdersPage } from './pages/seller/OrdersPage';
import { OnboardingPage as SellerOnboardingPage } from './pages/seller/OnboardingPage';
import { ReturnsPage as SellerReturnsPage } from './pages/seller/ReturnsPage';
import { PayoutsPage as SellerPayoutsPage } from './pages/seller/PayoutsPage';
import { SettingsPage as SellerSettingsPage } from './pages/seller/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'var(--shop-panel)',
                    color: 'var(--shop-text)',
                    border: '1px solid var(--shop-border)',
                  },
                }}
              />
              <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<OverviewPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/new" element={<ProductEditorPage />} />
                <Route path="products/:productId" element={<ProductEditorPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="discounts" element={<DiscountsPage />} />
                <Route path="returns" element={<ReturnsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route
                path="/seller"
                element={
                  <RequireAuth>
                    <SellerLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<SellerOverviewPage />} />
                <Route path="products" element={<SellerProductsPage />} />
                <Route path="products/new" element={<SellerProductEditorPage />} />
                <Route path="products/:productId" element={<SellerProductEditorPage />} />
                <Route path="orders" element={<SellerOrdersPage />} />
                <Route path="orders/:orderId" element={<SellerOrdersPage />} />
                <Route path="returns" element={<SellerReturnsPage />} />
                <Route path="payouts" element={<SellerPayoutsPage />} />
                <Route path="settings" element={<SellerSettingsPage />} />
                <Route path="onboarding" element={<SellerOnboardingPage />} />
              </Route>

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
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
