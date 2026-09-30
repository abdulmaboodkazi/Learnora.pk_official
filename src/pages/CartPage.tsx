import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight } from 'lucide-react';

interface CartPageProps {
  onNavigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    couponCode,
  } = useCart();
  const { showToast } = useNotifications();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setCouponLoading(true);
    const res = await applyCoupon(inputCoupon.trim());
    setCouponLoading(false);

    if (res.success) {
      showToast(res.message, 'success');
      setInputCoupon('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const freeShippingThreshold = 3000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your cart is waiting for some fun.</h2>
        <p className="text-xs text-slate-500">
          Discover our wide range of educational toys, STEM kits, building sets and books.
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {cart.items.reduce((s, i) => s + i.quantity, 0)} items in your basket
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Item table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          {remainingForFreeShipping > 0 ? (
            <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-xl font-medium border border-amber-200">
              Add Rs. {remainingForFreeShipping.toLocaleString()} more to your order to unlock{' '}
              <strong>Free Nationwide Delivery!</strong>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl font-semibold border border-emerald-200">
              🎉 Congratulations! You qualify for Free Delivery.
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {cart.items.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-16 h-16 object-cover rounded-xl bg-slate-100 shrink-0"
                  />
                  <div>
                    <h3
                      onClick={() => onNavigate(`/product/${item.product.slug}`)}
                      className="text-xs font-bold text-slate-900 hover:text-amber-700 cursor-pointer"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.product.brand} · Age {item.product.ageRange}
                    </p>
                    <p className="text-xs font-semibold text-slate-900 mt-1 tabular-nums">
                      Rs. {item.unitPrice.toLocaleString()} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-slate-900 tabular-nums min-w-[80px] text-right">
                    Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Checkout CTA */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Order Summary
          </h2>

          {/* Coupon Input */}
          {couponCode ? (
            <div className="flex justify-between items-center p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
              <span className="font-semibold text-emerald-800">Coupon "{couponCode}" applied</span>
              <button onClick={removeCoupon} className="text-rose-600 hover:underline">
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                placeholder="Coupon code (e.g. WELCOME10)"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none font-semibold uppercase"
              />
              <button
                type="submit"
                disabled={couponLoading || !inputCoupon.trim()}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50"
              >
                Apply
              </button>
            </form>
          )}

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 tabular-nums">
                Rs. {cart.subtotal.toLocaleString()}
              </span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount</span>
                <span className="tabular-nums">- Rs. {cart.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold tabular-nums">
                {cart.shippingFee === 0 ? (
                  <span className="text-emerald-700">FREE</span>
                ) : (
                  `Rs. ${cart.shippingFee}`
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="tabular-nums">Rs. {cart.total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/checkout')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
