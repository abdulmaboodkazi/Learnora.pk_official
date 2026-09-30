import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistItem, Product } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useCart } from './CartContext.tsx';

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getWishlist();
      setWishlist(res.wishlist || []);
    } catch {
      // quiet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      // Prompt user or handle as guest notice
      throw new Error('Please sign in to save items to your wishlist.');
    }

    if (isInWishlist(product.id)) {
      await api.removeFromWishlist(product.id);
      setWishlist((prev) => prev.filter((i) => i.productId !== product.id));
    } else {
      const res = await api.addToWishlist(product.id);
      setWishlist((prev) => [...prev, res.item]);
    }
  };

  const moveToCart = async (productId: string) => {
    await addToCart(productId, 1);
    await api.removeFromWishlist(productId);
    setWishlist((prev) => prev.filter((i) => i.productId !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        moveToCart,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
