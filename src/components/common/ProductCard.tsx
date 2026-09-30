import React from 'react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onNavigate?: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useNotifications();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      showToast(`Added "${product.name}" to bag.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not add to bag', 'error');
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleWishlist(product);
      showToast(
        isInWishlist(product.id) ? `Removed from wishlist.` : `Saved to wishlist.`,
        'info'
      );
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const isFavorited = isInWishlist(product.id);
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const currentPrice = product.salePrice ?? product.price;

  return (
    <div
      onClick={() => onNavigate?.(product.slug)}
      className="group flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/3 w-full bg-[#F4F4F2] overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
            Learnora Product
          </div>
        )}

        {/* Quiet Sale Tag */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-amber-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm">
            Save {discountPercent}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Quick View Hover Action */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <span>{product.brand}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Age {product.ageRange}</span>
            {product.stock <= product.lowStockThreshold && product.stock > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-amber-700">Only {product.stock} left</span>
              </>
            )}
            {product.stock === 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-rose-600 font-semibold">Out of Stock</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="font-semibold text-slate-900 tabular-nums">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing Baseline & Add To Bag */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-900 tabular-nums">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {product.salePrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
};
