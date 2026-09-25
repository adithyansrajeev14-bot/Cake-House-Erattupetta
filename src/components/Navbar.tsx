import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { adminStore } from '../lib/adminStore';

export const Navbar: React.FC = () => {
  const { itemCount, openCart, openCustomBuilder } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopName, setShopName] = useState(() => adminStore.getSettings().shopName);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const unsubscribe = adminStore.subscribe(() => {
      setShopName(adminStore.getSettings().shopName);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#141210]/95 backdrop-blur-md border-b border-[#332d28]/60 py-3.5 shadow-xl'
          : 'bg-gradient-to-b from-[#12100e]/90 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single text element wordmark in display face */}
          <a
            href="#"
            className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#f5f5f4] hover:text-[#d4af37] transition-colors"
          >
            {shopName}
          </a>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#d6d3d1]">
            <a href="#menu" className="hover:text-[#f5f5f4] transition-colors hover:underline underline-offset-4 decoration-[#d4af37]">
              Menu
            </a>
            <a href="#custom-orders" className="hover:text-[#f5f5f4] transition-colors hover:underline underline-offset-4 decoration-[#d4af37]">
              Custom Cakes
            </a>
            <a href="#story" className="hover:text-[#f5f5f4] transition-colors hover:underline underline-offset-4 decoration-[#d4af37]">
              Our Story
            </a>
            <a href="#reviews" className="hover:text-[#f5f5f4] transition-colors hover:underline underline-offset-4 decoration-[#d4af37]">
              Reviews
            </a>
            <a href="#contact" className="hover:text-[#f5f5f4] transition-colors hover:underline underline-offset-4 decoration-[#d4af37]">
              Location
            </a>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Custom Cake Builder CTA */}
            <button
              onClick={openCustomBuilder}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Cake</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              aria-label="View Shopping Cart"
              className="relative p-2 text-[#f5f5f4] bg-[#24201c] hover:bg-[#332d28] border border-[#3e3731] rounded-lg transition-colors flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#d4af37] text-[#141210] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-md">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#a8a29e] hover:text-[#f5f5f4] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-[#24201c] mt-3 space-y-2">
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#f5f5f4] hover:bg-[#24201c] rounded-md"
            >
              Menu & Catalog
            </a>
            <a
              href="#custom-orders"
              onClick={() => {
                setMobileMenuOpen(false);
                openCustomBuilder();
              }}
              className="block px-3 py-2 text-base font-medium text-[#d4af37] hover:bg-[#24201c] rounded-md"
            >
              Design Custom Cake
            </a>
            <a
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#a8a29e] hover:bg-[#24201c] rounded-md"
            >
              Our Story
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#a8a29e] hover:bg-[#24201c] rounded-md"
            >
              Customer Reviews
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#a8a29e] hover:bg-[#24201c] rounded-md"
            >
              Contact & Location
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
