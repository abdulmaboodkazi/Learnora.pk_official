import React, { useState, useEffect } from 'react';
import { Product } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { ProductCard } from '../common/ProductCard.tsx';
import { Sparkles, Gift, ArrowRight, RotateCcw } from 'lucide-react';

interface GiftFinderProps {
  onNavigate: (route: string) => void;
  onQuickView?: (product: Product) => void;
}

export const GiftFinderSection: React.FC<GiftFinderProps> = ({ onNavigate, onQuickView }) => {
  const [age, setAge] = useState<string>('3-5');
  const [interest, setInterest] = useState<string>('STEM');
  const [budget, setBudget] = useState<number>(3500);
  const [productType, setProductType] = useState<string>('all');

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Product[]>([]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.giftFinder({ age, interest, budget, productType });
      setMatches(res.recommendations || []);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [age, interest, budget, productType]);

  return (
    <section className="py-16 bg-[#F5F5F3] border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Interactive Gift Finder</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            Find the Perfect Gift for Any Child
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Select the recipient's age, primary interest, and your comfortable budget to instantly
            view handpicked, developmental products.
          </p>
        </div>

        {/* Interactive Selector Controls */}
        <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Question 1: Child Age */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              1. Child's Age
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {['0-2', '3-5', '6-8', '9-12'].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(a)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors border ${
                    age === a
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {a} Years
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Child Interest */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              2. Favorite Interest
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Robotics & STEM', value: 'STEM' },
                { label: 'Building & Architecture', value: 'Building' },
                { label: 'Creative Pretend', value: 'Pretend Play' },
                { label: 'Sensory & Motor', value: 'Sensory' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setInterest(item.value)}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-lg transition-colors border text-left truncate ${
                    interest === item.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Budget Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                3. Max Budget
              </label>
              <span className="text-xs font-bold text-amber-700 tabular-nums">
                Under Rs. {budget.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="9000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 tabular-nums">
              <span>Rs. 1,000</span>
              <span>Rs. 5,000</span>
              <span>Rs. 9,000+</span>
            </div>
          </div>

          {/* Question 4: Category / Type */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              4. Product Category
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-900 font-medium text-slate-800"
            >
              <option value="all">All Gift Categories</option>
              <option value="cat_stem">STEM & Robotics</option>
              <option value="cat_blocks">Building Blocks</option>
              <option value="cat_edu">Educational Toys</option>
              <option value="cat_dolls">Dolls & Playhouses</option>
              <option value="cat_books">Kids Books</option>
            </select>

            <button
              type="button"
              onClick={fetchRecommendations}
              className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Refresh Gifts ({matches.length})</span>
            </button>
          </div>
        </div>

        {/* Live Gift Recommendations Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.slice(0, 3).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No exact gifts matched all 4 narrow filters.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try raising the budget slider or selecting "All Categories".
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
