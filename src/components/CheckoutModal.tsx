import React, { useState, useEffect } from 'react';
import { X, CreditCard, MessageCircle, QrCode, ShieldCheck, CheckCircle2, Loader2, Calendar, Clock, MapPin, Phone, User, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { dbService } from '../lib/supabase';
import { adminStore } from '../lib/adminStore';
import {
  formatWhatsAppOrderMessage,
  buildWhatsAppLink,
  generateOrderId,
  processStripePaymentSimulation,
} from '../lib/orderServices';
import { Order } from '../types';
import { UpiPaymentView } from './UpiPaymentView';

const DELIVERY_SLOTS = [
  '10:00 AM - 1:00 PM (Morning Slot)',
  '1:00 PM - 4:00 PM (Afternoon Slot)',
  '4:00 PM - 7:00 PM (Evening Celebration)',
  '7:00 PM - 9:00 PM (Night Delivery)',
];

export const CheckoutModal: React.FC = () => {
  const {
    items,
    subtotal,
    deliveryFee,
    totalAmount,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
    setCompletedOrder,
  } = useCart();

  const [settings, setSettings] = useState(() => adminStore.getSettings());

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setSettings(adminStore.getSettings());
    });
    return unsub;
  }, []);

  // Customer & Delivery Information
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[2]);
  const [notes, setNotes] = useState('');

  // 3 Clear Payment Choices: 'upi' | 'stripe' | 'whatsapp'
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'stripe' | 'whatsapp'>('upi');

  // UPI State
  const [upiUtr, setUpiUtr] = useState('');
  const [upiReceiptUrl, setUpiReceiptUrl] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState(() => generateOrderId());

  // Stripe Simulation state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isCheckoutOpen) return null;

  const validateForm = () => {
    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!deliveryAddress.trim()) {
      setFormError('Please enter your delivery address / street in Erattupetta.');
      return false;
    }
    if (!deliveryDate) {
      setFormError('Please select your preferred delivery date.');
      return false;
    }

    if (paymentMethod === 'upi') {
      if (!upiUtr.trim() && !upiReceiptUrl) {
        setFormError('Please input your 12-digit UPI UTR / Transaction ID or attach a payment screenshot to verify payment.');
        return false;
      }
      if (upiUtr.trim() && upiUtr.trim().length < 6) {
        setFormError('Please enter a valid UPI Transaction / UTR Reference ID (usually 12 digits).');
        return false;
      }
    }

    setFormError('');
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    const orderId = pendingOrderId || generateOrderId();

    try {
      setIsProcessing(true);

      let stripePaymentId: string | undefined = undefined;

      // Handle Stripe flow simulation
      if (paymentMethod === 'stripe') {
        const result = await processStripePaymentSimulation({
          amountInINR: totalAmount,
          orderId,
          customerName,
          cardNumber: cardNumber || '4242 4242 4242 4242',
          cardExp: cardExp || '12/28',
          cardCvc: cardCvc || '123',
        });
        stripePaymentId = result.transactionId;
      }

      const orderData: Order = {
        id: orderId,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        delivery_address: deliveryAddress.trim(),
        landmark: landmark.trim() || undefined,
        delivery_date: deliveryDate,
        delivery_slot: deliverySlot,
        items_json: items,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        status: 'received',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'stripe' ? 'paid' : 'pending',
        stripe_payment_id: stripePaymentId,
        upi_utr_id: paymentMethod === 'upi' ? upiUtr.trim() || undefined : undefined,
        upi_receipt_url: paymentMethod === 'upi' ? upiReceiptUrl || undefined : undefined,
        notes: notes.trim() || undefined,
        created_at: new Date().toISOString(),
      };

      // Save to Database and local admin store
      await dbService.createOrder(orderData);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#e2be53', '#f5f5f4', '#332d28', '#25d366'],
        });
      } catch (e) {
        // Safe fail
      }

      // If WhatsApp order chosen, automatically prepare and redirect to wa.me
      if (paymentMethod === 'whatsapp' || paymentMethod === 'upi') {
        const textMsg = formatWhatsAppOrderMessage({
          orderId,
          customerName: orderData.customer_name,
          phone: orderData.phone,
          deliveryAddress: orderData.delivery_address,
          landmark: orderData.landmark,
          deliveryDate: orderData.delivery_date,
          deliverySlot: orderData.delivery_slot,
          items: orderData.items_json,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.delivery_fee,
          total: orderData.total_amount,
          paymentMethod: orderData.payment_method,
          upiUtrId: orderData.upi_utr_id,
          notes: orderData.notes,
        });

        // If WhatsApp order, open directly
        if (paymentMethod === 'whatsapp') {
          const waUrl = buildWhatsAppLink(textMsg);
          window.open(waUrl, '_blank');
        }
      }

      // Reset & Update state
      clearCart();
      closeCheckout();
      setCompletedOrder(orderData);
    } catch (err: any) {
      setFormError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#171412] border border-[#332d28] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-[#f5f5f4]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2d2722] flex items-center justify-between bg-[#141210]">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold">
              Finalize Order · Order Ref #{pendingOrderId}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#f5f5f4]">
              Delivery &amp; Payment Options
            </h2>
          </div>
          <button
            onClick={closeCheckout}
            disabled={isProcessing}
            className="p-2 text-[#a8a29e] hover:text-[#f5f5f4] bg-[#221e1a] rounded-full transition-colors border border-[#332d28]"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[72vh]">
          {formError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f5f5f4] mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#d4af37]" />
              <span>1. Recipient &amp; Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#a8a29e] mb-1">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Anjali Mathew"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a1714] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a8a29e] mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="e.g., 9847123456"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a1714] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f5f5f4] mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              <span>2. Delivery Address in Erattupetta</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#a8a29e] mb-1">Address / House Name / Street *</label>
                <input
                  type="text"
                  placeholder="e.g., Rose Villa, Near St. George Forane Church, Aruvithura Road"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a1714] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs text-[#a8a29e] mb-1">Nearby Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g., Town Bus Stand"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs text-[#a8a29e] mb-1">Delivery Date *</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs text-[#a8a29e] mb-1">Preferred Time Slot</label>
                  <select
                    value={deliverySlot}
                    onChange={e => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    {DELIVERY_SLOTS.map(slot => (
                      <option key={slot} value={slot}>
                        {slot.split(' ')[0]} {slot.split(' ')[1]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#a8a29e] mb-1">Order Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Deliver before 5 PM, ring door bell twice"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: 3 Clear Payment Choices */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f5f5f4] mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#d4af37]" />
                <span>3. Select Payment Method</span>
              </span>
              <span className="text-[10px] text-[#a8a29e]">Instant confirmation &amp; direct receipt</span>
            </h3>

            {/* 3 Payment Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Choice 1: UPI Payment (Instant QR / App) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#f5f5f4] ring-1 ring-[#d4af37]'
                    : 'border-[#2d2722] bg-[#1a1714] text-[#a8a29e] hover:border-[#3e3731]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <QrCode className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-[#d4af37]' : 'text-[#78716c]'}`} />
                    {paymentMethod === 'upi' && <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />}
                  </div>
                  <div className="font-semibold text-xs text-[#f5f5f4]">Pay via UPI</div>
                  <div className="text-[10px] text-[#a8a29e] mt-1 leading-normal">
                    Instant QR &amp; App (GPay / PhonePe / Paytm / BHIM)
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium mt-3">Fastest &amp; Zero Fee</div>
              </button>

              {/* Choice 2: Pay Online (Stripe) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#f5f5f4] ring-1 ring-[#d4af37]'
                    : 'border-[#2d2722] bg-[#1a1714] text-[#a8a29e] hover:border-[#3e3731]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'stripe' ? 'text-[#d4af37]' : 'text-[#78716c]'}`} />
                    {paymentMethod === 'stripe' && <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />}
                  </div>
                  <div className="font-semibold text-xs text-[#f5f5f4]">Pay Online (Stripe)</div>
                  <div className="text-[10px] text-[#a8a29e] mt-1 leading-normal">
                    Credit &amp; Debit Cards (Visa, Mastercard, RuPay)
                  </div>
                </div>
                <div className="text-[10px] text-[#d4af37] font-medium mt-3">256-Bit SSL Encrypted</div>
              </button>

              {/* Choice 3: Order via WhatsApp (COD / Pay on Delivery) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('whatsapp')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'whatsapp'
                    ? 'border-[#25d366] bg-[#25d366]/10 text-[#f5f5f4] ring-1 ring-[#25d366]'
                    : 'border-[#2d2722] bg-[#1a1714] text-[#a8a29e] hover:border-[#3e3731]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <MessageCircle className={`w-5 h-5 ${paymentMethod === 'whatsapp' ? 'text-[#25d366]' : 'text-[#78716c]'}`} />
                    {paymentMethod === 'whatsapp' && <CheckCircle2 className="w-4 h-4 text-[#25d366]" />}
                  </div>
                  <div className="font-semibold text-xs text-[#f5f5f4]">Order via WhatsApp</div>
                  <div className="text-[10px] text-[#a8a29e] mt-1 leading-normal">
                    Direct chat with baker &amp; Pay on Delivery (Cash/UPI)
                  </div>
                </div>
                <div className="text-[10px] text-[#25d366] font-medium mt-3">Pay on Arrival (COD)</div>
              </button>
            </div>

            {/* Detailed View for Choice 1: UPI */}
            {paymentMethod === 'upi' && (
              <div className="mt-4">
                <UpiPaymentView
                  upiId={settings.upiId || 'cakehouse.erattupetta@oksbi'}
                  payeeName={settings.upiPayeeName || settings.shopName || 'Cake House Erattupetta'}
                  amount={totalAmount}
                  orderId={pendingOrderId}
                  utr={upiUtr}
                  setUtr={setUpiUtr}
                  receiptUrl={upiReceiptUrl}
                  setReceiptUrl={setUpiReceiptUrl}
                />
              </div>
            )}

            {/* Detailed View for Choice 2: Stripe */}
            {paymentMethod === 'stripe' && (
              <div className="mt-4 p-4 bg-[#141210] border border-[#2d2722] rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-[#a8a29e]">
                  <span className="font-semibold text-[#f5f5f4]">Stripe Card Payment</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#78716c]">
                    <span>Visa</span>
                    <span>·</span>
                    <span>Mastercard</span>
                    <span>·</span>
                    <span>RuPay</span>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                    value={cardNumber}
                    maxLength={19}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] placeholder-[#78716c] font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={cardExp}
                    maxLength={5}
                    onChange={e => setCardExp(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] placeholder-[#78716c] font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                  <input
                    type="password"
                    placeholder="CVC / CVV"
                    value={cardCvc}
                    maxLength={4}
                    onChange={e => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] placeholder-[#78716c] font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="text-[11px] text-[#78716c] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stripe test simulator initialized. Card is processed securely.</span>
                </div>
              </div>
            )}

            {/* Detailed View for Choice 3: WhatsApp */}
            {paymentMethod === 'whatsapp' && (
              <div className="mt-4 p-4 bg-[#141210] border border-[#25d366]/30 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#25d366] font-semibold">
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant WhatsApp Confirmation &amp; Doorstep Payment</span>
                </div>
                <p className="text-[#a8a29e] text-[11px] leading-relaxed">
                  Clicking "Confirm Order via WhatsApp" will generate your complete cake order details and open a direct chat with our master baker at <strong className="text-[#f5f5f4]">{settings.shopPhone}</strong>. You can pay cash or scan the delivery person's UPI QR upon doorstep arrival in Erattupetta.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Order Breakdown */}
          <div className="p-4 bg-[#141210] border border-[#2d2722] rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-[#a8a29e]">
              <span>Items Total ({items.length} items)</span>
              <span className="text-[#f5f5f4] tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#a8a29e]">
              <span>Erattupetta Town Delivery</span>
              <span className="tabular-nums">
                {deliveryFee === 0 ? <span className="text-emerald-400 font-medium">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#f5f5f4] pt-2 border-t border-[#241e1a]">
              <span>Total Payable</span>
              <span className="font-serif text-lg text-[#d4af37] tabular-nums">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 py-4 border-t border-[#2d2722] bg-[#141210] flex items-center justify-between">
          <button
            onClick={closeCheckout}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-[#a8a29e] hover:text-[#f5f5f4] transition-colors"
          >
            Back to Bag
          </button>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 ${
              paymentMethod === 'upi'
                ? 'bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] shadow-[#d4af37]/20'
                : paymentMethod === 'whatsapp'
                ? 'bg-[#25d366] hover:bg-[#20ba59] text-white shadow-[#25d366]/20'
                : 'bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] shadow-[#d4af37]/20'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Order...</span>
              </>
            ) : paymentMethod === 'upi' ? (
              <>
                <QrCode className="w-4 h-4" />
                <span>Verify &amp; Confirm UPI Order (₹{totalAmount.toLocaleString('en-IN')})</span>
              </>
            ) : paymentMethod === 'whatsapp' ? (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>Confirm Order via WhatsApp</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{totalAmount.toLocaleString('en-IN')} with Stripe</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
