import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Product, Category, Order, Coupon, Review, Banner, OrderStatus, PaymentStatus } from '../types/index.ts';
import { api } from '../lib/api.ts';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  CreditCard,
  Boxes,
  Tag,
  Star,
  Image as ImageIcon,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
  TrendingUp,
  Lock,
  Mail,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Search,
  Filter,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, login, logout } = useAuth();
  const { showToast } = useNotifications();

  // Admin Login gate states
  const [adminEmail, setAdminEmail] = useState('admin@learnora.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'products'
    | 'categories'
    | 'orders'
    | 'payments'
    | 'inventory'
    | 'coupons'
    | 'reviews'
    | 'banners'
    | 'customers'
    | 'settings'
  >('overview');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  // Status update modal for Order
  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('Processing');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('Paid');
  const [statusNote, setStatusNote] = useState('');

  // Refund modal
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Customer Return Approved');

  // Bank Transfer verification modal
  const [bankVerifyOrder, setBankVerifyOrder] = useState<Order | null>(null);

  // Customer details modal & search filter
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [orderCustomerFilter, setOrderCustomerFilter] = useState('');

  // Check admin authorization
  const isAdmin = user && user.role === 'admin';

  const loadAllData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [
        analyticsRes,
        prodsRes,
        catsRes,
        ordersRes,
        txnsRes,
        invRes,
        coupsRes,
        revsRes,
        bansRes,
        custsRes,
        setsRes,
      ] = await Promise.all([
        api.getAnalytics(),
        api.getProducts({ limit: 100 }),
        api.getCategories(),
        api.getOrders(),
        api.getPaymentTransactions(),
        api.getInventory(),
        api.getCoupons(),
        api.getAllReviews(),
        api.getBanners(),
        api.getCustomers(),
        api.getSettings(),
      ]);

      if (analyticsRes.stats) setStats(analyticsRes.stats);
      if (prodsRes.products) setProducts(prodsRes.products);
      if (catsRes.categories) setCategories(catsRes.categories);
      if (ordersRes.orders) setOrders(ordersRes.orders);
      if (txnsRes.transactions) setPayments(txnsRes.transactions);
      if (invRes.inventory) setInventory(invRes.inventory);
      if (coupsRes.coupons) setCoupons(coupsRes.coupons);
      if (revsRes.reviews) setReviews(revsRes.reviews);
      if (bansRes.banners) setBanners(bansRes.banners);
      if (custsRes.customers) setCustomers(custsRes.customers);
      if (setsRes.settings) setSettingsData(setsRes.settings);
    } catch (err) {
      console.error('[Admin] Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [user]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setAdminAuthError('Please enter both administrator email and password.');
      return;
    }
    setAdminAuthLoading(true);
    setAdminAuthError(null);
    try {
      await login(adminEmail.trim(), adminPassword);
      showToast('Authenticated as Store Administrator.', 'success');
    } catch (err: any) {
      setAdminAuthError(err.message || 'Invalid administrator credentials. Access restricted.');
      showToast('Admin authentication failed.', 'error');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Security Glow Accent */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-black uppercase tracking-widest text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Restricted Area · URL Access Only
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Learnora Admin Portal
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              This management console is accessible only with verified administrator credentials.
            </p>
          </div>

          {/* Customer Warning if logged in as customer */}
          {user && user.role !== 'admin' && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold">Currently signed in as Customer:</p>
                <p className="text-[11px] text-amber-200/90">{user.email} ({user.name})</p>
                <p className="text-[10px] mt-1 text-amber-300/80">
                  Please authenticate with Administrator credentials below to access this dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {adminAuthError && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{adminAuthError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminSignIn} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@learnora.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="p-1 text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Credentials Helper */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
              <div className="truncate pr-2">
                <span className="text-slate-300 font-semibold">Default Admin:</span> admin@learnora.com / admin123
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@learnora.com');
                  setAdminPassword('admin123');
                }}
                className="shrink-0 px-2 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded font-semibold text-[10px] transition-colors"
              >
                Auto-Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {adminAuthLoading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* Return to store link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handlers for Products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim() || editingProduct?.price === undefined) {
      showToast('Product name and price are required.', 'error');
      return;
    }

    const categoryId = editingProduct.categoryId || categories[0]?.id || 'cat_edu';
    const rawImage = typeof editingProduct.images?.[0] === 'string' ? editingProduct.images[0].trim() : '';
    const images = rawImage
      ? [rawImage]
      : ['/src/assets/images/product_building_blocks_1790783483537.jpg'];

    const payload = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      categoryId,
      images,
      price: Number(editingProduct.price),
      salePrice: editingProduct.salePrice ? Number(editingProduct.salePrice) : null,
      stock: Number(editingProduct.stock ?? 10),
      brand: editingProduct.brand || 'Learnora Essentials',
      ageRange: editingProduct.ageRange || '3-5',
      sku: editingProduct.sku || `LRN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      isActive: editingProduct.isActive !== false,
      isFeatured: Boolean(editingProduct.isFeatured),
    };

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully.', 'success');
      } else {
        await api.createProduct(payload);
        showToast('New product added to catalog.', 'success');
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Product deleted.', 'info');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Categories
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }
    const payload = {
      ...editingCategory,
      name: editingCategory.name.trim(),
      image: editingCategory.image || '/src/assets/images/product_building_blocks_1790783483537.jpg',
      sortOrder: Number(editingCategory.sortOrder || 1),
      isActive: editingCategory.isActive !== false,
    };

    try {
      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, payload);
        showToast('Category updated successfully.', 'success');
      } else {
        await api.createCategory(payload);
        showToast('Category created successfully.', 'success');
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category may become uncategorized.')) return;
    try {
      await api.deleteCategory(id);
      showToast('Category deleted.', 'info');
      setCategories((prev) => prev.filter((c) => c.id !== id));
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCategoryStatus = async (cat: Category) => {
    try {
      const newActive = !cat.isActive;
      await api.updateCategory(cat.id, { isActive: newActive });
      showToast(`Category ${newActive ? 'activated' : 'hidden from public storefront'}.`, 'success');
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, isActive: newActive } : c)));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Orders & Status Pipeline
  const handleUpdateOrderStatus = async () => {
    if (!statusModalOrder) return;
    try {
      await api.updateOrderStatus(statusModalOrder.id, {
        orderStatus: newOrderStatus,
        paymentStatus: newPaymentStatus,
        note: statusNote,
      });
      showToast(`Order status updated to ${newOrderStatus}.`, 'success');
      setStatusModalOrder(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Bank Transfer Verification
  const handleBankVerify = async (approved: boolean) => {
    if (!bankVerifyOrder) return;
    try {
      await api.verifyBankTransfer({
        orderId: bankVerifyOrder.id,
        approved,
      });
      showToast(`Bank transfer ${approved ? 'confirmed' : 'rejected'}.`, 'success');
      setBankVerifyOrder(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Refunds
  const handleProcessRefund = async () => {
    if (!refundModalOrder) return;
    try {
      await api.processRefund({
        orderId: refundModalOrder.id,
        amount: refundAmount,
        reason: refundReason,
      });
      showToast('Refund processed via payment gateway service.', 'success');
      setRefundModalOrder(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Stock update
  const handleUpdateStock = async (productId: string, stock: number) => {
    try {
      await api.updateInventory(productId, { stock });
      showToast('Stock count adjusted.', 'success');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Reviews Moderation
  const handleReviewAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateReviewStatus(id, status);
      showToast(`Review ${status}.`, 'info');
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Coupons
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.code) return;
    try {
      if (editingCoupon.id) {
        await api.updateCoupon(editingCoupon.id, editingCoupon);
        showToast('Coupon updated successfully.', 'success');
      } else {
        await api.createCoupon(editingCoupon);
        showToast('Coupon created & activated.', 'success');
      }
      setCouponModalOpen(false);
      setEditingCoupon(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to remove this coupon?')) return;
    try {
      await api.deleteCoupon(id);
      showToast('Coupon removed.', 'info');
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCouponStatus = async (coupon: Coupon) => {
    try {
      const newActive = !coupon.active;
      await api.updateCoupon(coupon.id, { active: newActive });
      showToast(`Coupon ${newActive ? 'activated' : 'deactivated'}.`, 'success');
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: newActive } : c)));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Banners & CMS
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title) return;
    try {
      if (editingBanner.id) {
        await api.updateBanner(editingBanner.id, editingBanner);
        showToast('Banner updated successfully.', 'success');
      } else {
        await api.createBanner(editingBanner);
        showToast('Banner created successfully.', 'success');
      }
      setBannerModalOpen(false);
      setEditingBanner(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await api.deleteBanner(id);
      showToast('Banner deleted.', 'info');
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleBannerStatus = async (banner: Banner) => {
    try {
      const newActive = !banner.active;
      await api.updateBanner(banner.id, { active: newActive });
      showToast(`Banner ${newActive ? 'activated' : 'deactivated'}.`, 'success');
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, active: newActive } : b)));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'categories', label: 'Categories', icon: FolderTree, count: categories.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { id: 'payments', label: 'Transactions & Refunds', icon: CreditCard },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'reviews', label: 'Reviews Moderation', icon: Star },
    { id: 'banners', label: 'Banners & CMS', icon: ImageIcon },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
            Learnora Merchant Command Center
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Store Administration & Inventory
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{user?.name || 'Administrator'}</span>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
          >
            <span>View Public Store</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              logout();
              showToast('Signed out of Administrator Portal', 'info');
              onNavigate('/');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${active ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* ==============================================================
              TAB 1: OVERVIEW ANALYTICS
              ============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-base font-bold text-slate-900">Store Performance Analytics</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time revenue, order flow, and inventory alerts</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Revenue</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    Rs. {(stats?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Verified Net Paid
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Orders</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {stats?.totalOrders || orders.length}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {stats?.pendingOrders || 0} pending dispatch
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Products</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {products.length}
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                    {stats?.lowStockCount || 0} low stock alerts
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Customer Base</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {stats?.totalCustomers || customers.length}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Registered parents</span>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Recent Customer Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900">#{o.orderNumber}</span>
                        <span className="text-slate-400 mx-2">·</span>
                        <span className="text-slate-600 font-medium">{o.customerName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-800 px-2 py-0.5 rounded bg-slate-100">
                          {o.orderStatus}
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          Rs. {o.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 2: PRODUCTS MANAGEMENT (Multi-Category Attributes Support)
              ============================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Product Catalog Management</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supports Toys, Books, Kids Clothing, and Family products with flexible schemas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      price: 2500,
                      stock: 20,
                      categoryId: categories[0]?.id || 'cat_edu',
                      brand: 'Learnora Craft',
                      ageRange: '3-5',
                      attributes: { material: 'Solid Beechwood', pieces: 50 },
                      tags: ['Montessori'],
                    });
                    setProductModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="border border-slate-200/80 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Sales</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="p-3 flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 block truncate max-w-xs">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-slate-400">SKU: {p.sku}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">
                          {categories.find((c) => c.id === p.categoryId)?.name || p.categoryId}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 tabular-nums">
                          Rs. {(p.salePrice ?? p.price).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-semibold tabular-nums px-2 py-0.5 rounded text-[11px] ${
                              p.stock === 0
                                ? 'bg-rose-100 text-rose-800'
                                : p.stock <= p.lowStockThreshold
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-3 tabular-nums text-slate-600">{p.salesCount || 0}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 3: CATEGORIES
              ============================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Dynamic Category Taxonomy</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add new departments (e.g. Toys, Books, Clothing, Baby Essentials) without code changes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory({
                      name: '',
                      description: '',
                      sortOrder: categories.length + 1,
                      isActive: true,
                    });
                    setCategoryModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4 text-xs bg-white shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={c.image}
                        alt=""
                        className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 truncate">{c.name}</h4>
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryStatus(c)}
                            title="Click to toggle visibility in storefront"
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              c.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {c.isActive ? 'ACTIVE' : 'HIDDEN'}
                          </button>
                        </div>
                        <p className="text-slate-500 text-[11px] line-clamp-1">{c.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>/{c.slug}</span>
                          <span>·</span>
                          <span>Order: #{c.sortOrder}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(c);
                          setCategoryModalOpen(true);
                        }}
                        className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-2 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 4: ORDERS MANAGEMENT
              ============================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Order Dispatch & Status Pipeline</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live orders placed by registered customers and guests
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search user, email or #order..."
                      value={orderCustomerFilter}
                      onChange={(e) => setOrderCustomerFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    />
                  </div>
                  {orderCustomerFilter && (
                    <button
                      onClick={() => setOrderCustomerFilter('')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {orderCustomerFilter && (
                <div className="px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <span>Filtered by customer query: <strong>{orderCustomerFilter}</strong></span>
                  <button onClick={() => setOrderCustomerFilter('')} className="font-bold underline text-amber-800">Show All Orders</button>
                </div>
              )}

              <div className="space-y-3">
                {orders
                  .filter((o) => {
                    if (!orderCustomerFilter) return true;
                    const q = orderCustomerFilter.toLowerCase();
                    return (
                      o.userId.toLowerCase().includes(q) ||
                      o.customerEmail.toLowerCase().includes(q) ||
                      o.customerName.toLowerCase().includes(q) ||
                      o.orderNumber.toLowerCase().includes(q)
                    );
                  })
                  .map((o) => (
                  <div
                    key={o.id}
                    className="p-4 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">#{o.orderNumber}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800">{o.customerName}</span>
                        <span className="text-slate-500">({o.customerPhone})</span>
                      </div>
                      <p className="text-slate-600">
                        {o.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[11px]">
                        <span className="font-semibold text-slate-900">
                          Payment Method: {o.paymentMethod.toUpperCase()}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {o.paymentStatus}
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          Rs. {o.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {o.paymentMethod === 'bank_transfer' && o.paymentStatus === 'Pending Verification' && (
                        <button
                          onClick={() => setBankVerifyOrder(o)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg text-xs"
                        >
                          Verify Bank Slip
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setStatusModalOrder(o);
                          setNewOrderStatus(o.orderStatus);
                          setNewPaymentStatus(o.paymentStatus);
                          setStatusNote('');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs"
                      >
                        Update Status ({o.orderStatus})
                      </button>

                      <button
                        onClick={() => {
                          setRefundModalOrder(o);
                          setRefundAmount(o.total);
                        }}
                        className="px-2.5 py-1.5 text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                      >
                        Refund
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 5: PAYMENTS & REFUNDS
              ============================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Payment Gateway Transactions & Log</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Server-side verified payments and provider transaction ledger
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3">Provider Ref</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-medium text-slate-800">{t.id}</td>
                        <td className="p-3 font-mono text-slate-500">{t.providerTransactionId}</td>
                        <td className="p-3 font-bold text-slate-900 tabular-nums">
                          Rs. {t.amount.toLocaleString()}
                        </td>
                        <td className="p-3 capitalize">{t.paymentMethod}</td>
                        <td className="p-3">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              t.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'Refunded'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 tabular-nums">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 6: INVENTORY & STOCK
              ============================================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Inventory & Stock Alert Console</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time warehouse counts and low stock warnings to prevent overselling
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Alert Threshold</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Adjust Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((inv) => (
                      <tr key={inv.productId} className="hover:bg-slate-50/60">
                        <td className="p-3 font-semibold text-slate-900">{inv.name}</td>
                        <td className="p-3 font-mono text-slate-500">{inv.sku}</td>
                        <td className="p-3 font-bold tabular-nums text-slate-900">{inv.stock}</td>
                        <td className="p-3 text-slate-500 tabular-nums">&lt; {inv.lowStockThreshold}</td>
                        <td className="p-3">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              inv.status === 'In Stock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'Low Stock'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStock(inv.productId, inv.stock + 10)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-800 text-[11px]"
                            >
                              +10 Units
                            </button>
                            <button
                              onClick={() => handleUpdateStock(inv.productId, Math.max(0, inv.stock - 1))}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-800 text-[11px]"
                            >
                              -1
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 7: COUPONS
              ============================================================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Promotions & Discount Coupons</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage fixed or percentage promotional cart discount codes</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCoupon({
                      code: '',
                      discountType: 'percentage',
                      discountValue: 10,
                      minimumOrder: 1500,
                      maximumDiscount: 1000,
                      usageLimit: 500,
                      active: true,
                    });
                    setCouponModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coup) => (
                  <div key={coup.id} className="p-4 border border-slate-200/80 rounded-2xl space-y-3 text-xs bg-white shadow-xs hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-slate-900 font-mono tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg">
                        {coup.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCouponStatus(coup)}
                        title="Click to toggle coupon active status"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          coup.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {coup.active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-800 font-semibold">
                        Discount: <span className="text-amber-700 font-bold">{coup.discountValue}{coup.discountType === 'percentage' ? '%' : ' Rs.'} OFF</span>
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Min Order: <strong>Rs. {coup.minimumOrder.toLocaleString()}</strong>
                        {coup.maximumDiscount ? ` · Max Cap: Rs. ${coup.maximumDiscount.toLocaleString()}` : ''}
                      </p>
                      <p className="text-slate-400 text-[11px]">Used: <strong>{coup.usedCount}</strong> times {coup.usageLimit ? `/ ${coup.usageLimit} limit` : ''}</p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCoupon(coup);
                          setCouponModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Edit Coupon"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coup.id)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Remove Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 8: REVIEWS MODERATION
              ============================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Product Reviews Moderation</h2>
                <p className="text-xs text-slate-500 mt-0.5">Approve or remove customer reviews</p>
              </div>

              <div className="space-y-3">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{r.userName}</span>
                        <span className="text-amber-500 font-semibold">{r.rating} ★</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800">{r.title}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{r.comment}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold capitalize">
                        {r.status}
                      </span>
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => handleReviewAction(r.id, 'approved')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button
                          onClick={() => handleReviewAction(r.id, 'rejected')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold hover:bg-rose-100"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 9: BANNERS & CMS
              ============================================================== */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">CMS Promotional Banners</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage homepage campaigns, carousel slides and promotional highlights</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner({
                      title: '',
                      subtitle: '',
                      image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg',
                      ctaText: 'Shop Now',
                      link: '/shop',
                      sortOrder: banners.length + 1,
                      active: true,
                    });
                    setBannerModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Banner</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 border border-slate-200/80 rounded-2xl flex flex-col gap-3 text-xs bg-white shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-slate-100">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleBannerStatus(b)}
                          title="Click to toggle banner active state"
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs cursor-pointer backdrop-blur-md transition-colors ${
                            b.active ? 'bg-emerald-600/90 text-white hover:bg-emerald-700' : 'bg-slate-800/85 text-white hover:bg-slate-900'
                          }`}
                        >
                          {b.active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-slate-950/70 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                        Order #{b.sortOrder}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                      <p className="text-slate-500 line-clamp-2">{b.subtitle}</p>
                      <p className="text-[11px] text-amber-700 font-semibold pt-1">
                        CTA: <strong>{b.ctaText}</strong> → <span className="font-mono text-slate-600">{b.link}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBanner(b);
                          setBannerModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(b.id)}
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 10: CUSTOMER DIRECTORY & USER DATA
              ============================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Registered Customer Accounts</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live logged-in customers, their spending, order count, and registered activity
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by customer name, email..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-2xl overflow-x-auto text-xs bg-white shadow-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Orders Placed</th>
                      <th className="p-3">Total Spend</th>
                      <th className="p-3">Auth Providers</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers
                      .filter((c) => {
                        if (!customerSearchQuery) return true;
                        const q = customerSearchQuery.toLowerCase();
                        return (
                          c.name.toLowerCase().includes(q) ||
                          c.email.toLowerCase().includes(q) ||
                          (c.phone && c.phone.includes(q))
                        );
                      })
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 block">{c.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600">
                            <div>{c.email}</div>
                            {c.phone && <div className="text-[11px] text-slate-400">{c.phone}</div>}
                          </td>
                          <td className="p-3 font-bold tabular-nums">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                              {c.orderCount || 0} orders
                            </span>
                          </td>
                          <td className="p-3 font-extrabold text-slate-900 tabular-nums">
                            Rs. {(c.totalSpent || 0).toLocaleString()}
                          </td>
                          <td className="p-3 capitalize">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {c.connectedProviders?.join(', ') || 'email'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedCustomerDetail(c)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Inspect this user's data & orders"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect Data</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderCustomerFilter(c.email);
                                  setActiveTab('orders');
                                }}
                                className="px-2 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                                title="Filter orders placed by this customer"
                              >
                                Filter Orders
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 11: SETTINGS
              ============================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Global Store Configuration</h2>
                <p className="text-xs text-slate-500 mt-0.5">Delivery thresholds, corporate bank details, and currency</p>
              </div>

              {settingsData && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Store Name:</span>
                    <span className="font-bold text-slate-900">{settingsData.storeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Free Delivery Threshold:</span>
                    <span className="font-bold text-slate-900 tabular-nums">Rs. {settingsData.freeShippingThreshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard Delivery Fee:</span>
                    <span className="font-bold text-slate-900 tabular-nums">Rs. {settingsData.standardShippingFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Corporate Bank Account:</span>
                    <span className="font-bold text-slate-900">{settingsData.bankAccountDetails?.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Corporate IBAN:</span>
                    <span className="font-mono text-slate-800">{settingsData.bankAccountDetails?.iban}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ==============================================================
          MODAL: ADD / EDIT PRODUCT
          ============================================================== */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Montessori Wooden Arches"
                  className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                />
              </div>

              {/* Product Image URL with quick presets */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Product Image *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.images?.[0] || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      images: [e.target.value],
                    })
                  }
                  placeholder="/src/assets/images/... or https://..."
                  className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[11px]"
                />

                <div className="mt-2 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Quick studio photography presets:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Building Blocks', url: '/src/assets/images/product_building_blocks_1790783483537.jpg' },
                      { label: 'STEM Robotics', url: '/src/assets/images/product_stem_robotics_1790783464103.jpg' },
                      { label: 'Wooden Dollhouse', url: '/src/assets/images/product_wooden_dollhouse_1790783499318.jpg' },
                      { label: 'Kids Playtime', url: '/src/assets/images/hero_kids_playtime_1790783444732.jpg' },
                      { label: 'Creative Crafts', url: '/src/assets/images/hero_creative_crafts_1790785215362.jpg' },
                      { label: 'Family Board Games', url: '/src/assets/images/hero_family_playtime_1790785198699.jpg' },
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            images: [preset.url],
                          })
                        }
                        className={`p-1 border rounded-xl text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          editingProduct.images?.[0] === preset.url ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-full h-10 object-cover rounded-lg" />
                        <span className="text-[10px] font-semibold text-slate-700 truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regular Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.salePrice ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Discounted price"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryId || categories[0]?.id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age Recommendation</label>
                  <select
                    value={editingProduct.ageRange || '3-5'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, ageRange: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="0-2">0–2 Years</option>
                    <option value="3-5">3–5 Years</option>
                    <option value="6-8">6–8 Years</option>
                    <option value="9-12">9–12 Years</option>
                    <option value="12+">12+ Years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stock ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. LRN-TOY-01"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Learnora"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Detail product safety, materials, and learning developmental benefits..."
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prod_featured"
                    checked={Boolean(editingProduct.isFeatured)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                  />
                  <label htmlFor="prod_featured" className="font-semibold text-slate-700 cursor-pointer">
                    Featured on homepage
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prod_active"
                    checked={editingProduct.isActive !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                  />
                  <label htmlFor="prod_active" className="font-semibold text-slate-700 cursor-pointer">
                    Active in storefront
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md"
                >
                  {editingProduct.id ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: ADD / EDIT CATEGORY
          ============================================================== */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory.id ? 'Edit Department / Category' : 'Add New Department / Category'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STEM Robotics, Montessori Toys, Kids Books"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slug (URL Route)</label>
                <input
                  type="text"
                  placeholder="e.g. stem-robotics (auto-generated if blank)"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary for category headers and collection cards..."
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Image URL *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.image || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  placeholder="/src/assets/images/... or https://..."
                  className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[11px]"
                />

                <div className="mt-2 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Quick studio photo selector:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Building Blocks', url: '/src/assets/images/product_building_blocks_1790783483537.jpg' },
                      { label: 'STEM Robotics', url: '/src/assets/images/product_stem_robotics_1790783464103.jpg' },
                      { label: 'Dollhouse Heritage', url: '/src/assets/images/product_wooden_dollhouse_1790783499318.jpg' },
                      { label: 'Kids Playtime', url: '/src/assets/images/hero_kids_playtime_1790783444732.jpg' },
                      { label: 'Creative Crafts', url: '/src/assets/images/hero_creative_crafts_1790785215362.jpg' },
                      { label: 'Family Board Games', url: '/src/assets/images/hero_family_playtime_1790785198699.jpg' },
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setEditingCategory({ ...editingCategory, image: preset.url })}
                        className={`p-1 border rounded-xl text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          editingCategory.image === preset.url ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-full h-10 object-cover rounded-lg" />
                        <span className="text-[10px] font-semibold text-slate-700 truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingCategory.sortOrder || 1}
                    onChange={(e) => setEditingCategory({ ...editingCategory, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cat_active"
                    checked={editingCategory.isActive !== false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                  />
                  <label htmlFor="cat_active" className="font-semibold text-slate-700 cursor-pointer">
                    Visible in navigation
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md"
                >
                  {editingCategory.id ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: UPDATE ORDER STATUS
          ============================================================== */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Update Order #{statusModalOrder.orderNumber}
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Order Pipeline Status</label>
              <select
                value={newOrderStatus}
                onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 border rounded-xl outline-none bg-white font-medium"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 border rounded-xl outline-none bg-white font-medium"
              >
                <option value="Pending">Pending</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tracking Note / Courier Ref</label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Dispatched via TCS # TCS-938210"
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="flex-1 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateOrderStatus}
                className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: BANK TRANSFER PROOF VERIFICATION
          ============================================================== */}
      {bankVerifyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Verify Bank Transfer #{bankVerifyOrder.orderNumber}
            </h3>
            <p className="text-slate-600">
              Customer Reference: <strong>{bankVerifyOrder.bankTransferReference || 'N/A'}</strong>
            </p>
            <p className="text-slate-600">
              Amount Due: <strong>Rs. {bankVerifyOrder.total.toLocaleString()}</strong>
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleBankVerify(false)}
                className="flex-1 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-semibold hover:bg-rose-100"
              >
                Reject Proof
              </button>
              <button
                type="button"
                onClick={() => handleBankVerify(true)}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: PROCESS REFUND
          ============================================================== */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Process Refund for #{refundModalOrder.orderNumber}
            </h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Refund Amount (Rs.)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="flex-1 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessRefund}
                className="flex-1 py-2 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800"
              >
                Execute Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: ADD / EDIT COUPON
          ============================================================== */}
      {couponModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCoupon.id ? 'Edit Promotional Coupon' : 'Create New Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCouponModalOpen(false);
                  setEditingCoupon(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25, FESTIVE500"
                  value={editingCoupon.code || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase().trim() })}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-mono uppercase tracking-wider font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discountType || 'percentage'}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Cash (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingCoupon.discountValue || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                    placeholder={editingCoupon.discountType === 'percentage' ? 'e.g. 15 (%)' : 'e.g. 500 (Rs.)'}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum Order (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.minimumOrder || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minimumOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Cap (Rs. Optional)</label>
                  <input
                    type="number"
                    value={editingCoupon.maximumDiscount || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maximumDiscount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 2000"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon_active"
                  checked={editingCoupon.active !== false}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                />
                <label htmlFor="coupon_active" className="font-semibold text-slate-700 cursor-pointer">
                  Activate coupon immediately for customers
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setCouponModalOpen(false);
                    setEditingCoupon(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
                >
                  {editingCoupon.id ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: ADD / EDIT BANNER
          ============================================================== */}
      {bannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingBanner.id ? 'Edit Promotional Banner' : 'Add New Promotional Banner'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setBannerModalOpen(false);
                  setEditingBanner(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Family Play & Robotics Extravaganza"
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subtitle / Campaign Message *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Safe, creative and educational play essentials for growing children."
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Image URL *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.image || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[11px]"
                />

                {/* Presets selector */}
                <div className="mt-2 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Or pick from curated studio photography:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Kids Playtime', url: '/src/assets/images/hero_kids_playtime_1790783444732.jpg' },
                      { label: 'Family Board Games', url: '/src/assets/images/hero_family_playtime_1790785198699.jpg' },
                      { label: 'Creative Crafts', url: '/src/assets/images/hero_creative_crafts_1790785215362.jpg' },
                      { label: 'STEM Robotics', url: '/src/assets/images/product_stem_robotics_1790783464103.jpg' },
                      { label: 'Building Blocks', url: '/src/assets/images/product_building_blocks_1790783483537.jpg' },
                      { label: 'Dollhouse Heritage', url: '/src/assets/images/product_wooden_dollhouse_1790783499318.jpg' },
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setEditingBanner({ ...editingBanner, image: preset.url })}
                        className={`p-1.5 border rounded-xl text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          editingBanner.image === preset.url ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-full h-12 object-cover rounded-lg" />
                        <span className="text-[10px] font-semibold text-slate-700 truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Explore Collection"
                    value={editingBanner.ctaText || 'Shop Now'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Link URL</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /shop, /category/stem-toys"
                    value={editingBanner.link || '/shop'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort Carousel Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingBanner.sortOrder || 1}
                    onChange={(e) => setEditingBanner({ ...editingBanner, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="banner_active"
                    checked={editingBanner.active !== false}
                    onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                  />
                  <label htmlFor="banner_active" className="font-semibold text-slate-700 cursor-pointer">
                    Show on live homepage
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setBannerModalOpen(false);
                    setEditingBanner(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
                >
                  {editingBanner.id ? 'Save Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: CUSTOMER DETAIL & USER DATA INSPECT
          ============================================================== */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-base border border-amber-200">
                  {selectedCustomerDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedCustomerDetail.name}</h3>
                  <p className="text-slate-500 font-medium">
                    {selectedCustomerDetail.email} {selectedCustomerDetail.phone ? `· ${selectedCustomerDetail.phone}` : ''}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">User ID: {selectedCustomerDetail.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Total Spent</span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  Rs. {(selectedCustomerDetail.totalSpent || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Orders Count</span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {selectedCustomerDetail.orderCount || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Joined Since</span>
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {selectedCustomerDetail.createdAt ? new Date(selectedCustomerDetail.createdAt).toLocaleDateString() : 'Active Member'}
                </span>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Saved Shipping Addresses ({selectedCustomerDetail.addresses?.length || 0})</span>
              </h4>
              {selectedCustomerDetail.addresses && selectedCustomerDetail.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCustomerDetail.addresses.map((a: any) => (
                    <div key={a.id} className="p-3 border border-slate-200/80 rounded-xl bg-slate-50/50 space-y-0.5 text-[11px]">
                      <div className="font-bold text-slate-900 flex justify-between">
                        <span>{a.fullName}</span>
                        {a.isDefault && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">DEFAULT</span>}
                      </div>
                      <p className="text-slate-600">{a.houseFlat} {a.street}, {a.area}</p>
                      <p className="text-slate-500">{a.city}, {a.province} {a.postalCode}</p>
                      <p className="text-slate-400 font-mono">{a.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] italic p-3 bg-slate-50 rounded-xl">No saved address records yet.</p>
              )}
            </div>

            {/* Orders Placed by this User */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                  <span>Orders Placed by this Customer ({selectedCustomerDetail.orders?.length || 0})</span>
                </h4>
                {selectedCustomerDetail.orders && selectedCustomerDetail.orders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderCustomerFilter(selectedCustomerDetail.email);
                      setSelectedCustomerDetail(null);
                      setActiveTab('orders');
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    View in Pipeline →
                  </button>
                )}
              </div>

              {selectedCustomerDetail.orders && selectedCustomerDetail.orders.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedCustomerDetail.orders.map((o: any) => (
                    <div key={o.id} className="p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">#{o.orderNumber}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{o.orderStatus}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{o.paymentStatus}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {o.items?.map((item: any) => `${item.quantity}× ${item.productName}`).join(', ')}
                      </p>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="font-extrabold text-slate-900 tabular-nums">Total: Rs. {o.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] italic p-3 bg-slate-50 rounded-xl">Customer has not placed any orders yet.</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomerDetail(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Close Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
