import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  cart: Cart;
  loading: boolean;
  couponCode: string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number, selectedVariant?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_CART: Cart = {
  items: [],
  subtotal: 0,
  discount: 0,
  shippingFee: 0,
  total: 0,
  couponCode: null,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(INITIAL_CART);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getCart(couponCode || undefined);
      if (res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error('[Cart] Error refreshing cart:', err);
    } finally {
      setLoading(false);
    }
  }, [couponCode]);

  useEffect(() => {
    refreshCart();
  }, [user, couponCode, refreshCart]);

  const addToCart = async (productId: string, quantity = 1, selectedVariant?: string) => {
    await api.addToCart(productId, quantity, selectedVariant);
    await refreshCart();
    setIsCartOpen(true);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    await api.updateCartItem(itemId, quantity);
    await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    await api.removeCartItem(itemId);
    await refreshCart();
  };

  const clearCart = async () => {
    await api.clearCart();
    setCouponCode('');
    await refreshCart();
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.validateCoupon(code, cart.subtotal);
      setCouponCode(res.coupon.code);
      await refreshCart();
      return { success: true, message: `Coupon applied: Rs. ${res.discount.toLocaleString()} discount!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid coupon code.' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        couponCode,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
