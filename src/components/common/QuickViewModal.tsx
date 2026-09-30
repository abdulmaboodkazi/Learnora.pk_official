import React, { useState } from 'react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { X, Star, Heart, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useNotifications();

  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const currentPrice = product.salePrice ?? product.price;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      showToast(`Added ${quantity} × "${product.name}" to bag.`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      await toggleWishlist(product);
      showToast(isFavorited ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-slate-100 relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold mb-1">
                {product.brand} · Age {product.ageRange} Years
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{product.name}</h2>

              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-slate-900 tabular-nums">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({product.reviewCount} reviews)</span>
              </div>

              <div className="pt-3 text-xl font-extrabold text-slate-900 tabular-nums">
                Rs. {currentPrice.toLocaleString()}
                {product.salePrice && (
                  <span className="text-xs text-slate-400 line-through ml-2 font-normal">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                {product.shortDescription || product.description}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-slate-600"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-1 text-slate-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`p-2.5 rounded-xl border ${
                    isFavorited
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate(`/product/${product.slug}`);
                }}
                className="w-full text-center text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1"
              >
                <span>View Full Details, Specifications & Reviews</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
