import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { adminStore } from '../lib/adminStore';

export const Hero: React.FC = () => {
  const { openCustomBuilder } = useCart();
  const [settings, setSettings] = useState(() => adminStore.getSettings());

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setSettings(adminStore.getSettings());
    });
    return unsub;
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Photography with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.heroImageUrl}
          alt={settings.heroHeadline}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
          style={{ animationDuration: '12s' }}
        />
        {/* Multilayer gradient scrim for 4.5:1 text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12100e] via-[#12100e]/80 to-[#12100e]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12100e] via-[#12100e]/75 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(212,175,55,0.08),transparent_70%)]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-16">
        <div className="max-w-3xl">
          {/* Quiet unboxed kicker text - no pill enclosures */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#d4af37] font-medium tracking-wide mb-4">
            <span>Boutique Patisserie &amp; Custom Bakes</span>
            <span aria-hidden="true">·</span>
            <span>Aruvithura, Erattupetta</span>
            <span aria-hidden="true">·</span>
            <span>Bake-to-Order</span>
          </div>

          {/* Primary Display Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#fbfbf9] leading-[1.08] mb-6 text-balance">
            {settings.heroHeadline}
          </h1>

          {/* Subtitle with domain richness */}
          <p className="text-base sm:text-lg lg:text-xl text-[#d6d3d1] font-normal leading-relaxed mb-8 max-w-2xl text-balance">
            {settings.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-12">
            <a
              href="#menu"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg transition-all duration-200 shadow-lg shadow-[#d4af37]/20 active:scale-[0.98] whitespace-nowrap"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={openCustomBuilder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#f5f5f4] bg-[#24201c]/90 hover:bg-[#332d28] border border-[#3e3731] hover:border-[#d4af37]/60 rounded-lg transition-all duration-200 shadow-sm active:scale-[0.98] whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>Design Custom Cake</span>
            </button>
          </div>

          {/* Proof Adjacency: Local metrics & assurances */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#332d28]/70">
            <div>
              <div className="font-serif text-2xl font-bold text-[#f5f5f4] tabular-nums">4.9 / 5.0</div>
              <div className="text-xs text-[#a8a29e] mt-0.5">Over 650+ local celebration bakes</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-[#f5f5f4] tabular-nums">100%</div>
              <div className="text-xs text-[#a8a29e] mt-0.5">Pure butter &amp; eggless options</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-serif text-2xl font-bold text-[#f5f5f4]">Free Town Drop</div>
              <div className="text-xs text-[#a8a29e] mt-0.5">Within Erattupetta on ₹{settings.freeDeliveryThreshold}+</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
