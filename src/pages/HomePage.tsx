import React, { useEffect, useState } from 'react';
import { Product, Category, Banner } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { HeroSlider } from '../components/home/HeroSlider.tsx';
import { CategorySlider } from '../components/home/CategorySlider.tsx';
import { ProductSlider } from '../components/home/ProductSlider.tsx';
import { GiftFinderSection } from '../components/home/GiftFinderSection.tsx';
import { ParentReviewsSlider } from '../components/home/ParentReviewsSlider.tsx';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  CheckCircle,
  Zap,
  Heart,
  Smile,
  Baby,
  Blocks,
  Rocket,
  Palette,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onQuickView?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickView }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catsRes, featRes, bestRes, newRes, banRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true, limit: 8 }),
          api.getProducts({ sort: 'best-selling', limit: 8 }),
          api.getProducts({ sort: 'newest', limit: 8 }),
          api.getBanners(),
        ]);

        if (catsRes.categories) setCategories(catsRes.categories);
        if (featRes.products) setFeaturedProducts(featRes.products);
        if (bestRes.products) setBestSellers(bestRes.products);
        if (newRes.products) setNewArrivals(newRes.products);
        if (banRes.banners) setBanners(banRes.banners);
      } catch (err) {
        console.error('[Home] Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 bg-[#FDFDFB]">
      {/* 1. HERO SLIDER CAROUSEL */}
      <HeroSlider banners={banners} onNavigate={onNavigate} />

      {/* 2. CATEGORY HORIZONTAL SLIDER */}
      <CategorySlider categories={categories} onNavigate={onNavigate} />

      {/* 3. PRODUCT CAROUSEL SLIDER: BEST SELLERS */}
      <ProductSlider
        title="Best Sellers Loved by Kids & Parents"
        subtitle="Our most ordered toys and family essentials based on verified customer purchases"
        badge="🔥 Top Trending This Week"
        badgeColor="bg-rose-100 text-rose-900 border-rose-200"
        products={bestSellers}
        viewAllLink="/shop?sort=best-selling"
        onNavigate={onNavigate}
        onQuickView={onQuickView}
      />

      {/* 4. SHOP BY AGE MILESTONE - VIBRANT & EYE-CATCHING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl sm:rounded-4xl p-8 sm:p-12 relative overflow-hidden shadow-md">
          {/* Subtle Background Accent Blurs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-400 font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              Developmental Milestones
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1.5">
              Shop by Your Child's Age
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Every stage has unique cognitive milestones. Explore products calibrated specifically
              for safety, motor dexterity, and curious minds.
            </p>
          </div>

          {/* Age Cards Grid with eye-catching kid-friendly colors and icons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-8 relative z-10">
            {[
              {
                age: '0-2',
                label: '0–2 Years',
                sub: 'Sensory & Tummy Time',
                icon: Baby,
                color: 'from-emerald-400/20 to-emerald-500/10 hover:border-emerald-400 text-emerald-300',
              },
              {
                age: '3-5',
                label: '3–5 Years',
                sub: 'Preschool & Building',
                icon: Blocks,
                color: 'from-amber-400/20 to-amber-500/10 hover:border-amber-400 text-amber-300',
              },
              {
                age: '6-8',
                label: '6–8 Years',
                sub: 'STEM & Phonics',
                icon: Rocket,
                color: 'from-sky-400/20 to-sky-500/10 hover:border-sky-400 text-sky-300',
              },
              {
                age: '9-12',
                label: '9–12 Years',
                sub: 'Robotics & Strategy',
                icon: Zap,
                color: 'from-purple-400/20 to-purple-500/10 hover:border-purple-400 text-purple-300',
              },
              {
                age: '12+',
                label: '12+ Years',
                sub: 'Advanced Mechanics',
                icon: Palette,
                color: 'from-rose-400/20 to-rose-500/10 hover:border-rose-400 text-rose-300',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.age}
                  type="button"
                  onClick={() => onNavigate(`/shop?age=${item.age}`)}
                  className={`p-4 sm:p-5 bg-gradient-to-br ${item.color} bg-slate-800/80 border border-slate-700/80 rounded-2xl text-left transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white">
                      Explore
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-black text-white block group-hover:text-amber-300 transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-300 mt-0.5 block leading-tight">
                      {item.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. PRODUCT CAROUSEL SLIDER: FEATURED & MONTESSORI PICKS */}
      <ProductSlider
        title="Featured Montessori & Creative Toys"
        subtitle="Handcrafted natural wooden blocks, sensory sets, and developmental discovery tools"
        badge="✨ Parent & Teacher Favorites"
        badgeColor="bg-amber-100 text-amber-900 border-amber-200"
        products={featuredProducts}
        viewAllLink="/shop?featured=true"
        onNavigate={onNavigate}
        onQuickView={onQuickView}
      />

      {/* 6. EYE-CATCHING DEALS & PROMOTIONS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-8 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <span className="inline-block px-3 py-1 bg-white text-orange-900 text-xs font-black uppercase tracking-wider rounded-full shadow-sm">
                Special Family Offer
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Save Up to 20% on Developmental Bundles
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 max-w-xl leading-relaxed">
                Use code <strong className="underline decoration-2">WELCOME10</strong> for 10% off your first order, or <strong className="underline decoration-2">KIDS20</strong> for 20% off orders over Rs. 4,000. Free delivery included!
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                type="button"
                onClick={() => onNavigate('/shop?sort=best-selling')}
                className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Shop Bundles Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SHOP BY BUDGET - CLEAN ROUNDED CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Shop by Friendly Budget
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thoughtful and durable gifts for every family celebration
              </p>
            </div>
            <button
              onClick={() => onNavigate('/shop')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Price Tiers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Under Rs. 500', max: 500, emoji: '🎈' },
              { label: 'Under Rs. 1,000', max: 1000, emoji: '🧩' },
              { label: 'Under Rs. 2,000', max: 2000, emoji: '🎨' },
              { label: 'Under Rs. 3,000', max: 3000, emoji: '🚀' },
              { label: 'Under Rs. 5,000', max: 5000, emoji: '🤖' },
              { label: 'Premium Picks', max: 20000, emoji: '👑' },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => onNavigate(`/shop?maxPrice=${b.max}`)}
                className="py-3 px-3 bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 rounded-2xl text-center transition-all transform hover:-translate-y-0.5 shadow-2xs group"
              >
                <span className="text-lg block mb-1 group-hover:scale-110 transition-transform">
                  {b.emoji}
                </span>
                <span className="text-xs font-extrabold text-slate-900 group-hover:text-amber-900 block">
                  {b.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE GIFT FINDER RECOMMENDER */}
      <GiftFinderSection onNavigate={onNavigate} onQuickView={onQuickView} />

      {/* 9. PARENT REVIEWS & TRUST TESTIMONIAL SLIDER */}
      <ParentReviewsSlider />

      {/* 10. NEW ARRIVALS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
              Freshly Unboxed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              New Arrivals This Season
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop?isNew=true')}
            className="text-xs font-bold text-slate-900 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Explore All New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
