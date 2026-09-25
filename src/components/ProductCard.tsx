import React from 'react';
import { Plus, Sparkles, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openProductDetail } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultOption = product.weight_options[0];
    const unitPrice = Math.round(product.price * defaultOption.priceMultiplier);

    addToCart({
      productId: product.id,
      title: product.title,
      category: product.category,
      unitPrice,
      totalPrice: unitPrice,
      quantity: 1,
      image_url: product.image_url,
      selectedWeight: defaultOption.label,
      selectedFlavor: product.available_flavors ? product.available_flavors[0] : undefined,
      isEggless: false,
      candles: true,
    });
  };

  return (
    <article
      onClick={() => openProductDetail(product)}
      className="group relative flex flex-col bg-[#1a1714] border border-[#2e2823] hover:border-[#d4af37]/60 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
    >
      {/* Visual Slot */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141210]">
        <img
          src={product.image_url}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quiet subtle tag if any - unboxed single element */}
        {product.tag && (
          <div className="absolute top-3 left-3 bg-[#12100e]/85 backdrop-blur-xs text-[#d4af37] text-[11px] font-semibold px-2.5 py-1 rounded border border-[#332d28]/80">
            {product.tag}
          </div>
        )}

        {/* Dietary note if eggless available */}
        {product.is_eggless_available && (
          <div className="absolute bottom-3 left-3 bg-[#12100e]/80 text-[#a8a29e] text-[10px] px-2 py-0.5 rounded border border-[#332d28]/60">
            Eggless Available
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category & Rating Line */}
        <div className="flex items-center justify-between text-xs text-[#a8a29e] mb-1.5">
          <span className="uppercase tracking-wider text-[11px] font-medium text-[#d4af37]">
            {product.category.replace('-', ' ')}
          </span>
          <div className="flex items-center gap-1 text-[#f5f5f4]">
            <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
            <span className="tabular-nums font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-[#78716c]">({product.reviews_count})</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-lg font-semibold text-[#f5f5f4] group-hover:text-[#d4af37] transition-colors leading-snug mb-2 line-clamp-1">
          {product.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-[#a8a29e] line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2a241f] mt-auto">
          <div>
            <div className="text-[11px] text-[#78716c]">Starting from</div>
            <div className="font-serif text-lg font-bold text-[#f5f5f4] tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleQuickAdd}
              title="Quick Add 1 standard portion to Cart"
              className="p-2 text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg transition-colors flex items-center justify-center shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openProductDetail(product);
              }}
              className="px-3 py-2 text-xs font-semibold text-[#d4af37] bg-[#24201c] hover:bg-[#2d2823] border border-[#3e3731] rounded-lg transition-colors whitespace-nowrap"
            >
              Customize
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
