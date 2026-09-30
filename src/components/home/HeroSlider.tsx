import React, { useState, useEffect, useRef } from 'react';
import { Banner } from '../../types/index.ts';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

interface HeroSliderProps {
  banners: Banner[];
  onNavigate: (route: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback slides in case banners are loading
  const slides = banners && banners.length > 0 ? banners : [
    {
      id: 'ban_1',
      title: 'Make Every Playtime Special',
      subtitle: 'Discover safe, inspiring, and durable toys designed for purposeful childhood learning and endless family joy.',
      image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg',
      ctaText: 'Explore Collection',
      link: '/shop',
      active: true,
      sortOrder: 1,
    },
    {
      id: 'ban_2',
      title: 'Hands-On STEM & Coding Lab',
      subtitle: 'Equip young minds with mechanical wonder, logic puzzles, and beginner robotics.',
      image: '/src/assets/images/product_stem_robotics_1790783464103.jpg',
      ctaText: 'Shop STEM Toys',
      link: '/category/stem-toys',
      active: true,
      sortOrder: 2,
    },
    {
      id: 'ban_3',
      title: 'Family Game Nights & Tabletop Joy',
      subtitle: 'Connect across generations with cooperative strategy games, memory cards, and wooden chess sets.',
      image: '/src/assets/images/hero_family_playtime_1790785198699.jpg',
      ctaText: 'Explore Board Games',
      link: '/category/board-games',
      active: true,
      sortOrder: 3,
    },
    {
      id: 'ban_4',
      title: 'Architectural Natural Wood Blocks',
      subtitle: 'Precision-crafted solid beechwood arches and pillars for boundless spatial creativity.',
      image: '/src/assets/images/product_building_blocks_1790783483537.jpg',
      ctaText: 'Discover Building Sets',
      link: '/category/building-blocks',
      active: true,
      sortOrder: 4,
    },
    {
      id: 'ban_5',
      title: 'Little Makers Creative Workshop',
      subtitle: 'Safe watercolor paints, non-drying organic clay, and DIY activity kits that spark endless imagination.',
      image: '/src/assets/images/hero_creative_crafts_1790785215362.jpg',
      ctaText: 'Shop Creative Toys',
      link: '/category/creative-toys',
      active: true,
      sortOrder: 5,
    },
    {
      id: 'ban_6',
      title: 'Heirloom Scandinavian Dollhouses',
      subtitle: 'Artisanal miniature furniture, birch plywood frames, and timeless pretend play.',
      image: '/src/assets/images/product_wooden_dollhouse_1790783499318.jpg',
      ctaText: 'Explore Dollhouses',
      link: '/category/dolls',
      active: true,
      sortOrder: 6,
    },
  ];

  // Slide Badges for kids & parents appeal
  const slideBadges = [
    { tag: '✨ Montessori & Natural Play', color: 'bg-amber-100 text-amber-900 border-amber-200' },
    { tag: '🚀 STEM & Robotics Adventure', color: 'bg-sky-100 text-sky-900 border-sky-200' },
    { tag: '🎲 Family Board Games & Bonding', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
    { tag: '🏛️ Architectural Spatial Thinking', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
    { tag: '🎨 Arts, Crafts & Imagination', color: 'bg-orange-100 text-orange-900 border-orange-200' },
    { tag: '🏰 Timeless Creative Pretend Play', color: 'bg-rose-100 text-rose-900 border-rose-200' },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-play timer (5 seconds)
  useEffect(() => {
    if (!isPaused) {
      timeoutRef.current = setTimeout(nextSlide, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPaused, slides.length]);

  const currentSlide = slides[currentIndex];
  const currentBadge = slideBadges[currentIndex % slideBadges.length];

  return (
    <div
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Container with rounded colorful gradient border */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-amber-400/20 via-sky-300/20 to-purple-400/20 p-1 sm:p-1.5 shadow-lg">
        <div className="relative w-full min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] rounded-[22px] sm:rounded-[28px] overflow-hidden bg-slate-900 text-white flex items-center">
          {/* Background Images with smooth fade */}
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center scale-102"
              />
              {/* Gradient scrim for high readability for both kids and parents */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20 sm:w-3/4 lg:w-3/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent sm:hidden" />
            </div>
          ))}

          {/* Slide Content Overlay */}
          <div className="relative z-20 max-w-xl p-6 sm:p-12 lg:p-16 space-y-5">
            {/* Playful Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/90 text-slate-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{currentBadge.tag}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.12] text-white drop-shadow-sm">
              {currentSlide.title}
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md drop-shadow-xs">
              {currentSlide.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate(currentSlide.link || '/shop')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-md flex items-center gap-2"
              >
                <span>{currentSlide.ctaText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/gift-finder')}
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>🎁 Gift Finder</span>
              </button>
            </div>

            {/* Trust Highlights under slider */}
            <div className="flex items-center gap-4 pt-3 text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Non-Toxic & Safe
              </span>
              <span>·</span>
              <span>🚚 Free Delivery &gt; Rs. 3,000</span>
              <span>·</span>
              <span>💵 Cash on Delivery</span>
            </div>
          </div>

          {/* Navigation Controls: Previous / Next Arrows */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white backdrop-blur-md transition-all hover:scale-105 border border-white/20"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white backdrop-blur-md transition-all hover:scale-105 border border-white/20"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Indicator Pagination Dots */}
          <div className="absolute bottom-4 sm:bottom-6 right-6 sm:right-10 z-30 flex items-center gap-2 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setCurrentIndex(dotIndex)}
                aria-label={`Jump to slide ${dotIndex + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  dotIndex === currentIndex
                    ? 'w-7 h-2 bg-amber-400 shadow-xs'
                    : 'w-2 h-2 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
