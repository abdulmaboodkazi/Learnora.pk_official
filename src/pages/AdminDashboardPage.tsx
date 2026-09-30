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
    if (!editingProduct?.name || !editingProduct?.price || !editingProduct?.categoryId) {
      showToast('Name, price and category are required.', 'error');
      return;
    }

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
        showToast('Product updated successfully.', 'success');
      } else {
        await api.createProduct(editingProduct);
        showToast('New product added to catalog.', 'success');
      }
      setProductModalOpen(false);
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
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Categories
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    try {
      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, editingCategory);
        showToast('Category updated.', 'success');
      } else {
        await api.createCategory(editingCategory);
        showToast('Category created.', 'success');
      }
      setCategoryModalOpen(false);
      loadAllData();
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
        showToast('Coupon updated.', 'success');
      } else {
        await api.createCoupon(editingCoupon);
        showToast('Coupon activated.', 'success');
      }
      setCouponModalOpen(false);
      loadAllData();
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
                    className="p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt="" className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-900">{c.name}</h4>
                        <p className="text-slate-500 text-[11px] line-clamp-1">{c.description}</p>
                        <span className="text-[10px] text-slate-400">Slug: /{c.slug}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setCategoryModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
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
              <div>
                <h2 className="text-base font-bold text-slate-900">Order Dispatch & Status Pipeline</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update logistics statuses, manage courier tracking and verify payments
                </p>
              </div>

              <div className="space-y-3">
                {orders.map((o) => (
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
                  <p className="text-xs text-slate-500 mt-0.5">Manage fixed or percentage cart discounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCoupon({
                      code: 'SPRING15',
                      discountType: 'percentage',
                      discountValue: 15,
                      minimumOrder: 2000,
                      active: true,
                    });
                    setCouponModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((coup) => (
                  <div key={coup.id} className="p-4 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-slate-900 font-mono tracking-wider">
                        {coup.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${coup.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {coup.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Discount: {coup.discountValue}
                      {coup.discountType === 'percentage' ? '%' : ' Rs.'} off orders over Rs.{' '}
                      {coup.minimumOrder.toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-[11px]">Used: {coup.usedCount} times</p>
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
                  <p className="text-xs text-slate-500 mt-0.5">Manage homepage campaigns</p>
                </div>
              </div>

              <div className="space-y-4">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-xs"
                  >
                    <img src={b.image} alt="" className="w-28 h-18 object-cover rounded-xl bg-slate-100 shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{b.title}</h4>
                      <p className="text-slate-500 mt-0.5">{b.subtitle}</p>
                      <p className="text-[11px] text-amber-700 font-semibold mt-1">CTA: {b.ctaText} → {b.link}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 10: CUSTOMER DIRECTORY
              ============================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Customer Accounts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Customer spending and profile tracking</p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Total Spend</th>
                      <th className="p-3">Auth Providers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                        <td className="p-3 text-slate-600">
                          {c.email}
                          {c.phone && <div className="text-[11px] text-slate-400">{c.phone}</div>}
                        </td>
                        <td className="p-3 font-bold tabular-nums">{c.orderCount || 0}</td>
                        <td className="p-3 font-extrabold text-slate-900 tabular-nums">
                          Rs. {(c.totalSpent || 0).toLocaleString()}
                        </td>
                        <td className="p-3 capitalize">{c.connectedProviders?.join(', ')}</td>
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
              <button onClick={() => setProductModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Montessori Wooden Arches"
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regular Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingProduct.categoryId}
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
                    value={editingProduct.ageRange}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Save Product
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
    </div>
  );
};
