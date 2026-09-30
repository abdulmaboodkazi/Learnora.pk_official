import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { ProductCard } from '../components/common/ProductCard.tsx';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  onNavigate,
  onOpenAuth,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [frequentlyBought, setFrequentlyBought] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Active gallery image
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  // Review submission form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      setLoading(true);
      try {
        const res = await api.getProduct(slug);
        if (res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.images[0] || '');
          setRelated(res.related || []);
          setFrequentlyBought(res.frequentlyBoughtTogether || []);

          // Load reviews
          const revRes = await api.getProductReviews(res.product.id);
          setReviews(revRes.reviews || []);
        }
      } catch (err) {
        console.error('[PDP] Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Product not found</h2>
        <p className="text-xs text-slate-500 mt-2">
          The requested product may have been moved or is currently unavailable.
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-6 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const currentPrice = product.salePrice ?? product.price;
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      showToast(`Added ${quantity} × "${product.name}" to bag.`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product.id, quantity);
      onNavigate('/checkout');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleWishlistToggle = async () => {
    try {
      await toggleWishlist(product);
      showToast(
        isFavorited ? 'Removed from saved wishlist' : 'Saved to your wishlist',
        'info'
      );
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.submitReview(product.id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      showToast('Thank you! Your verified review has been published.', 'success');
      setReviews((prev) => [res.review, ...prev]);
      setReviewTitle('');
      setReviewComment('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-900">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('/shop')} className="hover:text-slate-900">
          Shop
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-900 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Contiguous Purchase Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery (sticky) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Photo */}
          <div className="relative aspect-4/3 w-full bg-[#F4F4F2] rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                Save {discountPercent}%
              </span>
            )}
            <button
              onClick={handleWishlistToggle}
              aria-label="Save to wishlist"
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-xs transition-colors ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-slate-900 ring-2 ring-slate-900/10'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            {/* Zero-Pill Unboxed Metadata Header */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>{product.brand}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>SKU: {product.sku}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-amber-800 font-semibold">Recommended Age: {product.ageRange} Years</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <div className="flex text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="font-bold text-slate-900 tabular-nums">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">·</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="underline hover:text-slate-900"
              >
                {product.reviewCount} Verified Reviews
              </button>
            </div>
          </div>

          {/* Pricing Baseline */}
          <div className="pt-4 border-t border-slate-100 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              Rs. {currentPrice.toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-base text-slate-400 line-through tabular-nums">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
            <span className="text-xs text-slate-500">Incl. all taxes</span>
          </div>

          {/* Stock Availability */}
          <div className="text-xs">
            {product.stock > 0 ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Check className="w-4 h-4" />
                <span>In Stock ({product.stock} units available for dispatch)</span>
              </div>
            ) : (
              <div className="text-rose-600 font-semibold">
                Temporarily Sold Out
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Quantity & CTA Cluster */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-xs text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>
            </div>

            <button
              type="button"
              disabled={product.stock === 0}
              onClick={handleBuyNow}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 text-xs font-bold rounded-xl transition-colors text-center"
            >
              Buy Now (Express Checkout)
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-700" />
              <span>Free Delivery &gt; Rs. 3,000</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-700" />
              <span>7-Day Return Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety Certified Toy</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specifications, Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10">
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 transition-colors ${
              activeTab === 'description'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Description & Development
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 transition-colors ${
              activeTab === 'specs'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Specifications & Safety
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors ${
              activeTab === 'reviews'
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
            <p>{product.description}</p>
            {product.attributes?.safetyWarning && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Safety Notice:</strong> {product.attributes.safetyWarning}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specifications (Dynamic Attributes support for any category!) */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="text-slate-500">Brand</span>
              <span className="font-semibold text-slate-900">{product.brand}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="text-slate-500">SKU Code</span>
              <span className="font-semibold text-slate-900 font-mono">{product.sku}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="text-slate-500">Recommended Age</span>
              <span className="font-semibold text-slate-900">{product.ageRange} Years</span>
            </div>
            {Object.entries(product.attributes || {}).map(([key, val]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-xl flex justify-between">
                <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-semibold text-slate-900">{String(val)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Reviews Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl">
              <div>
                <div className="text-3xl font-bold text-slate-900 tabular-nums">
                  {product.rating.toFixed(1)} / 5.0
                </div>
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Based on {reviews.length} customer feedback
                </p>
              </div>

              {/* Submit Review Form */}
              <div className="max-w-md w-full">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Share Your Experience
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewRating(num)}
                          className="p-0.5 text-amber-500"
                        >
                          <Star
                            className={`w-4 h-4 ${num <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Review headline (e.g. Kids love it!)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                  />
                  <textarea
                    required
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write detailed feedback about durability, learning value, etc."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            </div>

            {/* List of Reviews */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 border-b border-slate-100 last:border-none space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <h5 className="text-xs font-semibold text-slate-900">{rev.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Frequently Bought Together</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {frequentlyBought.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onNavigate={(s) => onNavigate(`/product/${s}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">You May Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onNavigate={(s) => onNavigate(`/product/${s}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
