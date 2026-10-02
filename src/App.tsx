import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { QuickViewModal } from './components/common/QuickViewModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { StaticPage } from './pages/StaticPages.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { GiftFinderSection } from './components/home/GiftFinderSection.tsx';
import { Product } from './types/index.ts';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Router matcher
  const renderCurrentView = () => {
    const url = new URL(window.location.origin + currentPath);
    const pathname = url.pathname;
    const searchParams = Object.fromEntries(url.searchParams.entries());

    // 1. Homepage
    if (pathname === '/' || pathname === '') {
      return <HomePage onNavigate={navigate} onQuickView={setQuickViewProduct} />;
    }

    // 2. Shop Catalog / Search
    if (pathname === '/shop' || pathname === '/search') {
      return (
        <ShopPage
          onNavigate={navigate}
          onQuickView={setQuickViewProduct}
          initialParams={searchParams}
        />
      );
    }

    // 3. Category Page: /category/:slug
    if (pathname.startsWith('/category/')) {
      const slug = pathname.replace('/category/', '');
      return (
        <ShopPage
          onNavigate={navigate}
          onQuickView={setQuickViewProduct}
          initialParams={{ ...searchParams, category: slug }}
        />
      );
    }

    // 4. Product Details: /product/:slug
    if (pathname.startsWith('/product/')) {
      const slug = pathname.replace('/product/', '');
      return (
        <ProductDetailPage
          slug={slug}
          onNavigate={navigate}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      );
    }

    // 5. Dedicated Gift Finder
    if (pathname === '/gift-finder') {
      return (
        <div className="py-8">
          <GiftFinderSection onNavigate={navigate} onQuickView={setQuickViewProduct} />
        </div>
      );
    }

    // 6. Cart
    if (pathname === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    // 7. Checkout
    if (pathname === '/checkout') {
      return <CheckoutPage onNavigate={navigate} onOpenAuth={() => setAuthModalOpen(true)} />;
    }

    // 8. Wishlist
    if (pathname === '/account/wishlist') {
      return <WishlistPage onNavigate={navigate} />;
    }

    // 8b. Direct Orders & Order History shortcut routes
    if (pathname === '/orders' || pathname === '/order-history' || pathname.startsWith('/orders/')) {
      const selectedOrderId = pathname.startsWith('/orders/')
        ? pathname.replace('/orders/', '')
        : undefined;
      return (
        <AccountPage
          onNavigate={navigate}
          subview="orders"
          selectedOrderId={selectedOrderId}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      );
    }

    // 9. Account & Order Tracking: /account, /account/orders, /account/orders/:id, /account/addresses
    if (pathname.startsWith('/account')) {
      let subview = 'orders';
      let selectedOrderId: string | undefined;

      if (pathname.startsWith('/account/orders/')) {
        selectedOrderId = pathname.replace('/account/orders/', '');
      } else if (pathname === '/account/profile') {
        subview = 'profile';
      } else if (pathname === '/account/addresses') {
        subview = 'addresses';
      } else if (pathname === '/account/security') {
        subview = 'security';
      } else if (pathname === '/account/notifications') {
        subview = 'notifications';
      }

      return (
        <AccountPage
          onNavigate={navigate}
          subview={subview}
          selectedOrderId={selectedOrderId}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      );
    }

    // 10. Admin Dashboard: /admin
    if (pathname.startsWith('/admin')) {
      return <AdminDashboardPage onNavigate={navigate} onOpenAuth={() => setAuthModalOpen(true)} />;
    }

    // 11. Static Pages
    if (pathname === '/about') return <StaticPage type="about" onNavigate={navigate} />;
    if (pathname === '/contact') return <StaticPage type="contact" onNavigate={navigate} />;
    if (pathname === '/faq') return <StaticPage type="faq" onNavigate={navigate} />;
    if (pathname === '/shipping') return <StaticPage type="shipping" onNavigate={navigate} />;
    if (pathname === '/returns') return <StaticPage type="returns" onNavigate={navigate} />;
    if (pathname === '/privacy') return <StaticPage type="privacy" onNavigate={navigate} />;
    if (pathname === '/terms') return <StaticPage type="terms" onNavigate={navigate} />;

    // 12. 404 Fallback
    return <StaticPage type="404" onNavigate={navigate} />;
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1E293B]">
              {/* Header Navigation (hidden on admin to isolate private merchant portal) */}
              {!isAdminRoute && (
                <Header
                  onNavigate={navigate}
                  currentRoute={currentPath}
                  onOpenAuth={() => setAuthModalOpen(true)}
                />
              )}

              {/* Main App Viewport */}
              <main className="flex-1">{renderCurrentView()}</main>

              {/* Global Footer (hidden only if on admin to preserve focused dashboard UX) */}
              {!isAdminRoute && <Footer onNavigate={navigate} />}

              {/* Slide-out Cart Drawer */}
              <CartDrawer onNavigate={navigate} />

              {/* Authentication Modal */}
              <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

              {/* Quick View Modal */}
              <QuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onNavigate={navigate}
              />
            </div>
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
