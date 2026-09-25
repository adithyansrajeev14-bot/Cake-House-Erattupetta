export interface AdminSettings {
  adminPath: string; // e.g. "/getinside"
  adminPasswordHash?: string;
  shopName: string;
  shopPhone: string;
  shopWhatsApp: string;
  shopAddress: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  heroHeadline: string;
  heroSubtitle: string;
  heroImageUrl: string;
  faviconUrl: string;

  // Stripe & Bank Details
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeTestMode: boolean;
  bankHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  upiId: string;
  upiPayeeName: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  occasion: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  created_at: string;
}
