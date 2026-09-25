import React from 'react';
import { CheckCircle2, MessageCircle, Calendar, Clock, MapPin, QrCode, CreditCard, Banknote, X, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { buildWhatsAppLink, formatWhatsAppOrderMessage, BAKERY_PHONE_DISPLAY } from '../lib/orderServices';

export const OrderConfirmationModal: React.FC = () => {
  const { lastCompletedOrder, setCompletedOrder } = useCart();

  if (!lastCompletedOrder) return null;

  const order = lastCompletedOrder;

  const handleOpenWhatsAppChat = () => {
    const textMsg = formatWhatsAppOrderMessage({
      orderId: order.id,
      customerName: order.customer_name,
      phone: order.phone,
      deliveryAddress: order.delivery_address,
      landmark: order.landmark,
      deliveryDate: order.delivery_date,
      deliverySlot: order.delivery_slot,
      items: order.items_json,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total_amount,
      paymentMethod: order.payment_method,
      upiUtrId: order.upi_utr_id,
      notes: order.notes,
    });
    window.open(buildWhatsAppLink(textMsg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-[#171412] border border-[#332d28] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#f5f5f4]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-[#221c17] to-[#171412] border-b border-[#2d2722] text-center relative">
          <button
            onClick={() => setCompletedOrder(null)}
            className="absolute top-4 right-4 p-2 text-[#a8a29e] hover:text-[#f5f5f4] bg-[#141210]/60 rounded-full"
            aria-label="Close confirmation"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold mb-1">
            Order Successfully Placed
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f5f4]">
            Thank You, {order.customer_name.split(' ')[0]}!
          </h2>
          <p className="text-xs text-[#a8a29e] mt-1.5 max-w-md mx-auto">
            {order.payment_method === 'upi'
              ? 'Your order and UPI transfer details have been submitted. Our baker will verify the transaction and schedule baking immediately.'
              : 'Your artisanal bake order has been scheduled. Our master pastry chef will prepare it fresh for your celebration in Erattupetta.'}
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs max-h-[60vh]">
          {/* Order Details Badge */}
          <div className="flex items-center justify-between p-3.5 bg-[#141210] border border-[#2d2722] rounded-xl">
            <div>
              <div className="text-[11px] text-[#78716c]">Order Reference</div>
              <div className="font-mono text-base font-bold text-[#d4af37]">#{order.id}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#78716c]">Baking Status</div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Scheduled for Baking</span>
              </div>
            </div>
          </div>

          {/* Payment Method Banner */}
          {order.payment_method === 'upi' ? (
            <div className="p-3.5 bg-[#1b1713] border border-[#d4af37]/40 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-[#d4af37]">
                  <QrCode className="w-4 h-4" />
                  <span>UPI Payment Submitted</span>
                </div>
                <span className="text-[10px] bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                  Verification Pending
                </span>
              </div>
              {order.upi_utr_id && (
                <div className="text-[#f5f5f4] flex items-center gap-2">
                  <span className="text-[#a8a29e]">Submitted UTR / Ref ID:</span>
                  <span className="font-mono font-bold text-[#d4af37] bg-[#12100e] px-2 py-0.5 rounded border border-[#2d2722]">
                    {order.upi_utr_id}
                  </span>
                </div>
              )}
              {order.upi_receipt_url && (
                <div className="text-[11px] text-[#a8a29e]">
                  ✓ Payment receipt screenshot attached for baker verification.
                </div>
              )}
            </div>
          ) : order.payment_method === 'stripe' ? (
            <div className="p-3.5 bg-[#141210] border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CreditCard className="w-4 h-4" />
                <span>Paid Online via Stripe</span>
              </div>
              <span className="font-mono text-[10px] text-[#a8a29e]">
                {order.stripe_payment_id || 'Approved'}
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-[#141210] border border-[#25d366]/30 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#25d366] font-medium">
                <MessageCircle className="w-4 h-4" />
                <span>Doorstep Payment (Cash / UPI on Arrival)</span>
              </div>
              <span className="text-[10px] text-[#a8a29e]">Pending Delivery</span>
            </div>
          )}

          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#141210] border border-[#2d2722] rounded-xl">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#78716c] text-[11px]">Delivery Date</span>
                <div className="font-medium text-[#f5f5f4]">{order.delivery_date}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#78716c] text-[11px]">Time Window</span>
                <div className="font-medium text-[#f5f5f4]">{order.delivery_slot}</div>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-2 pt-2 border-t border-[#241e1a]">
              <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#78716c] text-[11px]">Delivery Destination</span>
                <div className="font-medium text-[#f5f5f4]">
                  {order.delivery_address}{order.landmark ? ` (Near ${order.landmark})` : ''}, Erattupetta
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div>
            <div className="font-semibold text-[#f5f5f4] mb-2 uppercase tracking-wider text-[11px]">
              Itemized Receipt
            </div>
            <div className="space-y-2">
              {order.items_json.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#141210] border border-[#26201b] rounded-lg"
                >
                  <div>
                    <div className="font-medium text-[#f5f5f4]">
                      {it.quantity}x {it.title}
                    </div>
                    <div className="text-[11px] text-[#78716c]">
                      {it.selectedWeight}
                      {it.customMessage && ` · "${it.customMessage}"`}
                    </div>
                  </div>
                  <div className="font-serif font-bold text-[#f5f5f4] tabular-nums">
                    ₹{it.totalPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="p-3.5 bg-[#141210] border border-[#2d2722] rounded-xl space-y-1.5">
            <div className="flex justify-between text-[#a8a29e]">
              <span>Subtotal</span>
              <span className="tabular-nums">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#a8a29e]">
              <span>Delivery Charge (Erattupetta Town)</span>
              <span className="tabular-nums">{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#f5f5f4] pt-2 border-t border-[#241e1a]">
              <span>Total Amount</span>
              <span className="font-serif text-base text-[#d4af37] tabular-nums">
                ₹{order.total_amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-[#2d2722] bg-[#141210] space-y-2.5">
          <button
            onClick={handleOpenWhatsAppChat}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-[#25d366] hover:bg-[#20ba59] rounded-xl shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Details to Baker on WhatsApp ({BAKERY_PHONE_DISPLAY})</span>
          </button>

          <button
            onClick={() => setCompletedOrder(null)}
            className="w-full py-2.5 px-4 text-xs font-medium text-[#a8a29e] hover:text-[#f5f5f4] bg-[#1a1714] hover:bg-[#24201c] border border-[#2d2722] rounded-xl transition-colors"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
