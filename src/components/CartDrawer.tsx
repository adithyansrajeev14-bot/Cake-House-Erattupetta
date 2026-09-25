import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { buildWhatsAppLink } from '../lib/orderServices';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    totalAmount,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    openCheckout,
    openCustomBuilder,
  } = useCart();

  if (!isCartOpen) return null;

  const handleQuickWhatsAppChat = () => {
    let msg = `Hello Cake House Erattupetta! I am looking to order from your menu:\n`;
    items.forEach((it, idx) => {
      msg += `\n${idx + 1}. *${it.quantity}x ${it.title}* (${it.selectedWeight})\n   ₹${it.totalPrice.toLocaleString('en-IN')}`;
    });
    msg += `\n\nTotal: ₹${totalAmount.toLocaleString('en-IN')}\nCould you please check availability for delivery in Erattupetta?`;
    window.open(buildWhatsAppLink(msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#161311] border-l border-[#2e2823] shadow-2xl flex flex-col text-[#f5f5f4]">
          {/* Header */}
          <div className="p-5 border-b border-[#2a241f] flex items-center justify-between bg-[#141210]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              <h2 className="font-serif text-lg font-bold text-[#f5f5f4]">Your Celebration Bag</h2>
              <span className="text-xs text-[#a8a29e] tabular-nums">({items.length} items)</span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-[#a8a29e] hover:text-[#f5f5f4] hover:bg-[#24201c] rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="px-5 py-2.5 bg-[#1b1714] border-b border-[#28221c] text-xs">
            {amountNeededForFreeDelivery > 0 ? (
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#a8a29e] mb-1">
                  <span>
                    Add <strong className="text-[#d4af37] font-semibold">₹{amountNeededForFreeDelivery}</strong> more for free Erattupetta delivery
                  </span>
                  <span className="tabular-nums font-medium text-[#78716c]">
                    ₹{subtotal}/₹{freeDeliveryThreshold}
                  </span>
                </div>
                <div className="w-full bg-[#2a241f] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#d4af37] h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#d4af37] font-medium text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>You unlocked FREE delivery within Erattupetta town!</span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#1e1a17] flex items-center justify-center text-[#78716c] mb-3 border border-[#2d2722]">
                  <ShoppingBag className="w-7 h-7 text-[#a8a29e]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#f5f5f4] mb-1">Your bag is empty</h3>
                <p className="text-xs text-[#a8a29e] max-w-xs mb-6">
                  Explore our artisanal custom cakes, warm Belgian brownies, and chilled dessert puddings.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={closeCart}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg transition-colors"
                  >
                    Browse Menu
                  </button>
                  <button
                    onClick={() => {
                      closeCart();
                      openCustomBuilder();
                    }}
                    className="w-full py-2 px-4 text-xs font-semibold text-[#d4af37] bg-[#221e1a] hover:bg-[#2c2621] border border-[#3e3731] rounded-lg transition-colors"
                  >
                    Design Custom Cake
                  </button>
                </div>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.cartItemId}
                  className="flex gap-3.5 p-3.5 bg-[#1b1815] border border-[#2a241f] rounded-xl hover:border-[#383129] transition-colors"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image_url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover bg-[#12100e] shrink-0 border border-[#2d2722]"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-xs sm:text-sm text-[#f5f5f4] truncate">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-[#78716c] hover:text-red-400 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#a8a29e] mt-0.5">
                        {item.selectedWeight}
                        {item.selectedFlavor && ` · ${item.selectedFlavor}`}
                      </div>

                      {item.customMessage && (
                        <div className="text-[10px] text-[#d4af37] italic mt-0.5 truncate">
                          "{item.customMessage}"
                        </div>
                      )}

                      {item.isEggless && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          ✓ 100% Eggless
                        </div>
                      )}
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#25201b] mt-2">
                      <div className="flex items-center border border-[#2d2722] rounded-md bg-[#141210]">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="px-2 py-0.5 text-xs text-[#a8a29e] hover:text-[#f5f5f4]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold tabular-nums text-[#f5f5f4]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="px-2 py-0.5 text-xs text-[#a8a29e] hover:text-[#f5f5f4]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-serif text-sm font-bold text-[#f5f5f4] tabular-nums">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#2a241f] bg-[#141210] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#a8a29e]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#f5f5f4] tabular-nums">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#a8a29e]">
                  <span>Delivery (Erattupetta Town)</span>
                  <span className="font-medium tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#f5f5f4] pt-2 border-t border-[#241e1a]">
                  <span>Total Amount</span>
                  <span className="font-serif text-lg text-[#d4af37] tabular-nums">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Checkout or Direct WhatsApp */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={openCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-xl transition-all shadow-md active:scale-98 whitespace-nowrap"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleQuickWhatsAppChat}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#25d366] bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/30 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant Order on WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#78716c] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>100% Fresh Bake-to-Order Guarantee · Erattupetta</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
