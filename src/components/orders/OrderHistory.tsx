import React, { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ChevronRight,
  Search,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Eye,
  X,
  Check,
  MapPin,
  CreditCard,
  Tag,
} from 'lucide-react';

interface OrderHistoryProps {
  onNavigate?: (route: string) => void;
  onOpenAuth?: () => void;
  initialOrderId?: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  onNavigate,
  onOpenAuth,
  initialOrderId,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useNotifications();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Return request modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Item damaged during shipping');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Fetch only authenticated user's past orders scoped strictly by user UID
  const fetchUserOrders = useCallback(async () => {
    if (!user || !user.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getOrders();
      if (res.orders && Array.isArray(res.orders)) {
        // Defensive scoping: verify every single order matches authenticated user's UID or verified email
        const userUid = user.id;
        const userEmail = user.email.toLowerCase().trim();

        const scopedOrders = res.orders.filter(
          (o) =>
            o.userId === userUid ||
            (o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail)
        );

        // Sort by newest first
        scopedOrders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(scopedOrders);

        // Pre-select initial order if requested
        if (initialOrderId) {
          const match = scopedOrders.find(
            (o) => o.id === initialOrderId || o.orderNumber === initialOrderId
          );
          if (match) {
            setSelectedOrder(match);
          }
        }
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('[OrderHistory] Failed to fetch authenticated orders:', err);
      showToast(err.message || 'Could not load your orders.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, initialOrderId, showToast]);

  useEffect(() => {
    setLoading(true);
    fetchUserOrders();
  }, [fetchUserOrders]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchUserOrders();
  };

  const handleReorder = async (order: Order) => {
    try {
      for (const item of order.items) {
        await addToCart(item.productId, item.quantity);
      }
      showToast('All items added back to your cart!', 'success');
      if (onNavigate) {
        onNavigate('/cart');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder items.', 'error');
    }
  };

  const handleReturnSubmit = async () => {
    if (!selectedOrder) return;
    setSubmittingReturn(true);
    try {
      await api.requestReturn(selectedOrder.id, returnReason);
      showToast('Return request submitted. Support team will review within 24 hours.', 'success');
      setReturnModalOpen(false);
      // Refresh selected order
      const res = await api.getOrder(selectedOrder.id);
      if (res.order) {
        setSelectedOrder(res.order);
      }
      fetchUserOrders();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit return request.', 'error');
    } finally {
      setSubmittingReturn(false);
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
    if (order.orderStatus === 'Returned' || order.orderStatus === 'Refunded') return 'returned';
    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  // 1. Unauthenticated Gate View
  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs max-w-xl mx-auto text-center space-y-5 my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/80">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Authentication Required
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Order histories contain sensitive shipping addresses, courier records, and receipts. Please sign in to view orders scoped to your personal account.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAuth}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          Sign In to Access Your Orders
        </button>
      </div>
    );
  }

  // Filter orders by search & status
  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        if (['Delivered', 'Cancelled', 'Refunded', 'Returned'].includes(o.orderStatus)) return false;
      } else if (statusFilter === 'completed') {
        if (o.orderStatus !== 'Delivered') return false;
      } else if (statusFilter === 'cancelled') {
        if (!['Cancelled', 'Refunded', 'Returned'].includes(o.orderStatus)) return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrderNum = o.orderNumber.toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.productName.toLowerCase().includes(q) || i.productSku.toLowerCase().includes(q));
      const matchStatus = o.orderStatus.toLowerCase().includes(q) || o.paymentStatus.toLowerCase().includes(q);
      return matchOrderNum || matchItem || matchStatus;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Detail Modal / Expanded View for Selected Order */}
      {selectedOrder ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                ← Back to Order History
              </button>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedOrder.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedOrder.orderStatus === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedOrder.orderStatus}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedOrder.paymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Payment: {selectedOrder.paymentStatus}
              </span>
            </div>
          </div>

          {/* Delivery Milestone Progress Stepper */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between items-center mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Real-Time Courier Tracking
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  Current Status: {selectedOrder.orderStatus}
                </h4>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Express Nationwide Delivery</span>
              </div>
            </div>

            {/* Stepper Dots */}
            <div className="relative flex justify-between items-start text-xs pt-2 overflow-x-auto">
              {trackingSteps.map((step, idx) => {
                const status = getStepStatus(step, selectedOrder);
                return (
                  <div
                    key={step}
                    className="flex flex-col items-center text-center flex-1 min-w-[72px] relative"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 z-10 transition-colors ${
                        status === 'completed'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {status === 'completed' ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-semibold leading-tight ${
                        status === 'completed' ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Status History Log */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Status Milestones:
                </span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-baseline gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-bold text-slate-800">{h.status}</span>
                      {h.note && <span className="text-slate-500">— {h.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Purchased Items Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Purchased Items ({selectedOrder.items.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs bg-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-slate-500 text-[11px]">
                        SKU: <span className="font-mono">{item.productSku}</span> · Qty: <strong>{item.quantity}</strong>
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Unit Price: Rs. {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-slate-900 tabular-nums">
                      Rs. {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address & Cost Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Delivery Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Shipping Destination
              </span>
              <div className="space-y-0.5 text-slate-700">
                <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                <p>{selectedOrder.shippingAddress?.houseFlat} {selectedOrder.shippingAddress?.street}</p>
                <p>{selectedOrder.shippingAddress?.area} {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province} {selectedOrder.shippingAddress?.postalCode}</p>
                <p className="text-slate-500 font-mono text-[11px] pt-1">Phone: {selectedOrder.customerPhone}</p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Payment Breakdown
              </span>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="tabular-nums font-semibold text-slate-900">Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {Boolean(selectedOrder.discount) && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({selectedOrder.couponCode || 'Promo'}):</span>
                    <span className="tabular-nums font-semibold">- Rs. {selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Nationwide Courier Shipping:</span>
                  <span className="tabular-nums font-semibold text-slate-900">
                    {selectedOrder.shippingFee === 0 ? 'FREE' : `Rs. ${selectedOrder.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span className="tabular-nums text-base">Rs. {selectedOrder.total.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Payment Method: <strong className="uppercase text-slate-800">{selectedOrder.paymentMethod}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleReorder(selectedOrder)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reorder All Items</span>
            </button>

            {selectedOrder.orderStatus === 'Delivered' && (
              <button
                type="button"
                onClick={() => setReturnModalOpen(true)}
                className="px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request Return / Refund</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Orders List View */
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  My Order History
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold">
                  {orders.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scoped securely to Account UID: </span>
                <span className="font-mono text-slate-700 font-semibold">{user.id}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order # or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50/70 border border-slate-200/80 rounded-xl outline-none focus:border-slate-400 text-xs"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto shrink-0">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'active', label: 'Active Pipeline' },
                { id: 'completed', label: 'Delivered' },
                { id: 'cancelled', label: 'Returns' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Stream */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white p-5 border border-slate-200/80 rounded-2xl hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Summary */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        #{order.orderNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>

                    {/* Products Thumbnail and Title list */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.productImage}
                            alt=""
                            className="inline-block h-10 w-10 rounded-lg object-cover ring-2 ring-white bg-slate-100"
                          />
                        ))}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1">
                        {order.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">Total Paid</span>
                      <span className="text-base font-black text-slate-900 tabular-nums">
                        Rs. {order.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery || statusFilter !== 'all' ? 'No matching orders found' : 'No past orders yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try clearing your search query or filters to see all your orders.'
                    : 'When you place an order on Learnora, its shipment tracking, milestones and receipts will appear here automatically.'}
                </p>
              </div>
              {searchQuery || statusFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('/shop')}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Return Request Modal */}
      {returnModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Request Return for #{selectedOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-600">
                Please indicate the reason for returning this item. Our customer support team will arrange a doorstep inspection or exchange.
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none bg-white font-medium"
                >
                  <option value="Item damaged during shipping">Item damaged during shipping</option>
                  <option value="Defective or non-functional toy">Defective or non-functional toy</option>
                  <option value="Received incorrect product or variation">Received incorrect product or variation</option>
                  <option value="Product not as expected or pictured">Product not as expected or pictured</option>
                  <option value="Other return request">Other return request</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReturnSubmit}
                  disabled={submittingReturn}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
