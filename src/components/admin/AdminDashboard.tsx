import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  ShoppingBag,
  Cake,
  Palette,
  Star,
  CreditCard,
  Shield,
  LogOut,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Copy,
  Eye,
  Smartphone,
} from 'lucide-react';
import { Product, Order } from '../../types';
import { adminStore } from '../../lib/adminStore';
import { AdminSettings, CustomerReview, GalleryItem } from '../../types/admin';
import { isSupabaseConfigured } from '../../lib/supabase';
import { buildUpiPayUri } from '../../lib/orderServices';

interface AdminDashboardProps {
  onLogout: () => void;
  onExit: () => void;
}

type TabType = 'orders' | 'cakes' | 'branding' | 'gallery_reviews' | 'payments' | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onExit }) => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [settings, setSettings] = useState<AdminSettings>(() => adminStore.getSettings());
  const [products, setProducts] = useState<Product[]>(() => adminStore.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => adminStore.getOrders());
  const [reviews, setReviews] = useState<CustomerReview[]>(() => adminStore.getReviews());
  const [gallery, setGallery] = useState<GalleryItem[]>(() => adminStore.getGallery());

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Receipt preview modal state
  const [previewReceiptModal, setPreviewReceiptModal] = useState<string | null>(null);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);

  // Admin UPI QR Code preview state
  const [adminQrPreviewUrl, setAdminQrPreviewUrl] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (settings.upiId) {
      const uri = buildUpiPayUri({
        upiId: settings.upiId,
        payeeName: settings.upiPayeeName || settings.shopName || 'Cake House Erattupetta',
        amount: 999,
        orderId: 'SAMPLE',
      });
      QRCode.toDataURL(uri, {
        margin: 1,
        width: 180,
        color: { dark: '#141210', light: '#ffffff' },
      })
        .then(setAdminQrPreviewUrl)
        .catch(() => {});
    }
  }, [settings.upiId, settings.upiPayeeName, settings.shopName]);

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setSettings(adminStore.getSettings());
      setProducts(adminStore.getProducts());
      setOrders(adminStore.getOrders());
      setReviews(adminStore.getReviews());
      setGallery(adminStore.getGallery());
    });
    return unsub;
  }, []);

  // --- Order Tab State ---
  const [orderFilter, setOrderFilter] = useState<'all' | 'received' | 'baking' | 'ready' | 'delivered'>('all');

  const filteredOrders = orders.filter(o => orderFilter === 'all' || o.status === orderFilter);

  // --- Cake CRUD Modal State ---
  const [isCakeModalOpen, setIsCakeModalOpen] = useState(false);
  const [editingCake, setEditingCake] = useState<Partial<Product> | null>(null);
  const [isUploadingCakeImg, setIsUploadingCakeImg] = useState(false);
  const cakeFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddCake = () => {
    setEditingCake({
      id: `cake-${Date.now()}`,
      title: '',
      category: 'custom-cakes',
      price: 800,
      image_url: products[0]?.image_url || '',
      description: '',
      weight_options: [
        { label: '500g (Half Kg)', weightGrams: 500, priceMultiplier: 1, servings: '4-6 portions', isDefault: true },
        { label: '1 kg', weightGrams: 1000, priceMultiplier: 1.85, servings: '8-12 portions' },
      ],
      available_flavors: ['Classic Chocolate', 'Vanilla Truffle'],
      is_eggless_available: true,
      preparation_time: '24 hours notice',
      tag: 'New Item',
      rating: 5.0,
      reviews_count: 1,
    });
    setIsCakeModalOpen(true);
  };

  const handleOpenEditCake = (cake: Product) => {
    setEditingCake({ ...cake });
    setIsCakeModalOpen(true);
  };

  const handleSaveCake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCake?.title || !editingCake?.price || !editingCake?.description) {
      showToast('Please fill out all required cake fields.', 'error');
      return;
    }
    adminStore.saveProduct(editingCake as Product);
    setIsCakeModalOpen(false);
    setEditingCake(null);
    showToast('Cake saved to storefront catalog!');
  };

  const handleDeleteCake = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      adminStore.deleteProduct(id);
      showToast('Cake deleted from catalog.');
    }
  };

  const handleCakeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCakeImg(true);
      const url = await adminStore.uploadLocalImage(file);
      setEditingCake(prev => prev ? { ...prev, image_url: url } : null);
      showToast('Local image uploaded successfully!');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploadingCakeImg(false);
    }
  };

  // --- Branding & Assets Uploads ---
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingFavicon(true);
      const url = await adminStore.uploadLocalImage(file);
      adminStore.updateSettings({ faviconUrl: url });
      showToast('Favicon updated and applied to browser tab!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleHeroBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingHero(true);
      const url = await adminStore.uploadLocalImage(file);
      adminStore.updateSettings({ heroImageUrl: url });
      showToast('Hero banner image updated!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploadingHero(false);
    }
  };

  // --- Gallery & Reviews state ---
  const [newReview, setNewReview] = useState({ name: '', occasion: '', rating: 5, text: '' });
  const [isAddingReview, setIsAddingReview] = useState(false);

  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', category: 'Custom Cakes', imageUrl: '' });
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [isUploadingGalleryImg, setIsUploadingGalleryImg] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleSaveNewReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) {
      showToast('Name and review text are required.', 'error');
      return;
    }
    adminStore.saveReview({
      id: `rev-${Date.now()}`,
      name: newReview.name,
      occasion: newReview.occasion || 'Celebration Bake',
      rating: newReview.rating,
      text: newReview.text,
      created_at: new Date().toISOString(),
    });
    setNewReview({ name: '', occasion: '', rating: 5, text: '' });
    setIsAddingReview(false);
    showToast('Customer review added to homepage!');
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingGalleryImg(true);
      const url = await adminStore.uploadLocalImage(file);
      setNewGalleryItem(prev => ({ ...prev, imageUrl: url }));
      showToast('Gallery image uploaded!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploadingGalleryImg(false);
    }
  };

  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.title || !newGalleryItem.imageUrl) {
      showToast('Title and uploaded image are required.', 'error');
      return;
    }
    adminStore.saveGalleryItem({
      id: `gal-${Date.now()}`,
      title: newGalleryItem.title,
      category: newGalleryItem.category,
      imageUrl: newGalleryItem.imageUrl,
      created_at: new Date().toISOString(),
    });
    setNewGalleryItem({ title: '', category: 'Custom Cakes', imageUrl: '' });
    setIsAddingGallery(false);
    showToast('Image added to customer gallery!');
  };

  // --- Dynamic Route and Password Settings ---
  const [customPath, setCustomPath] = useState(settings.adminPath);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateAdminPath = (e: React.FormEvent) => {
    e.preventDefault();
    const res = adminStore.updateAdminPath(customPath);
    if (res.success) {
      window.history.replaceState({}, '', customPath);
      showToast(`Admin route successfully changed to ${customPath}!`);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    const res = adminStore.updatePassword(currentPassword, newPassword);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Admin password updated successfully!');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#100e0c] text-[#f5f5f4] flex flex-col font-sans selection:bg-[#d4af37]/30">
      {/* Toast popup */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium border animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : 'bg-red-950/90 text-red-200 border-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-[#161311] border-b border-[#2e2823] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg sm:text-xl font-bold text-[#f5f5f4]">
              {settings.shopName}
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded border border-[#d4af37]/30">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#a8a29e] hover:text-[#f5f5f4] bg-[#221e1a] hover:bg-[#2b2520] rounded-lg border border-[#332d28] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">View Storefront</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-950/30 hover:bg-red-950/50 rounded-lg border border-red-900/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar border-t border-[#241e19]">
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
            { id: 'cakes', label: 'Cake Catalog', icon: Cake, count: products.length },
            { id: 'branding', label: 'Branding & Assets', icon: Palette },
            { id: 'gallery_reviews', label: 'Gallery & Reviews', icon: Star },
            { id: 'payments', label: 'Payments & Bank', icon: CreditCard },
            { id: 'security', label: 'Security & Route', icon: Shield },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                    : 'border-transparent text-[#a8a29e] hover:text-[#f5f5f4]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      isActive ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-[#241e19] text-[#78716c]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* ========================================================================= */}
        {/* TAB 1: ORDERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#f5f5f4]">Customer Orders</h2>
                <p className="text-xs text-[#a8a29e]">
                  Manage incoming bespoke cake requests and delivery scheduling.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-[#1a1714] border border-[#2d2722] rounded-xl overflow-x-auto no-scrollbar">
                {(['all', 'received', 'baking', 'ready', 'delivered'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize transition-all ${
                      orderFilter === st
                        ? 'bg-[#d4af37] text-[#12100e] font-bold'
                        : 'text-[#a8a29e] hover:text-[#f5f5f4]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-[#161311] border border-[#2a241f] rounded-2xl">
                <ShoppingBag className="w-10 h-10 text-[#78716c] mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold text-[#f5f5f4]">No orders in this status</h3>
                <p className="text-xs text-[#a8a29e] mt-1">
                  Orders placed by customers through the storefront will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-4 hover:border-[#3d352d] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#25201b]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-[#d4af37]">#{order.id}</span>
                        <span className="text-xs text-[#78716c]">
                          {new Date(order.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status badge & selector */}
                        <select
                          value={order.status}
                          aria-label="Order Status"
                          onChange={e => {
                            adminStore.updateOrderStatus(order.id, e.target.value as any);
                            showToast(`Order #${order.id} updated to ${e.target.value}`);
                          }}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                            order.status === 'delivered'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                              : order.status === 'baking'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                              : order.status === 'ready'
                              ? 'bg-blue-950/40 text-blue-300 border-blue-800'
                              : 'bg-[#221e1a] text-[#d4af37] border-[#3e3731]'
                          }`}
                        >
                          <option value="received">Received</option>
                          <option value="baking">Baking</option>
                          <option value="ready">Ready for Pickup/Drop</option>
                          <option value="delivered">Delivered</option>
                        </select>

                        {/* Payment badge */}
                        <button
                          onClick={() => {
                            const next = order.payment_status === 'paid' ? 'pending' : 'paid';
                            adminStore.updateOrderPaymentStatus(order.id, next);
                            showToast(`Order #${order.id} marked as ${next}`);
                          }}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950/40 text-amber-400 border-amber-800'
                          }`}
                        >
                          {order.payment_status === 'paid' ? 'Paid ✓' : 'Payment Pending'}
                        </button>
                      </div>
                    </div>

                    {/* Payment Method & UTR Verification Block */}
                    {order.payment_method === 'upi' ? (
                      <div className="p-3 bg-[#13110f] border border-[#d4af37]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>UPI Payment</span>
                          </span>

                          <span className="text-[#a8a29e]">UTR / Ref:</span>
                          {order.upi_utr_id ? (
                            <span className="font-mono font-bold text-[#f5f5f4] bg-[#1a1714] px-2 py-0.5 rounded border border-[#2d2722]">
                              {order.upi_utr_id}
                            </span>
                          ) : (
                            <span className="text-[#78716c] italic">Not provided</span>
                          )}

                          {order.upi_utr_id && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.upi_utr_id!);
                                setCopiedUtrId(order.id);
                                setTimeout(() => setCopiedUtrId(null), 2000);
                              }}
                              className="text-[#a8a29e] hover:text-[#d4af37] p-1 bg-[#1a1714] rounded border border-[#2d2722]"
                              title="Copy UTR ID"
                            >
                              {copiedUtrId === order.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {order.upi_receipt_url && (
                            <button
                              onClick={() => setPreviewReceiptModal(order.upi_receipt_url!)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#221e1a] hover:bg-[#2b2520] text-[#f5f5f4] text-[11px] rounded-lg border border-[#332d28] transition-colors"
                            >
                              <Eye className="w-3 h-3 text-[#d4af37]" />
                              <span>View Receipt</span>
                            </button>
                          )}

                          {order.payment_status !== 'paid' ? (
                            <button
                              onClick={() => {
                                adminStore.updateOrderPaymentStatus(order.id, 'paid');
                                showToast(`Order #${order.id} marked as Paid!`);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-lg shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verify &amp; Confirm Payment</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Verified &amp; Confirmed
                            </span>
                          )}
                        </div>
                      </div>
                    ) : order.payment_method === 'stripe' ? (
                      <div className="p-2.5 bg-[#13110f] border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Paid Online via Stripe (Card Gateway)</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#78716c]">
                          Ref: {order.stripe_payment_id || 'Approved'}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#13110f] border border-[#25d366]/20 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#25d366]">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Order (Pay on Delivery / COD)</span>
                        </div>
                        <button
                          onClick={() => {
                            const next = order.payment_status === 'paid' ? 'pending' : 'paid';
                            adminStore.updateOrderPaymentStatus(order.id, next);
                            showToast(`Order #${order.id} payment updated to ${next}`);
                          }}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-[#221e1a] text-amber-400 border-[#332d28]'
                          }`}
                        >
                          {order.payment_status === 'paid' ? 'Paid ✓' : 'Mark as Paid'}
                        </button>
                      </div>
                    )}

                    {/* Customer & Delivery row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[#78716c]">Customer:</span>
                        <div className="font-semibold text-[#f5f5f4]">{order.customer_name}</div>
                        <div className="flex items-center gap-2 text-[#a8a29e] mt-1">
                          <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{order.phone}</span>
                          <a
                            href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#25d366] hover:underline flex items-center gap-1 font-medium ml-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#78716c]">Delivery Destination:</span>
                        <div className="text-[#f5f5f4]">
                          {order.delivery_address}{order.landmark ? ` (Near ${order.landmark})` : ''}
                        </div>
                        <div className="text-[#78716c] mt-1">Erattupetta Area</div>
                      </div>

                      <div>
                        <span className="text-[#78716c]">Scheduled Timing:</span>
                        <div className="font-medium text-[#f5f5f4] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{order.delivery_date}</span>
                        </div>
                        <div className="text-[#a8a29e] flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{order.delivery_slot}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ordered items breakdown */}
                    <div className="bg-[#12100e] p-3.5 rounded-xl border border-[#25201b] space-y-2">
                      <div className="text-[11px] font-semibold text-[#78716c] uppercase tracking-wider">
                        Ordered Items
                      </div>
                      {order.items_json.map((it, idx) => (
                        <div key={idx} className="flex items-start justify-between text-xs py-1">
                          <div>
                            <div className="font-medium text-[#f5f5f4]">
                              {it.quantity}x {it.title} ({it.selectedWeight})
                            </div>
                            {it.customMessage && (
                              <div className="text-[11px] text-[#d4af37] italic">
                                Message: "{it.customMessage}"
                              </div>
                            )}
                            {it.isEggless && (
                              <div className="text-[10px] text-emerald-400">100% Eggless Option</div>
                            )}
                          </div>
                          <div className="font-mono font-semibold text-[#f5f5f4]">
                            ₹{it.totalPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-center pt-2 border-t border-[#25201b] font-bold text-xs text-[#f5f5f4]">
                        <span>Grand Total (Delivery: {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`})</span>
                        <span className="font-serif text-sm text-[#d4af37]">
                          ₹{order.total_amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CAKE CATALOG (CRUD) */}
        {/* ========================================================================= */}
        {activeTab === 'cakes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#f5f5f4]">Cake &amp; Pastry Management</h2>
                <p className="text-xs text-[#a8a29e]">
                  Add, edit, or remove cakes, brownies, puddings, and celebration hampers from your menu.
                </p>
              </div>

              <button
                onClick={handleOpenAddCake}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Cake / Treat</span>
              </button>
            </div>

            {/* Cake Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(cake => (
                <div
                  key={cake.id}
                  className="bg-[#161311] border border-[#2e2823] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#3e352b] transition-all"
                >
                  <div className="relative aspect-[4/3] w-full bg-[#12100e]">
                    <img
                      src={cake.image_url}
                      alt={cake.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#12100e]/85 backdrop-blur-xs text-[#d4af37] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#332d28]">
                      {cake.category}
                    </div>
                    {cake.tag && (
                      <div className="absolute top-2.5 right-2.5 bg-[#d4af37] text-[#12100e] text-[10px] font-bold px-2 py-0.5 rounded">
                        {cake.tag}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#f5f5f4] line-clamp-1">{cake.title}</h3>
                      <p className="text-xs text-[#a8a29e] mt-1 line-clamp-2">{cake.description}</p>
                      <div className="text-xs font-bold text-[#d4af37] mt-2 font-mono">
                        Base: ₹{cake.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#25201b] mt-4">
                      <span className="text-[11px] text-[#78716c]">
                        {cake.weight_options?.length || 1} size option(s)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditCake(cake)}
                          className="p-1.5 text-[#a8a29e] hover:text-[#d4af37] hover:bg-[#221e1a] rounded-lg transition-colors border border-[#332d28]"
                          title="Edit Cake"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCake(cake.id, cake.title)}
                          className="p-1.5 text-[#a8a29e] hover:text-red-400 hover:bg-[#221e1a] rounded-lg transition-colors border border-[#332d28]"
                          title="Delete Cake"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BRANDING & ASSETS */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#f5f5f4]">Branding &amp; Site Assets</h2>
              <p className="text-xs text-[#a8a29e]">
                Upload local favicons, customize hero banners, and update your bakery's contact details.
              </p>
            </div>

            {/* Favicon Upload Section */}
            <div className="p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-[#f5f5f4] uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#d4af37]" />
                <span>1. Browser Tab Favicon</span>
              </h3>
              <p className="text-xs text-[#a8a29e]">
                Upload a square icon (PNG, ICO, SVG) to replace the browser tab logo dynamically.
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#12100e] border border-[#332d28] flex items-center justify-center overflow-hidden">
                  {settings.faviconUrl ? (
                    <img src={settings.faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" />
                  ) : (
                    <Cake className="w-8 h-8 text-[#78716c]" />
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    ref={faviconInputRef}
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isUploadingFavicon}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#241e19] hover:bg-[#332d28] border border-[#3e352b] text-[#f5f5f4] text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{isUploadingFavicon ? 'Uploading...' : 'Upload Local Favicon File'}</span>
                  </button>
                  <p className="text-[11px] text-[#78716c] mt-1">Recommended: 64x64 or 128x128 PNG</p>
                </div>
              </div>
            </div>

            {/* Hero Banner Upload & Headline */}
            <div className="p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-[#f5f5f4] uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#d4af37]" />
                <span>2. Homepage Hero Banner &amp; Typography</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#a8a29e] mb-1">Banner Image Preview</label>
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-[#332d28] bg-[#12100e] mb-2">
                    <img
                      src={settings.heroImageUrl}
                      alt="Hero Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    ref={heroInputRef}
                    accept="image/*"
                    onChange={handleHeroBannerUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => heroInputRef.current?.click()}
                    disabled={isUploadingHero}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#241e19] hover:bg-[#332d28] border border-[#3e352b] text-[#f5f5f4] text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{isUploadingHero ? 'Uploading Banner...' : 'Upload New Hero Banner Image'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#a8a29e] mb-1">Hero Display Headline</label>
                    <input
                      type="text"
                      value={settings.heroHeadline}
                      onChange={e => setSettings({ ...settings, heroHeadline: e.target.value })}
                      className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#a8a29e] mb-1">Hero Subtitle Paragraph</label>
                    <textarea
                      rows={4}
                      value={settings.heroSubtitle}
                      onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bakery Business Info */}
            <div className="p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-[#f5f5f4] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                <span>3. Bakery Contact &amp; Delivery Thresholds</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#a8a29e] mb-1">Bakery Name</label>
                  <input
                    type="text"
                    value={settings.shopName}
                    onChange={e => setSettings({ ...settings, shopName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={settings.shopPhone}
                    onChange={e => setSettings({ ...settings, shopPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">WhatsApp Direct Number (digits only, e.g. 918848671289)</label>
                  <input
                    type="text"
                    value={settings.shopWhatsApp}
                    onChange={e => setSettings({ ...settings, shopWhatsApp: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Free Delivery Threshold (₹)</label>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={e => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#a8a29e] mb-1">Bakery Address in Erattupetta</label>
                  <input
                    type="text"
                    value={settings.shopAddress}
                    onChange={e => setSettings({ ...settings, shopAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    adminStore.updateSettings(settings);
                    showToast('Branding and business settings saved!');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Branding Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GALLERY & REVIEWS */}
        {/* ========================================================================= */}
        {activeTab === 'gallery_reviews' && (
          <div className="space-y-8">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#f5f5f4]">Customer Photo Gallery</h2>
                  <p className="text-xs text-[#a8a29e]">
                    Showcase recent cake masterpieces on the public storefront.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingGallery(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#d4af37] text-[#12100e] text-xs font-bold rounded-xl self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Gallery Photo</span>
                </button>
              </div>

              {/* Add Gallery Form */}
              {isAddingGallery && (
                <form
                  onSubmit={handleSaveGalleryItem}
                  className="p-5 bg-[#161311] border border-[#d4af37]/40 rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#25201b]">
                    <span className="text-xs font-bold text-[#d4af37]">Upload Customer Gallery Photo</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingGallery(false)}
                      className="text-[#a8a29e] hover:text-[#f5f5f4]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <div className="aspect-square bg-[#12100e] rounded-xl border border-[#332d28] overflow-hidden flex items-center justify-center mb-2">
                        {newGalleryItem.imageUrl ? (
                          <img src={newGalleryItem.imageUrl} alt="Upload" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-[#78716c]" />
                        )}
                      </div>
                      <input
                        type="file"
                        ref={galleryInputRef}
                        accept="image/*"
                        onChange={handleGalleryUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={isUploadingGalleryImg}
                        className="w-full py-2 bg-[#221e1a] text-xs text-[#f5f5f4] rounded-lg border border-[#332d28] flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{isUploadingGalleryImg ? 'Uploading...' : 'Pick Local Image'}</span>
                      </button>
                    </div>

                    <div className="sm:col-span-2 space-y-3">
                      <div>
                        <label className="block text-xs text-[#a8a29e] mb-1">Cake / Item Title</label>
                        <input
                          type="text"
                          placeholder="e.g., Two-Tier Floral Lambeth Cake"
                          value={newGalleryItem.title}
                          onChange={e => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                          className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#a8a29e] mb-1">Category</label>
                        <input
                          type="text"
                          placeholder="e.g., Wedding Cakes, Brownies"
                          value={newGalleryItem.category}
                          onChange={e => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })}
                          className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#d4af37] text-[#12100e] text-xs font-bold rounded-xl"
                      >
                        Save to Gallery
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Gallery Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {gallery.map(item => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-[#161311] border border-[#2a241f]"
                  >
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 text-center">
                      <button
                        onClick={() => {
                          adminStore.deleteGalleryItem(item.id);
                          showToast('Gallery image removed');
                        }}
                        className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-white"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-4 pt-6 border-t border-[#241e19]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#f5f5f4]">Customer Testimonials</h3>
                  <p className="text-xs text-[#a8a29e]">
                    Manage local customer reviews shown on the storefront.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingReview(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#d4af37] text-[#12100e] text-xs font-bold rounded-xl self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Review</span>
                </button>
              </div>

              {/* Add Review Form */}
              {isAddingReview && (
                <form
                  onSubmit={handleSaveNewReview}
                  className="p-5 bg-[#161311] border border-[#d4af37]/40 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#25201b]">
                    <span className="text-xs font-bold text-[#d4af37]">Add Customer Review</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingReview(false)}
                      className="text-[#a8a29e] hover:text-[#f5f5f4]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-[#a8a29e] mb-1">Customer Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Maria Thomas"
                        value={newReview.name}
                        onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#a8a29e] mb-1">Occasion / Location</label>
                      <input
                        type="text"
                        placeholder="e.g., Wedding in Aruvithura"
                        value={newReview.occasion}
                        onChange={e => setNewReview({ ...newReview, occasion: e.target.value })}
                        className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#a8a29e] mb-1">Rating (1-5)</label>
                      <select
                        value={newReview.rating}
                        aria-label="Star Rating"
                        onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                      >
                        <option value={5}>5 Stars (Exceptional)</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs text-[#a8a29e] mb-1">Review Feedback</label>
                      <textarea
                        rows={2}
                        placeholder="Write customer review..."
                        value={newReview.text}
                        onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                        className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#d4af37] text-[#12100e] text-xs font-bold rounded-xl"
                    >
                      Publish Review
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-4 bg-[#161311] border border-[#2e2823] rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-[#d4af37]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#d4af37]" />
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            adminStore.deleteReview(rev.id);
                            showToast('Review removed');
                          }}
                          className="text-[#78716c] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#d6d3d1] italic line-clamp-3">"{rev.text}"</p>
                    </div>
                    <div className="pt-3 border-t border-[#25201b] mt-3">
                      <div className="font-semibold text-xs text-[#f5f5f4]">{rev.name}</div>
                      <div className="text-[10px] text-[#78716c]">{rev.occasion}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PAYMENTS & BANK SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#f5f5f4]">Payment &amp; Bank Settings</h2>
              <p className="text-xs text-[#a8a29e]">
                Configure Indian UPI transfer settings, Stripe online credit card checkout, and bank payout credentials.
              </p>
            </div>

            {/* 1. Dedicated UPI Payment Settings */}
            <div className="p-6 bg-[#161311] border border-[#d4af37]/40 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#25201b]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#d4af37]/10 text-[#d4af37] rounded-lg">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#f5f5f4] uppercase tracking-wider">
                      1. UPI Payment Settings (Instant QR &amp; App)
                    </h3>
                    <p className="text-[11px] text-[#a8a29e]">
                      Configure your official UPI ID and business name for customer checkouts
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  GPay · PhonePe · Paytm
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                <div className="md:col-span-2 space-y-3 text-xs">
                  <div>
                    <label className="block text-[#a8a29e] mb-1 font-medium">
                      Store UPI ID * (e.g. your VPA or phone number @upi / @oksbi)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. cakehouse.erattupetta@oksbi or 8848671289@upi"
                      value={settings.upiId}
                      onChange={e => setSettings({ ...settings, upiId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] focus:border-[#d4af37] rounded-xl text-xs font-mono text-[#f5f5f4] focus:outline-none"
                    />
                    <div className="text-[10px] text-[#78716c] mt-1">
                      Direct settlement account receiving real-time customer transfers.
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#a8a29e] mb-1 font-medium">
                      Store Payee / Business Display Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cake House Erattupetta"
                      value={settings.upiPayeeName}
                      onChange={e => setSettings({ ...settings, upiPayeeName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] focus:border-[#d4af37] rounded-xl text-xs text-[#f5f5f4] focus:outline-none"
                    />
                    <div className="text-[10px] text-[#78716c] mt-1">
                      Displays inside customer's banking app when confirming the payment.
                    </div>
                  </div>
                </div>

                {/* Live QR Code Preview */}
                <div className="md:col-span-1 flex flex-col items-center justify-center p-3 bg-white rounded-xl text-center shadow-md">
                  {adminQrPreviewUrl ? (
                    <img
                      src={adminQrPreviewUrl}
                      alt="Admin UPI QR preview"
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-[10px] text-stone-500">
                      Generating preview...
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-stone-800 mt-1">
                    Live QR Preview
                  </span>
                  <span className="text-[9px] text-stone-500">
                    {settings.upiId || 'Enter UPI ID'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Stripe Gateway Card */}
            <div className="p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#25201b]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="text-sm font-semibold text-[#f5f5f4] uppercase tracking-wider">
                    2. Stripe Payment Gateway (Card Payments)
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <span className="text-[#a8a29e]">Test Mode:</span>
                  <input
                    type="checkbox"
                    checked={settings.stripeTestMode}
                    onChange={e => setSettings({ ...settings, stripeTestMode: e.target.checked })}
                    className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#a8a29e] mb-1">Stripe Publishable Key</label>
                  <input
                    type="text"
                    placeholder="pk_live_... or pk_test_..."
                    value={settings.stripePublishableKey}
                    onChange={e => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs font-mono text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Stripe Secret Key (stored securely)</label>
                  <input
                    type="password"
                    placeholder="sk_live_... or sk_test_..."
                    value={settings.stripeSecretKey}
                    onChange={e => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs font-mono text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Stripe Webhook Signing Secret</label>
                  <input
                    type="password"
                    placeholder="whsec_..."
                    value={settings.stripeWebhookSecret}
                    onChange={e => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs font-mono text-[#f5f5f4]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Bank Account Settings */}
            <div className="p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-[#f5f5f4] uppercase tracking-wider pb-2 border-b border-[#25201b]">
                3. Direct Bank Settlement Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#a8a29e] mb-1">Account Beneficiary Name</label>
                  <input
                    type="text"
                    value={settings.bankHolderName}
                    onChange={e => setSettings({ ...settings, bankHolderName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Bank Name &amp; Branch</label>
                  <input
                    type="text"
                    value={settings.bankName}
                    onChange={e => setSettings({ ...settings, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Account Number</label>
                  <input
                    type="text"
                    value={settings.bankAccountNumber}
                    onChange={e => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs font-mono text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={settings.bankIfsc}
                    onChange={e => setSettings({ ...settings, bankIfsc: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs font-mono text-[#f5f5f4]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    adminStore.updateSettings(settings);
                    showToast('Payment & bank settings saved successfully!');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment Credentials</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SECURITY & DYNAMIC ROUTE */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#f5f5f4]">Security &amp; Route Configuration</h2>
              <p className="text-xs text-[#a8a29e]">
                Change your secret admin access URL path and update the administrator password.
              </p>
            </div>

            {/* Dynamic Custom Admin URL Path */}
            <form onSubmit={handleUpdateAdminPath} className="p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-sm font-semibold text-[#f5f5f4] uppercase tracking-wider">
                  Custom Admin Portal Route Path
                </h3>
              </div>
              <p className="text-xs text-[#a8a29e] leading-relaxed">
                By default, this panel is accessed at <code className="text-[#d4af37] font-mono">/getinside</code>. You can change this to any private secret path (e.g., <code className="text-[#d4af37] font-mono">/secret-kitchen</code> or <code className="text-[#d4af37] font-mono">/patisserie-hq</code>).
              </p>

              <div>
                <label className="block text-xs text-[#a8a29e] mb-1">Admin URL Slug</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPath}
                    onChange={e => setCustomPath(e.target.value)}
                    placeholder="/getinside"
                    className="flex-1 px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs font-mono text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] text-xs font-bold rounded-xl whitespace-nowrap"
                  >
                    Update Route
                  </button>
                </div>
                <div className="text-[11px] text-[#78716c] mt-1.5">
                  Current active URL path: <span className="font-mono text-[#d4af37]">{settings.adminPath}</span>
                </div>
              </div>
            </form>

            {/* Change Admin Password */}
            <form onSubmit={handleChangePassword} className="p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-[#f5f5f4] uppercase tracking-wider">
                Change Admin Password
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#a8a29e] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">New Password (minimum 6 characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] font-bold text-xs rounded-xl"
                >
                  Update Password
                </button>
              </div>
            </form>

            {/* Backend Database Status (Protected inside Admin) */}
            <div className="p-6 bg-[#161311] border border-[#2e2823] rounded-2xl space-y-2">
              <h3 className="text-xs font-semibold text-[#78716c] uppercase tracking-wider">
                Internal Backend Synchronization
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-emerald-400'}`}
                />
                <span className="text-[#f5f5f4] font-medium">
                  {isSupabaseConfigured
                    ? 'Connected to Supabase Project'
                    : 'Local Resilient Storage Active (Zero-leak mode)'}
                </span>
              </div>
              <p className="text-[11px] text-[#78716c]">
                All data modifications update in real-time without displaying debug banners on the public website.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* CAKE CRUD MODAL */}
      {/* ========================================================================= */}
      {isCakeModalOpen && editingCake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div
            className="relative w-full max-w-2xl bg-[#171412] border border-[#332d28] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#f5f5f4]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#2d2722] flex items-center justify-between bg-[#141210]">
              <h3 className="font-serif text-xl font-bold text-[#f5f5f4]">
                {editingCake.id && products.some(p => p.id === editingCake.id)
                  ? 'Edit Cake Details'
                  : 'Add New Cake / Product'}
              </h3>
              <button
                onClick={() => {
                  setIsCakeModalOpen(false);
                  setEditingCake(null);
                }}
                className="p-1.5 text-[#a8a29e] hover:text-[#f5f5f4] bg-[#221e1a] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCake} className="p-6 overflow-y-auto space-y-4 text-xs max-h-[72vh]">
              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-[#a8a29e] mb-1.5">
                  Cake Photo (Upload Local File from Device)
                </label>
                <div className="flex items-center gap-4 p-3 bg-[#12100e] border border-[#2d2722] rounded-xl">
                  <div className="w-20 h-20 rounded-lg bg-[#1a1714] border border-[#332d28] overflow-hidden shrink-0">
                    <img
                      src={editingCake.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={cakeFileInputRef}
                      accept="image/*"
                      onChange={handleCakeFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => cakeFileInputRef.current?.click()}
                      disabled={isUploadingCakeImg}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#241e19] hover:bg-[#332d28] border border-[#3e352b] text-[#f5f5f4] rounded-lg text-xs font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{isUploadingCakeImg ? 'Uploading...' : 'Choose Local File'}</span>
                    </button>
                    <p className="text-[10px] text-[#78716c] mt-1">PNG, JPG or WEBP up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a8a29e] mb-1">Title *</label>
                  <input
                    type="text"
                    value={editingCake.title || ''}
                    onChange={e => setEditingCake({ ...editingCake, title: e.target.value })}
                    placeholder="e.g. Belgian Truffle Royale"
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Category *</label>
                  <select
                    value={editingCake.category || 'custom-cakes'}
                    onChange={e => setEditingCake({ ...editingCake, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  >
                    <option value="custom-cakes">Custom Cakes</option>
                    <option value="brownies">Fudge Brownies</option>
                    <option value="puddings">Gourmet Puddings</option>
                    <option value="hampers">Luxury Hampers</option>
                  </select>
                </div>
              </div>

              {/* Base Price & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a8a29e] mb-1">Base Price in INR (₹) *</label>
                  <input
                    type="number"
                    value={editingCake.price || 0}
                    onChange={e => setEditingCake({ ...editingCake, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a29e] mb-1">Badge Tag (Optional)</label>
                  <input
                    type="text"
                    value={editingCake.tag || ''}
                    placeholder="e.g. Bestseller, Limited Run"
                    onChange={e => setEditingCake({ ...editingCake, tag: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#a8a29e] mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={editingCake.description || ''}
                  onChange={e => setEditingCake({ ...editingCake, description: e.target.value })}
                  placeholder="Ingredients, flavors, and styling details..."
                  className="w-full px-3 py-2 bg-[#12100e] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4]"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCake.is_eggless_available ?? true}
                    onChange={e => setEditingCake({ ...editingCake, is_eggless_available: e.target.checked })}
                    className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                  />
                  <span>Eggless Option Available</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-[#2d2722] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCakeModalOpen(false)}
                  className="px-4 py-2 bg-[#221e1a] text-[#a8a29e] hover:text-[#f5f5f4] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] font-bold rounded-xl"
                >
                  Save Cake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
