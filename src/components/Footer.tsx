import React, { useState, useEffect } from 'react';
import { Phone, MapPin, MessageCircle, Clock, Sparkles } from 'lucide-react';
import { buildWhatsAppLink } from '../lib/orderServices';
import { useCart } from '../context/CartContext';
import { adminStore } from '../lib/adminStore';

export const Footer: React.FC = () => {
  const { openCustomBuilder } = useCart();
  const [settings, setSettings] = useState(() => adminStore.getSettings());

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setSettings(adminStore.getSettings());
    });
    return unsub;
  }, []);

  const handleGeneralInquiry = () => {
    window.open(
      buildWhatsAppLink(`Hello ${settings.shopName}! I would like to inquire about your celebration cakes.`),
      '_blank'
    );
  };

  return (
    <footer id="contact" className="bg-[#0e0c0a] border-t border-[#241e1a] text-[#a8a29e] text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-[#201b17]">
          {/* Brand info */}
          <div className="space-y-4">
            <a href="#" className="font-serif text-xl font-bold text-[#f5f5f4] tracking-tight block">
              {settings.shopName}
            </a>
            <p className="text-xs text-[#a8a29e] leading-relaxed">
              Boutique artisanal patisserie specializing in custom celebration cakes, Belgian fudge brownies, and authentic dessert puddings in Kottayam.
            </p>
            <button
              onClick={handleGeneralInquiry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#25d366] bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/30 rounded-lg transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp: {settings.shopPhone}</span>
            </button>
          </div>

          {/* Quick Navigation */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#f5f5f4] mb-3">
              Explore Menu
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#menu" className="hover:text-[#d4af37] transition-colors">
                  Custom Tiered Cakes
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#d4af37] transition-colors">
                  Belgian Fudge Brownies
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#d4af37] transition-colors">
                  Layered Caramel Puddings
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#d4af37] transition-colors">
                  Festive Gift Hampers
                </a>
              </li>
              <li>
                <button
                  onClick={openCustomBuilder}
                  className="text-[#d4af37] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Design Bespoke Cake</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#f5f5f4] mb-3">
              Bakehouse &amp; Hours
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>{settings.shopAddress}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <div>Monday – Sunday: 9:00 AM – 9:00 PM</div>
                  <div className="text-[11px] text-[#78716c]">Custom bakes require 24–48h notice</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>Direct: {settings.shopPhone}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716c]">
          <div>
            &copy; {new Date().getFullYear()} {settings.shopName}. All rights reserved. Handcrafted with pure butter &amp; love in Kerala.
          </div>
          <div className="flex items-center gap-4">
            <a href="#story" className="hover:text-[#f5f5f4] transition-colors">
              Story
            </a>
            <span>·</span>
            <a href="#reviews" className="hover:text-[#f5f5f4] transition-colors">
              Reviews
            </a>
            <span>·</span>
            <a href="#menu" className="hover:text-[#f5f5f4] transition-colors">
              Menu
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
