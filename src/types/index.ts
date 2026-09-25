export type ProductCategory = 'all' | 'custom-cakes' | 'brownies' | 'puddings' | 'hampers';

export interface WeightOption {
  label: string;
  weightGrams: number;
  priceMultiplier: number;
  servings: string;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  title: string;
  category: 'custom-cakes' | 'brownies' | 'puddings' | 'hampers';
  price: number; // Base price in INR
  image_url: string;
  description: string;
  weight_options: WeightOption[];
  available_flavors?: string[];
  is_eggless_available: boolean;
  preparation_time: string;
  tag?: string;
  badge?: string;
  rating: number;
  reviews_count: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  title: string;
  category: 'custom-cakes' | 'brownies' | 'puddings' | 'hampers';
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  image_url: string;
  selectedWeight: string;
  selectedFlavor?: string;
  customMessage?: string;
  isEggless: boolean;
  candles?: boolean;
  giftBox?: boolean;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  delivery_address: string;
  landmark?: string;
  delivery_date: string;
  delivery_slot: string;
  items_json: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: 'received' | 'baking' | 'ready' | 'delivered';
  payment_method: 'whatsapp' | 'stripe' | 'cod' | 'upi';
  payment_status: 'paid' | 'pending';
  stripe_payment_id?: string;
  upi_utr_id?: string;
  upi_receipt_url?: string;
  notes?: string;
  created_at: string;
}

export interface CustomCakeInquiry {
  flavor: string;
  weight: string;
  weightGrams: number;
  style: string;
  tier: string;
  cakeMessage: string;
  deliveryDate: string;
  deliverySlot: string;
  eggless: boolean;
  referenceImageName?: string;
  referenceImagePreview?: string;
  specialNotes?: string;
  estimatedPrice: number;
}
