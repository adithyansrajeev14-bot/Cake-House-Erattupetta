import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuCatalog } from './components/MenuCatalog';
import { AboutStory } from './components/AboutStory';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomCakeBuilderModal } from './components/CustomCakeBuilderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { adminStore } from './lib/adminStore';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { buildWhatsAppLink } from './lib/orderServices';

function AppContent() {
  const { itemCount, openCart } = useCart();
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => adminStore.isAuthenticated());

  // Check URL pathname and hash against configured admin path
  const checkRoute = () => {
    const configuredPath = adminStore.getAdminPath();
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    const cleanHash = currentHash.replace(/^#/, '');

    const matchesPath = currentPath.toLowerCase() === configuredPath.toLowerCase();
    const matchesHash = cleanHash.toLowerCase() === configuredPath.replace(/^\//, '').toLowerCase();
    const isSpecialGetInside = currentPath.toLowerCase() === '/getinside' || cleanHash.toLowerCase() === 'getinside';

    setIsAdminPath(matchesPath || matchesHash || isSpecialGetInside);
    setIsAuthenticated(adminStore.isAuthenticated());
  };

  useEffect(() => {
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    const unsub = adminStore.subscribe(() => {
      setIsAuthenticated(adminStore.isAuthenticated());
      checkRoute();
    });

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
      unsub();
    };
  }, []);

  const handleExitToStore = () => {
    window.history.pushState({}, '', '/');
    checkRoute();
  };

  const handleLogout = () => {
    adminStore.logout();
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleMobileWhatsApp = () => {
    const settings = adminStore.getSettings();
    window.open(
      buildWhatsAppLink(`Hello ${settings.shopName}! I would like to place an order or check today’s fresh bakes.`),
      '_blank'
    );
  };

  // If visiting the secret admin route
  if (isAdminPath) {
    if (isAuthenticated) {
      return <AdminDashboard onLogout={handleLogout} onExit={handleExitToStore} />;
    }
    return <AdminLogin onSuccess={handleLoginSuccess} onExit={handleExitToStore} />;
  }

  // Public Commercial Storefront (Completely stripped of database debug elements)
  return (
    <div className="min-h-screen bg-[#12100e] text-[#f5f5f4] flex flex-col selection:bg-[#d4af37]/30 selection:text-[#fef08a]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <Hero />
        <MenuCatalog />
        <AboutStory />
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <ProductDetailModal />
      <CustomCakeBuilderModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />

      {/* Mobile Quick Action Floating Button (Respecting 15% Mobile Sticky Cap) */}
      <div className="fixed bottom-5 right-4 z-30 flex sm:hidden items-center gap-2">
        <button
          onClick={handleMobileWhatsApp}
          className="p-3 bg-[#25d366] text-white rounded-full shadow-lg hover:bg-[#20ba59] active:scale-95 transition-all flex items-center justify-center border border-white/20"
          aria-label="Direct WhatsApp Inquiry"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        {itemCount > 0 && (
          <button
            onClick={openCart}
            className="px-3.5 py-2.5 bg-[#d4af37] text-[#12100e] rounded-full shadow-xl font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="tabular-nums">Bag ({itemCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
