import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import ErrorBoundary from './components/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import ReturnsPage from './pages/ReturnsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <NotificationProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
          </Routes>
        </CartProvider>
      </NotificationProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
