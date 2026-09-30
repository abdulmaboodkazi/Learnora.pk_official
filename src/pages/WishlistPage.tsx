import React from 'react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  onNavigate: (route: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { wishlist, moveToCart } = useWishlist();
  const { showToast } = useNotifications();

  const handleMoveToCart = async (productId: string, name: string) => {
    try {
      await moveToCart(productId);
      showToast(`Moved "${name}" to shopping bag!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Saved Wishlist
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Items your family is keeping an eye on for birthdays and special achievements.
        </p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-2xs"
            >
              <div
                onClick={() => onNavigate(`/product/${item.product.slug}`)}
                className="cursor-pointer aspect-4/3 bg-slate-100 overflow-hidden"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {item.product.brand} · Age {item.product.ageRange}
                  </div>
                  <h3
                    onClick={() => onNavigate(`/product/${item.product.slug}`)}
                    className="text-xs font-bold text-slate-900 cursor-pointer hover:text-amber-700 line-clamp-2 mt-1"
                  >
                    {item.product.name}
                  </h3>
                  <div className="text-sm font-extrabold text-slate-900 mt-2 tabular-nums">
                    Rs. {(item.product.salePrice ?? item.product.price).toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item.productId, item.product.name)}
                    className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Save your favorite products here.</h2>
          <p className="text-xs text-slate-500">
            Click the heart icon on any toy or family item to add it to your wishlist.
          </p>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
};
