import React, { useRef } from 'react';
import { Product } from '../../types/index.ts';
import { ProductCard } from '../common/ProductCard.tsx';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  products: Product[];
  viewAllLink?: string;
  onNavigate: (route: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductSlider: React.FC<ProductSliderProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-amber-100 text-amber-900 border-amber-200',
  products,
  viewAllLink,
  onNavigate,
  onQuickView,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Slider Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          {badge && (
            <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-1.5 ${badgeColor}`}>
              {badge}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* Controls & View All */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {viewAllLink && (
            <button
              onClick={() => onNavigate(viewAllLink)}
              className="text-xs font-bold text-slate-900 hover:text-amber-700 flex items-center gap-1 transition-colors mr-2"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:scale-105 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:scale-105 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track with peek & smooth snapping */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[260px] sm:w-[280px] lg:w-[290px] shrink-0 snap-start"
          >
            <ProductCard
              product={product}
              onQuickView={onQuickView}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
