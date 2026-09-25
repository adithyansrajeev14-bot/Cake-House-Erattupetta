import { CartItem, Order } from '../types';

export const BAKERY_WHATSAPP_NUMBER = '918848671289';
export const BAKERY_PHONE_DISPLAY = '+91 88486 71289';
export const BAKERY_LOCATION = 'Aruvithura Road, Erattupetta, Kottayam, Kerala - 686122';

/**
 * Formats cart details into a clear, beautiful WhatsApp message
 */
export function formatWhatsAppOrderMessage(params: {
  orderId: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  landmark?: string;
  deliveryDate: string;
  deliverySlot: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  upiUtrId?: string;
  notes?: string;
}): string {
  const {
    orderId,
    customerName,
    phone,
    deliveryAddress,
    landmark,
    deliveryDate,
    deliverySlot,
    items,
    subtotal,
    deliveryFee,
    total,
    paymentMethod,
    upiUtrId,
    notes,
  } = params;

  let msg = `🎂 *ORDER REQUEST: Cake House Erattupetta*\n`;
  msg += `─────────────────────────\n`;
  msg += `*Order ID:* #${orderId}\n`;
  msg += `*Customer:* ${customerName}\n`;
  msg += `*Phone:* ${phone}\n`;
  msg += `*Date Required:* ${deliveryDate}\n`;
  msg += `*Preferred Time:* ${deliverySlot}\n`;
  msg += `*Delivery Location:* ${deliveryAddress}${landmark ? ` (Near ${landmark})` : ''}, Erattupetta\n\n`;

  msg += `*ITEMS:* \n`;
  items.forEach((item, index) => {
    msg += `${index + 1}. *${item.quantity}x ${item.title}*\n`;
    msg += `   • Size/Weight: ${item.selectedWeight}\n`;
    if (item.selectedFlavor) msg += `   • Flavor: ${item.selectedFlavor}\n`;
    if (item.customMessage) msg += `   • Inscription: "${item.customMessage}"\n`;
    if (item.isEggless) msg += `   • Preference: 100% Eggless\n`;
    if (item.candles) msg += `   • Free Golden Candles included\n`;
    msg += `   • Amount: ₹${item.totalPrice.toLocaleString('en-IN')}\n\n`;
  });

  msg += `─────────────────────────\n`;
  msg += `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
  msg += `*Delivery:* ${deliveryFee === 0 ? 'FREE (Erattupetta Town)' : `₹${deliveryFee}`}\n`;
  msg += `*GRAND TOTAL:* ₹${total.toLocaleString('en-IN')}\n`;
  
  if (paymentMethod === 'upi') {
    msg += `*Payment:* Paid via UPI (UTR: ${upiUtrId || 'Receipt Submitted'})\n`;
  } else if (paymentMethod === 'stripe') {
    msg += `*Payment:* Paid Online via Stripe\n`;
  } else if (paymentMethod === 'cod') {
    msg += `*Payment:* Cash on Delivery (Doorstep)\n`;
  } else {
    msg += `*Payment:* WhatsApp Order (Pay on Delivery / UPI)\n`;
  }

  if (notes && notes.trim()) {
    msg += `\n*Note for Baker:* ${notes.trim()}\n`;
  }

  msg += `\n_Please confirm availability and baking schedule. Thank you!_`;

  return msg;
}

/**
 * Builds standard UPI payment deep link URI
 */
export function buildUpiPayUri(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  orderId: string;
}): string {
  const { upiId, payeeName, amount, orderId } = params;
  const cleanUpiId = (upiId || '').trim();
  const cleanPayee = (payeeName || 'Cake House Erattupetta').trim();
  const note = `Cake House Order ${orderId}`;
  return `upi://pay?pa=${encodeURIComponent(cleanUpiId)}&pn=${encodeURIComponent(cleanPayee)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
}

/**
 * Builds the wa.me link with encoded order message
 */
export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an easy-to-read order ID
 */
export function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CH-${random}`;
}

export interface StripePaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  errorMessage?: string;
}

/**
 * Simulates Stripe secure payment processing with realistic 1.5s gateway roundtrip
 */
export async function processStripePaymentSimulation(params: {
  amountInINR: number;
  orderId: string;
  customerName: string;
  cardNumber: string;
  cardExp: string;
  cardCvc: string;
}): Promise<StripePaymentResult> {
  // Simple validation
  const cleanCard = params.cardNumber.replace(/\s+/g, '');
  if (cleanCard.length < 15) {
    throw new Error('Please enter a valid card number.');
  }

  // Realistic gateway delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    success: true,
    transactionId: `ch_${Date.now()}_stripe_${Math.random().toString(36).substring(2, 8)}`,
    amount: params.amountInINR,
    currency: 'INR',
  };
}
