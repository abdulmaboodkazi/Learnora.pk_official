import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Order, Address, OrderStatus, Notification } from '../types/index.ts';
import { api } from '../lib/api.ts';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (route: string) => void;
  subview?: string; // 'orders' | 'profile' | 'addresses' | 'wishlist' | 'security' | 'notifications'
  selectedOrderId?: string;
  onOpenAuth: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigate,
  subview = 'orders',
  selectedOrderId,
  onOpenAuth,
}) => {
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState(subview);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Return request modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Item damaged during shipping');

  useEffect(() => {
    setActiveTab(subview);
  }, [subview]);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name);
    setProfilePhone(user.phone || '');

    // Fetch user orders
    api.getOrders().then((res) => {
      if (res.orders) {
        setOrders(res.orders);
        if (selectedOrderId) {
          const match = res.orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId);
          if (match) setSelectedOrder(match);
        }
      }
    }).catch(() => {}).finally(() => setLoadingOrders(false));

    // Fetch user addresses
    api.getAddresses().then((res) => {
      if (res.addresses) setAddresses(res.addresses);
    }).catch(() => {});

    // Fetch notifications
    api.getNotifications().then((res) => {
      if (res.notifications) setNotifications(res.notifications);
    }).catch(() => {});
  }, [user, selectedOrderId]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">
          Sign in to view your orders, live courier tracking, saved addresses and family wishlist.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name: profileName, phone: profilePhone });
      showToast('Profile information saved.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.changePassword({ currentPassword, newPassword });
      showToast('Password updated securely.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnSubmit = async () => {
    if (!selectedOrder) return;
    try {
      await api.requestReturn(selectedOrder.id, returnReason);
      showToast('Return request submitted. Our customer team will reach out within 24h.', 'success');
      setReturnModalOpen(false);
      // Refresh order
      const res = await api.getOrder(selectedOrder.id);
      setSelectedOrder(res.order);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const trackingSteps: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const getStepStatus = (step: OrderStatus, order: Order) => {
    const currentIndex = trackingSteps.indexOf(order.orderStatus);
    const stepIndex = trackingSteps.indexOf(step);
    if (order.orderStatus === 'Cancelled') return 'cancelled';
    if (order.orderStatus === 'Returned') return 'returned';
    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500 font-medium">{user.email} · Customer Account</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            onNavigate('/');
          }}
          className="self-start sm:self-center px-3 py-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 font-semibold flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs h-fit">
          {[
            { id: 'orders', label: 'My Orders', icon: Package },
            { id: 'profile', label: 'Personal Profile', icon: UserIcon },
            { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
            { id: 'notifications', label: 'Order Alerts', icon: Bell, badge: notifications.filter((n) => !n.isRead).length },
            { id: 'security', label: 'Security & Auth', icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id && !selectedOrder;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge) && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content View */}
        <main className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* ==============================================================
              VIEW 1: ORDER DETAIL & STEP-BY-STEP LIVE TRACKER
              ============================================================== */}
          {selectedOrder ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  ← Back to Orders List
                </button>
                <span className="text-xs font-bold text-slate-900">
                  Order #{selectedOrder.orderNumber}
                </span>
              </div>

              {/* Order Status Timeline Tracker */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Live Delivery Progress
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      Status: {selectedOrder.orderStatus}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                </div>

                {/* Milestone Stepper */}
                <div className="relative flex justify-between items-start text-xs pt-2 overflow-x-auto">
                  {trackingSteps.map((step, idx) => {
                    const status = getStepStatus(step, selectedOrder);
                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center text-center flex-1 min-w-[70px] relative"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-2 z-10 transition-colors ${
                            status === 'completed'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {status === 'completed' ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            status === 'completed' ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status Notes History */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Milestone Log:
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {selectedOrder.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-baseline gap-2">
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
                        </span>
                        <span className="font-semibold text-slate-800">{h.status}</span>
                        {h.note && <span className="text-slate-500">— {h.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items in this order */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  Purchased Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg bg-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{item.productName}</p>
                          <p className="text-slate-500">
                            Qty: {item.quantity} · SKU: {item.productSku}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums">
                        Rs. {item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Delivering to: {selectedOrder.shippingAddress?.street},{' '}
                  {selectedOrder.shippingAddress?.city}
                </div>

                {selectedOrder.orderStatus === 'Delivered' && (
                  <button
                    onClick={() => setReturnModalOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Return / Refund</span>
                  </button>
                )}
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            /* ==============================================================
                VIEW 2: ORDERS LIST
                ============================================================== */
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Order History</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track ongoing shipments and view past receipts
                </p>
              </div>

              {loadingOrders ? (
                <div className="space-y-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="p-5 border border-slate-200/80 rounded-2xl hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {order.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Total</span>
                          <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                            Rs. {order.total.toLocaleString()}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl">
                  <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-800">No orders placed yet</p>
                  <p className="text-xs text-slate-400 mt-1">Explore our catalog and find the perfect toy.</p>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'profile' ? (
            /* ==============================================================
                VIEW 3: PROFILE
                ============================================================== */
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Personal Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your contact details</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Cannot be changed)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-100 rounded-xl text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          ) : activeTab === 'addresses' ? (
            /* ==============================================================
                VIEW 4: SAVED ADDRESSES
                ============================================================== */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Delivery Addresses</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage saved shipping destinations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 border border-slate-200/80 rounded-2xl relative space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{a.fullName}</span>
                      {a.isDefault && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">
                      {a.houseFlat}, {a.street}, {a.area}
                    </p>
                    <p className="text-slate-600">
                      {a.city}, {a.province} ({a.postalCode})
                    </p>
                    <p className="text-slate-500 font-medium">{a.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'notifications' ? (
            /* ==============================================================
                VIEW 5: NOTIFICATIONS
                ============================================================== */
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Notifications & Alerts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Order dispatches and system updates</p>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      api.markNotificationRead(n.id);
                      if (n.link) onNavigate(n.link);
                    }}
                    className={`p-4 border rounded-2xl transition-colors cursor-pointer text-xs ${
                      n.isRead
                        ? 'border-slate-200 bg-white'
                        : 'border-amber-200 bg-amber-50/60 font-medium'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ==============================================================
                VIEW 6: SECURITY & CONNECTED ACCOUNTS
                ============================================================== */
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Account Security</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update password & review connected OAuth providers
                </p>
              </div>

              {/* Connected OAuth Providers */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                  Connected Identity Providers:
                </span>
                <div className="flex gap-2">
                  {user.connectedProviders.map((prov) => (
                    <span
                      key={prov}
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 capitalize"
                    >
                      {prov}
                    </span>
                  ))}
                </div>
              </div>

              {/* Password update form */}
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Change Password
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Return Request Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Initiate Return / Refund</h3>
            <p className="text-xs text-slate-500">
              Please state why you are returning this item so our QC team can arrange courier pickup.
            </p>
            <textarea
              rows={3}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="flex-1 py-2 text-xs bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnSubmit}
                className="flex-1 py-2 text-xs bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
