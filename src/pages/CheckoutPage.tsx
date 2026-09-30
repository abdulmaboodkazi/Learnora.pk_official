import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Address, Order, PaymentMethod } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { PaymentGatewayModal } from '../components/checkout/PaymentGatewayModal.tsx';
import {
  Check,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Building2,
  Lock,
  ArrowRight,
  ChevronRight,
  Package,
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { cart, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Multi-step progress (1: Contact, 2: Address, 3: Shipping, 4: Payment, 5: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+92 321 9876543');

  // Address
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [houseFlat, setHouseFlat] = useState('House # 12-A');
  const [street, setStreet] = useState('Street 4, Sector F-7/2');
  const [area, setArea] = useState('Islamabad Capital Territory');
  const [city, setCity] = useState('Islamabad');
  const [province, setProvince] = useState('Federal Territory');
  const [postalCode, setPostalCode] = useState('44000');
  const [saveAddressForLater, setSaveAddressForLater] = useState(true);

  // Shipping (Standard Nationwide Delivery only)
  const [shippingMethodId] = useState<'standard'>('standard');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bankRefNumber, setBankRefNumber] = useState('');

  // Processing state
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Payment Gateway Modal state for card
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingTxnData, setPendingTxnData] = useState<{
    orderId: string;
    orderNumber: string;
    amount: number;
    transactionId: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);

      api.getAddresses().then((res) => {
        if (res.addresses && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          setSelectedAddressId(defaultAddr.id);
          populateAddressFields(defaultAddr);
        }
      }).catch(() => {});
    }
  }, [user]);

  const populateAddressFields = (addr: Address) => {
    setCustomerName(addr.fullName);
    setCustomerPhone(addr.phone);
    setHouseFlat(addr.houseFlat);
    setStreet(addr.street);
    setArea(addr.area);
    setCity(addr.city);
    setProvince(addr.province);
    setPostalCode(addr.postalCode);
  };

  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setHouseFlat('');
      setStreet('');
      setArea('');
      setCity('Karachi');
      setProvince('Sindh');
      setPostalCode('');
    } else {
      const match = savedAddresses.find((a) => a.id === id);
      if (match) populateAddressFields(match);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerName || !customerEmail || !customerPhone || !street || !city) {
      showToast('Please fill in all required delivery address fields.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const shippingAddress: Address = {
        id: `addr_${Date.now()}`,
        userId: user ? user.id : 'guest',
        fullName: customerName,
        phone: customerPhone,
        houseFlat,
        street,
        area,
        city,
        province,
        postalCode,
        isDefault: false,
      };

      // If user checked save address and logged in
      if (user && saveAddressForLater && selectedAddressId === 'new') {
        api.createAddress(shippingAddress).catch(() => {});
      }

      // Order items payload
      const itemsPayload = cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));

      const res = await api.createOrder({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        paymentMethod,
        couponCode: cart.couponCode,
        items: itemsPayload,
        notes: paymentMethod === 'bank_transfer' ? `Bank Ref: ${bankRefNumber}` : '',
      });

      if (paymentMethod === 'card') {
        // Open secure hosted payment gateway
        setPendingTxnData({
          orderId: res.order.id,
          orderNumber: res.order.orderNumber,
          amount: res.order.total,
          transactionId: res.paymentIntent.transactionId,
        });
        setPaymentModalOpen(true);
        setConfirmedOrder(res.order);
      } else {
        // COD or Bank Transfer
        setConfirmedOrder(res.order);
        await clearCart();
        showToast(`Order #${res.order.orderNumber} successfully placed!`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to place order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentGatewaySuccess = async () => {
    setPaymentModalOpen(false);
    await clearCart();
    showToast('Payment confirmed! Your order is being prepared.', 'success');
  };

  // If order placed, show Confirmation Screen
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
            Thank you for your order!
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Confirmed: {confirmedOrder.orderNumber}
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            A confirmation receipt has been sent to <strong>{confirmedOrder.customerEmail}</strong>.
            You can track shipping milestones in real time.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-left max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-xs">
            <span className="text-slate-500">Payment Status:</span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {confirmedOrder.paymentStatus}
            </span>
          </div>

          <div className="space-y-2">
            {confirmedOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="text-slate-800 font-medium">
                  {item.quantity} × {item.productName}
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  Rs. {item.subtotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
            <span>Total Amount</span>
            <span className="tabular-nums">Rs. {confirmedOrder.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate(`/account/orders/${confirmedOrder.id}`)}
            className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
          >
            Track Order Status
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-6 py-2.5 bg-slate-100 text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Your bag is empty</h2>
        <p className="text-xs text-slate-500">Please add products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-2 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Checkout Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your order with full fraud protection and fast doorstep delivery.
        </p>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 text-xs font-semibold">
          {[
            { num: 1, label: 'Contact' },
            { num: 2, label: 'Delivery' },
            { num: 3, label: 'Shipping' },
            { num: 4, label: 'Payment' },
            { num: 5, label: 'Review' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
                  currentStep === s.num
                    ? 'text-slate-900 font-bold'
                    : currentStep > s.num
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentStep === s.num
                      ? 'bg-slate-900 text-white'
                      : currentStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <span>{s.label}</span>
              </div>
              {idx < 4 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Multi-step Checkout */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          {/* STEP 1: Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  1. Contact Details
                </h3>
                {!user && (
                  <button
                    onClick={onOpenAuth}
                    className="text-xs text-amber-700 hover:underline font-semibold"
                  >
                    Already have an account? Sign in
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Sara Khan"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (for Courier SMS)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Delivery Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Delivery Address (Pakistani format) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                2. Delivery Address
              </h3>

              {savedAddresses.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Saved Addresses
                  </label>
                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block p-3 border rounded-xl cursor-pointer text-xs transition-colors ${
                          selectedAddressId === addr.id
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="addressSelect"
                            checked={selectedAddressId === addr.id}
                            onChange={() => handleSelectSavedAddress(addr.id)}
                            className="text-slate-900"
                          />
                          <span className="font-bold text-slate-900">{addr.fullName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600">{addr.phone}</span>
                        </div>
                        <p className="text-slate-600 mt-1 pl-5">
                          {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city}, {addr.province}
                        </p>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSelectSavedAddress('new')}
                      className="text-xs text-amber-700 font-semibold underline pl-1"
                    >
                      + Add a different delivery address
                    </button>
                  </div>
                </div>
              )}

              {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        House / Flat / Building
                      </label>
                      <input
                        type="text"
                        required
                        value={houseFlat}
                        onChange={(e) => setHouseFlat(e.target.value)}
                        placeholder="House # 42-B"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Khayaban-e-Seher, Phase 6"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Area / Sector
                      </label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="DHA / Gulberg / Bahria"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none bg-white font-medium"
                      >
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Multan">Multan</option>
                        <option value="Quetta">Quetta</option>
                        <option value="Sialkot">Sialkot</option>
                        <option value="Other">Other City</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Province
                      </label>
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none bg-white font-medium"
                      >
                        <option value="Sindh">Sindh</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Islamabad Capital Territory">Islamabad ICT</option>
                        <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                        <option value="Balochistan">Balochistan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="75500"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <span>Select Shipping Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Shipping Method */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                3. Choose Shipping Option
              </h3>

              <div className="space-y-3">
                <label className="block p-4 border border-slate-900 bg-slate-50/80 rounded-2xl cursor-pointer text-xs transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Standard Nationwide Courier Delivery</p>
                        <p className="text-slate-500 mt-0.5">Delivered safely via TCS / Leopard in 2–4 business days</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {cart.subtotal >= 3000 ? (
                        <span className="text-emerald-700 font-extrabold">FREE</span>
                      ) : (
                        'Rs. 200'
                      )}
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <span>Continue to Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Method (COD, Bank Transfer, Online Gateway) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                4. Select Payment Method
              </h3>

              <div className="space-y-3">
                {/* 1. Cash on Delivery */}
                <label
                  className={`block p-4 border rounded-2xl cursor-pointer text-xs transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-slate-900"
                    />
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900">Cash on Delivery (COD)</p>
                      <p className="text-slate-500 mt-0.5">
                        Hand exact cash to the courier rider upon physical receipt of package.
                      </p>
                    </div>
                  </div>
                </label>

                {/* 2. Online Card Payment Gateway */}
                <label
                  className={`block p-4 border rounded-2xl cursor-pointer text-xs transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-slate-900"
                    />
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-bold text-slate-900">Credit / Debit Card (Online Gateway)</p>
                      <p className="text-slate-500 mt-0.5">
                        Tokenized 256-bit encrypted checkout via Visa, Mastercard, or UnionPay.
                      </p>
                    </div>
                  </div>
                </label>

                {/* 3. Direct Bank Deposit */}
                <label
                  className={`block p-4 border rounded-2xl cursor-pointer text-xs transition-colors ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="text-slate-900 mt-0.5"
                    />
                    <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="font-bold text-slate-900">Direct Bank Transfer</p>
                      <p className="text-slate-500">
                        Transfer to our verified corporate bank account via mobile banking or ATM.
                      </p>

                      {paymentMethod === 'bank_transfer' && (
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-700">
                          <p><strong>Bank:</strong> Meezan Bank Limited</p>
                          <p><strong>Title:</strong> LEARNORA RETAIL PVT LTD</p>
                          <p><strong>IBAN:</strong> PK42MEZN000204010394859101</p>
                          <p><strong>Account #:</strong> 0204-010394859101</p>

                          <div className="pt-2">
                            <label className="block font-semibold text-slate-800 mb-1">
                              Deposit Slip / Transaction Reference Number
                            </label>
                            <input
                              type="text"
                              required
                              value={bankRefNumber}
                              onChange={(e) => setBankRefNumber(e.target.value)}
                              placeholder="e.g. MEZN-TXN-839218"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <span>Review Final Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Place Order */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                5. Review & Confirm Order
              </h3>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Customer & Contact:</span>
                  <p className="font-bold text-slate-900">{customerName} · {customerPhone}</p>
                  <p className="text-slate-600">{customerEmail}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">Shipping Destination:</span>
                  <p className="text-slate-800">
                    {houseFlat}, {street}, {area}, {city}, {province} ({postalCode})
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-500 font-semibold">Payment Option:</span>
                  <span className="font-bold text-slate-900 uppercase">{paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Validating & Processing...'
                      : `Place Order · Rs. ${cart.total.toLocaleString()}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Stage */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Order Summary ({cart.items.length} Items)
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center text-xs">
                <img
                  src={item.product.images[0]}
                  alt=""
                  className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-slate-500 text-[11px]">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-slate-900 tabular-nums">
                  Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 tabular-nums">
                Rs. {cart.subtotal.toLocaleString()}
              </span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount ({cart.couponCode})</span>
                <span className="tabular-nums">- Rs. {cart.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="tabular-nums font-semibold">
                {cart.shippingFee === 0 ? (
                  <span className="text-emerald-700">FREE</span>
                ) : (
                  `Rs. ${cart.shippingFee}`
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="tabular-nums">Rs. {cart.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
            <p>✓ Price is calculated and validated server-side.</p>
            <p>✓ Inventory reserved automatically during checkout.</p>
            <p>✓ 100% money back guarantee if damaged.</p>
          </div>
        </div>
      </div>

      {/* Online Card Gateway Simulation Modal */}
      {pendingTxnData && (
        <PaymentGatewayModal
          isOpen={paymentModalOpen}
          orderId={pendingTxnData.orderId}
          orderNumber={pendingTxnData.orderNumber}
          amount={pendingTxnData.amount}
          transactionId={pendingTxnData.transactionId}
          onSuccess={handlePaymentGatewaySuccess}
          onCancel={() => {
            setPaymentModalOpen(false);
            showToast('Payment window closed. Order saved with Pending status.', 'info');
          }}
        />
      )}
    </div>
  );
};
