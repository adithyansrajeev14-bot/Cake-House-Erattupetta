import { Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { AdminSettings, CustomerReview, GalleryItem } from '../types/admin';
import heroCakeImg from '../assets/images/hero_artisanal_cake_1790352959380.jpg';
import belgianTruffleImg from '../assets/images/product_belgian_truffle_1790352976029.jpg';
import fudgeBrowniesImg from '../assets/images/product_fudge_brownies_1790352988145.jpg';
import caramelPuddingImg from '../assets/images/product_caramel_pudding_1790353002344.jpg';
import luxuryHamperImg from '../assets/images/product_luxury_hamper_1790353016321.jpg';

const STORAGE_KEY_PRODUCTS = 'cakehouse_products_v1';
const STORAGE_KEY_ORDERS = 'cakehouse_orders_v1';
const STORAGE_KEY_SETTINGS = 'cakehouse_admin_settings_v1';
const STORAGE_KEY_REVIEWS = 'cakehouse_admin_reviews_v1';
const STORAGE_KEY_GALLERY = 'cakehouse_admin_gallery_v1';
const STORAGE_KEY_SESSION = 'cakehouse_admin_session_v1';
const STORAGE_KEY_PASSWORD = 'cakehouse_admin_custom_password_v1';

const DEFAULT_SETTINGS: AdminSettings = {
  adminPath: '/getinside',
  shopName: 'Cake House Erattupetta',
  shopPhone: '+91 88486 71289',
  shopWhatsApp: '918848671289',
  shopAddress: 'Aruvithura Road, Erattupetta, Kottayam, Kerala - 686122',
  freeDeliveryThreshold: 999,
  standardDeliveryFee: 50,
  heroHeadline: 'Artisanal Custom Cakes & Hampers in Erattupetta',
  heroSubtitle:
    'Handcrafted with 100% pure dairy butter, 54% Callebaut Belgian chocolate, and meticulous vintage piping. We bake exclusively to order for birthdays, weddings, anniversaries, and heartfelt celebrations.',
  heroImageUrl: heroCakeImg,
  faviconUrl: '',
  stripePublishableKey: 'pk_test_sample_51O9CakeHouseErattupettaKey',
  stripeSecretKey: 'sk_test_sample_secure_secret_key',
  stripeWebhookSecret: 'whsec_sample_webhook_secret',
  stripeTestMode: true,
  bankHolderName: 'Cake House Patisserie',
  bankName: 'Federal Bank, Erattupetta Branch',
  bankAccountNumber: '18490200049281',
  bankIfsc: 'FDRL0001849',
  upiId: 'cakehouse.erattupetta@oksbi',
  upiPayeeName: 'Cake House Erattupetta',
};

const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    name: 'Dr. Neha Kurian',
    occasion: '1st Birthday Celebration · Aruvithura',
    rating: 5,
    text: 'Ordered the Vintage Lambeth cake with Belgian chocolate ganache for our daughter’s first birthday in Aruvithura. The piping details were breathtaking and it tasted heavenly—not overly sweet, just pure melted chocolate richness. Everyone asked for the baker’s contact!',
    created_at: '2026-09-10T12:00:00Z',
  },
  {
    id: 'rev-02',
    name: 'Fahad Mohammed',
    occasion: 'Wedding Anniversary · Erattupetta Town',
    rating: 5,
    text: 'The Red Velvet & Cream Cheese cake was exceptionally moist and authentic. Ordering directly through WhatsApp was seamless, and the cake arrived on time in perfect condition. Easily the best custom cake shop in the Kottayam region.',
    created_at: '2026-09-15T15:30:00Z',
  },
  {
    id: 'rev-03',
    name: 'Albin Joseph',
    occasion: 'Corporate Gift Hampers · Pala Road',
    rating: 5,
    text: 'We ordered 15 luxury celebration hampers for our festive season clients. The fudgy brownies with sea salt flakes and the caramel puddings were a huge hit. Beautifully ribboned presentation.',
    created_at: '2026-09-20T18:00:00Z',
  },
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal-01',
    title: 'Vintage Lambeth Two-Tier Wedding Cake',
    category: 'Wedding Cakes',
    imageUrl: heroCakeImg,
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'gal-02',
    title: 'Belgian Couverture Drip with Fresh Berries',
    category: 'Birthday Cakes',
    imageUrl: belgianTruffleImg,
    created_at: '2026-09-05T10:00:00Z',
  },
  {
    id: 'gal-03',
    title: 'Crackly-Top Salted Caramel Brownie Stack',
    category: 'Gourmet Brownies',
    imageUrl: fudgeBrowniesImg,
    created_at: '2026-09-08T10:00:00Z',
  },
  {
    id: 'gal-04',
    title: 'Traditional Malabar Caramel Custard Coupes',
    category: 'Dessert Puddings',
    imageUrl: caramelPuddingImg,
    created_at: '2026-09-12T10:00:00Z',
  },
  {
    id: 'gal-05',
    title: 'Curated Festive Patisserie Hamper Box',
    category: 'Gift Hampers',
    imageUrl: luxuryHamperImg,
    created_at: '2026-09-18T10:00:00Z',
  },
];

class AdminStore {
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Seed initial products if not present
    if (!localStorage.getItem(STORAGE_KEY_PRODUCTS)) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    // Seed settings
    if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    // Seed reviews
    if (!localStorage.getItem(STORAGE_KEY_REVIEWS)) {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    }
    // Seed gallery
    if (!localStorage.getItem(STORAGE_KEY_GALLERY)) {
      localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(DEFAULT_GALLERY));
    }
    // Apply favicon if stored
    const settings = this.getSettings();
    if (settings.faviconUrl) {
      this.applyFavicon(settings.faviconUrl);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- Authentication ---
  public getExpectedPassword(): string {
    const custom = localStorage.getItem(STORAGE_KEY_PASSWORD);
    if (custom) return custom;
    return (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'admin123';
  }

  public checkPassword(password: string): boolean {
    const expected = this.getExpectedPassword();
    return password === expected;
  }

  public login(password: string): boolean {
    if (this.checkPassword(password)) {
      const token = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(STORAGE_KEY_SESSION, token);
      this.notify();
      return true;
    }
    return false;
  }

  public logout(): void {
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    this.notify();
  }

  public isAuthenticated(): boolean {
    return Boolean(sessionStorage.getItem(STORAGE_KEY_SESSION));
  }

  public updatePassword(oldPass: string, newPass: string): { success: boolean; message: string } {
    if (!this.checkPassword(oldPass)) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }
    localStorage.setItem(STORAGE_KEY_PASSWORD, newPass);
    this.notify();
    return { success: true, message: 'Admin password updated successfully.' };
  }

  // --- Dynamic Route Path ---
  public getAdminPath(): string {
    const settings = this.getSettings();
    return settings.adminPath || '/getinside';
  }

  public updateAdminPath(newPath: string): { success: boolean; message: string } {
    let clean = newPath.trim();
    if (!clean.startsWith('/')) {
      clean = '/' + clean;
    }
    if (clean.length < 2 || clean === '/') {
      return { success: false, message: 'Invalid route path. Must be like /custom-admin' };
    }
    this.updateSettings({ adminPath: clean });
    return { success: true, message: `Admin route updated to ${clean}` };
  }

  // --- Settings ---
  public getSettings(): AdminSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  }

  public updateSettings(partial: Partial<AdminSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    if (partial.faviconUrl) {
      this.applyFavicon(partial.faviconUrl);
    }
    this.notify();
  }

  public applyFavicon(url: string) {
    try {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
    } catch (e) {
      console.warn('Could not update favicon in DOM', e);
    }
  }

  // --- Products (Cakes) CRUD ---
  public getProducts(): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  }

  public saveProduct(product: Product): void {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.unshift(product);
    }
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  public deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  // --- Orders Management ---
  public getOrders(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  public updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = status;
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
      this.notify();
    }
  }

  public updateOrderPaymentStatus(orderId: string, payment_status: 'paid' | 'pending'): void {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      orders[idx].payment_status = payment_status;
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
      this.notify();
    }
  }

  // --- Customer Reviews ---
  public getReviews(): CustomerReview[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_REVIEWS;
  }

  public saveReview(review: CustomerReview): void {
    const reviews = this.getReviews();
    const idx = reviews.findIndex(r => r.id === review.id);
    if (idx >= 0) {
      reviews[idx] = review;
    } else {
      reviews.unshift(review);
    }
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    this.notify();
  }

  public deleteReview(id: string): void {
    const reviews = this.getReviews().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    this.notify();
  }

  // --- Customer Gallery ---
  public getGallery(): GalleryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_GALLERY;
  }

  public saveGalleryItem(item: GalleryItem): void {
    const gallery = this.getGallery();
    const idx = gallery.findIndex(g => g.id === item.id);
    if (idx >= 0) {
      gallery[idx] = item;
    } else {
      gallery.unshift(item);
    }
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(gallery));
    this.notify();
  }

  public deleteGalleryItem(id: string): void {
    const gallery = this.getGallery().filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(gallery));
    this.notify();
  }

  // --- File Upload Simulation / Base64 Data URL converter ---
  public async uploadLocalImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return reject(new Error('Please upload an image file (PNG, JPG, WEBP, SVG, etc.).'));
      }
      // Check file size (up to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return reject(new Error('Image file size must be less than 10MB.'));
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Add artificial 500ms realistic processing latency
          setTimeout(() => {
            resolve(reader.result as string);
          }, 400);
        } else {
          reject(new Error('Failed to read image file data.'));
        }
      };
      reader.onerror = () => reject(new Error('File reader error occurred.'));
      reader.readAsDataURL(file);
    });
  }
}

export const adminStore = new AdminStore();
