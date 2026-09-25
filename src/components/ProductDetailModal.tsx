import React, { useState, useEffect } from 'react';
import { X, Check, Star, Clock, Sparkles, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { buildWhatsAppLink } from '../lib/orderServices';

export const ProductDetailModal: React.FC = () => {
  const { selectedProductForDetail, closeProductDetail, addToCart } = useCart();

  const product = selectedProductForDetail;

  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [isEggless, setIsEggless] = useState(false);
  const [withCandles, setWithCandles] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      const defaultIdx = product.weight_options.findIndex(w => w.isDefault);
      setSelectedWeightIndex(defaultIdx >= 0 ? defaultIdx : 0);
      setSelectedFlavor(product.available_flavors && product.available_flavors.length > 0 ? product.available_flavors[0] : '');
      setCustomMessage('');
      setIsEggless(false);
      setWithCandles(true);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const currentOption = product.weight_options[selectedWeightIndex] || product.weight_options[0];
  const unitPrice = Math.round(product.price * (currentOption?.priceMultiplier || 1));
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      category: product.category,
      unitPrice,
      totalPrice,
      quantity,
      image_url: product.image_url,
      selectedWeight: currentOption.label,
      selectedFlavor: selectedFlavor || undefined,
      customMessage: customMessage.trim() || undefined,
      isEggless,
      candles: withCandles,
    });
    closeProductDetail();
  };

  const handleDirectWhatsApp = () => {
    const text = `Hello Cake House Erattupetta! I would like to order:\n\n*${product.title}*\n• Size: ${currentOption.label}\n${selectedFlavor ? `• Flavor: ${selectedFlavor}\n` : ''}${customMessage ? `• Cake Text: "${customMessage}"\n` : ''}• Preference: ${isEggless ? '100% Eggless' : 'Standard Dairy'}\n• Qty: ${quantity}\n• Total: ₹${totalPrice.toLocaleString('en-IN')}\n\nCould you please confirm slot availability for delivery in Erattupetta?`;
    window.open(buildWhatsAppLink(text), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#171412] border border-[#332d28] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row text-[#f5f5f4]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeProductDetail}
          className="absolute top-3.5 right-3.5 z-20 p-2 text-[#a8a29e] hover:text-[#f5f5f4] bg-[#1a1714]/80 hover:bg-[#25201b] rounded-full transition-colors border border-[#332d28]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media Column */}
        <div className="w-full md:w-5/12 bg-[#12100e] relative flex items-center justify-center min-h-[220px] md:min-h-full">
          <img
            src={product.image_url}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center max-h-[360px] md:max-h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171412] via-transparent to-transparent md:hidden" />
          <div className="absolute top-3 left-3 bg-[#12100e]/85 backdrop-blur-xs text-[#d4af37] text-[11px] font-semibold px-2.5 py-1 rounded border border-[#332d28]">
            {product.category.replace('-', ' ').toUpperCase()}
          </div>
        </div>

        {/* Customization Details Column */}
        <div className="w-full md:w-7/12 p-5 sm:p-6 overflow-y-auto max-h-[70vh] md:max-h-[88vh] flex flex-col">
          {/* Title & Rating */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-[#a8a29e] mb-1">
              <div className="flex items-center gap-1 text-[#f5f5f4]">
                <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                <span className="font-semibold tabular-nums">{product.rating.toFixed(1)}</span>
                <span className="text-[#78716c]">({product.reviews_count} reviews)</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1 text-[#a8a29e]">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{product.preparation_time}</span>
              </div>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#f5f5f4] leading-snug">
              {product.title}
            </h2>
            <p className="text-xs text-[#a8a29e] mt-1.5 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Size / Weight Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#f5f5f4] uppercase tracking-wider mb-2">
                1. Select Weight / Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.weight_options.map((opt, idx) => {
                  const isSelected = selectedWeightIndex === idx;
                  const optPrice = Math.round(product.price * opt.priceMultiplier);
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedWeightIndex(idx)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#f5f5f4]'
                          : 'border-[#2d2722] bg-[#1a1714] text-[#a8a29e] hover:border-[#3e3731]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#f5f5f4]">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#d4af37]" />}
                      </div>
                      <div className="text-[11px] text-[#78716c] mt-0.5">{opt.servings}</div>
                      <div className="text-xs font-bold text-[#d4af37] mt-1 tabular-nums">
                        ₹{optPrice.toLocaleString('en-IN')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Flavor Options if available */}
            {product.available_flavors && product.available_flavors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#f5f5f4] uppercase tracking-wider mb-2">
                  2. Choose Flavor Profile
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.available_flavors.map(flavor => {
                    const isSelected = selectedFlavor === flavor;
                    return (
                      <button
                        key={flavor}
                        onClick={() => setSelectedFlavor(flavor)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5f5f4] font-semibold'
                            : 'border-[#2d2722] bg-[#1a1714] text-[#a8a29e] hover:border-[#3e3731]'
                        }`}
                      >
                        {flavor}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Inscription on Cake */}
            {product.category === 'custom-cakes' && (
              <div>
                <label className="block text-xs font-semibold text-[#f5f5f4] uppercase tracking-wider mb-1.5">
                  3. Inscription / Message on Cake
                </label>
                <input
                  type="text"
                  placeholder='e.g., "Happy 25th Birthday Rhea!"'
                  value={customMessage}
                  maxLength={50}
                  onChange={e => setCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                />
                <div className="text-[10px] text-[#78716c] mt-1 text-right tabular-nums">
                  {customMessage.length}/50 characters
                </div>
              </div>
            )}

            {/* 4. Dietary & Extras */}
            <div className="pt-2 border-t border-[#2a241f] space-y-2">
              {product.is_eggless_available && (
                <label className="flex items-center justify-between p-2.5 bg-[#1a1714] border border-[#2d2722] rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-sm border border-emerald-500/80 flex items-center justify-center p-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs text-[#d6d3d1]">Bake as 100% Eggless</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEggless}
                    onChange={e => setIsEggless(e.target.checked)}
                    className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                  />
                </label>
              )}

              <label className="flex items-center justify-between p-2.5 bg-[#1a1714] border border-[#2d2722] rounded-lg cursor-pointer">
                <span className="text-xs text-[#d6d3d1]">Complimentary Golden Celebration Candles</span>
                <input
                  type="checkbox"
                  checked={withCandles}
                  onChange={e => setWithCandles(e.target.checked)}
                  className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Bottom Bar: Quantity & Actions */}
          <div className="pt-4 border-t border-[#2a241f] mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#78716c]">Quantity:</span>
                <div className="flex items-center border border-[#2d2722] rounded-lg bg-[#1a1714]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-sm text-[#a8a29e] hover:text-[#f5f5f4]"
                  >
                    -
                  </button>
                  <span className="px-2.5 py-1 text-xs font-semibold tabular-nums text-[#f5f5f4]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 py-1 text-sm text-[#a8a29e] hover:text-[#f5f5f4]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-[#78716c]">Estimated Total</div>
                <div className="font-serif text-xl font-bold text-[#d4af37] tabular-nums">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg shadow-sm transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleDirectWhatsApp}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#25d366] bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/30 rounded-lg transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
