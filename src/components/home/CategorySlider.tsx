import React, { useRef } from 'react';
import { Category } from '../../types/index.ts';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CategorySliderProps {
  categories: Category[];
  onNavigate: (route: string) => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({ categories, onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  // Pastel theme array to make categories eye-catching for kids and adults
  const categoryGradients = [
    'from-amber-500/10 to-amber-500/5 hover:border-amber-400 group-hover:bg-amber-50',
    'from-sky-500/10 to-sky-500/5 hover:border-sky-400 group-hover:bg-sky-50',
    'from-rose-500/10 to-rose-500/5 hover:border-rose-400 group-hover:bg-rose-50',
    'from-emerald-500/10 to-emerald-500/5 hover:border-emerald-400 group-hover:bg-emerald-50',
    'from-purple-500/10 to-purple-500/5 hover:border-purple-400 group-hover:bg-purple-50',
    'from-orange-500/10 to-orange-500/5 hover:border-orange-400 group-hover:bg-orange-50',
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Worlds of Wonder</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Shop by Category
          </h2>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Previous categories"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:scale-105 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Next categories"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:scale-105 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Track */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat, idx) => {
          const style = categoryGradients[idx % categoryGradients.length];
          return (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/category/${cat.slug}`)}
              className={`group w-[170px] sm:w-[190px] shrink-0 snap-start bg-white p-4 rounded-2xl border border-slate-200/90 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center`}
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-50 group-hover:scale-105 transition-transform overflow-hidden p-2 flex items-center justify-center mb-3 shadow-2xs">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {cat.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
