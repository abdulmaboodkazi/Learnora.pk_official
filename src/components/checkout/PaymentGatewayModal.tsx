import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { ShieldCheck, Lock, CreditCard, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  amount: number;
  transactionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  orderId,
  orderNumber,
  amount,
  transactionId,
  onSuccess,
  onCancel,
}) => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('Sara Khan');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('382');
  const [simulateDecline, setSimulateDecline] = useState(false);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Direct server-side verification request
      const res = await api.verifyPayment({
        method: 'card',
        orderId,
        orderNumber,
        transactionId,
        simulateFailure: simulateDecline,
      });

      if (res.success) {
        showToast('Online payment authorized and verified server-side!', 'success');
        onSuccess();
      } else {
        showToast(res.result?.message || 'Payment authorization failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Payment provider communication error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Hosted Gateway Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-black">
              L
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                Learnora Secure Gateway
              </p>
              <h3 className="text-sm font-bold text-white">256-bit Encrypted Checkout</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Banner */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-500">Order Ref:</span>{' '}
            <span className="font-semibold text-slate-900">{orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-500">Amount Due:</span>{' '}
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              Rs. {amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card Form */}
        <form onSubmit={handlePay} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Card Number (Visa / Mastercard)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl outline-none focus:border-slate-900"
              />
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry (MM/YY)
              </label>
              <input
                type="text"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2 text-xs text-center border border-slate-300 rounded-xl outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CVV / CVC</label>
              <input
                type="password"
                required
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full px-3 py-2 text-xs text-center border border-slate-300 rounded-xl outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Testing toggle */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600">Simulate bank card decline:</span>
            <input
              type="checkbox"
              checked={simulateDecline}
              onChange={(e) => setSimulateDecline(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-white shadow-sm ${
              simulateDecline
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {loading ? (
              'Verifying with Banking Network...'
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Pay Rs. {amount.toLocaleString()}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Card tokens are processed securely; never stored locally.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
