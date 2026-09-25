import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { adminStore } from '../lib/adminStore';
import { ProductCard } from './ProductCard';
import { useCart } from '../context/CartContext';

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'All Creations' },
  { id: 'custom-cakes', label: 'Custom Cakes' },
  { id: 'brownies', label: 'Fudge Brownies' },
  { id: 'puddings', label: 'Gourmet Puddings' },
  { id: 'hampers', label: 'Luxury Hampers' },
];

export const MenuCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => adminStore.getProducts());
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [loading, setLoading] = useState(false);
  const { openCustomBuilder } = useCart();

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setProducts(adminStore.getProducts());
    });
    return unsub;
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.available_flavors && p.available_flavors.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return b.rating - a.rating; // default featured/rating
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <section id="menu" className="py-20 bg-[#12100e] text-[#f5f5f4] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold mb-2">
            The Patisserie Collection
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f5f4] mb-4 text-balance">
            Freshly Baked in Erattupetta
          </h2>
          <p className="text-sm sm:text-base text-[#a8a29e] leading-relaxed">
            Every creation is prepared using authentic imported couverture chocolate, real dairy butter, and local spices. Order your favorite or build a bespoke celebration centerpiece.
          </p>
        </div>

        {/* Controls: Segmented Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Interactive filter tabs - segmented controls with clean active state */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#1a1714] border border-[#2d2722] rounded-xl overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-[#d4af37] text-[#12100e] shadow-sm font-bold'
                      : 'text-[#a8a29e] hover:text-[#f5f5f4] hover:bg-[#25201b]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] tabular-nums ${isActive ? 'opacity-80' : 'text-[#78716c]'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c]" />
              <input
                type="text"
                placeholder="Search flavors, brownies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#78716c] hover:text-[#f5f5f4]"
                >
                  Clear
                </button>
              )}
            </div>

            <select
              value={sortBy}
              aria-label="Sort products by"
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#d6d3d1] focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              <option value="featured">Featured &amp; Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-[#1a1714] border border-[#2e2823] rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#1a1714]/60 border border-[#2a241f] rounded-2xl max-w-lg mx-auto">
            <h3 className="font-serif text-xl font-semibold text-[#f5f5f4] mb-2">No items found</h3>
            <p className="text-xs text-[#a8a29e] mb-6">
              We couldn't find any cakes or treats matching "{searchQuery}". You can build a completely custom bake with our interactive designer.
            </p>
            <button
              onClick={openCustomBuilder}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Design a Custom Cake Instead</span>
            </button>
          </div>
        )}

        {/* Custom Cake Banner in Catalog */}
        <div className="mt-14 p-6 sm:p-8 bg-gradient-to-r from-[#1c1814] via-[#241e19] to-[#1c1814] border border-[#d4af37]/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-[#d4af37] mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Bespoke Celebration Atelier</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f5f4] mb-2">
              Looking for a themed birthday or wedding cake?
            </h3>
            <p className="text-xs sm:text-sm text-[#a8a29e] leading-relaxed">
              Choose your tiers, reference photos, Belgian chocolate fillings, and custom messages. We specialize in vintage Lambeth piping, minimalist Korean styles, and multi-tier event cakes.
            </p>
          </div>
          <button
            onClick={openCustomBuilder}
            className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            Launch Cake Customizer
          </button>
        </div>
      </div>
    </section>
  );
};
