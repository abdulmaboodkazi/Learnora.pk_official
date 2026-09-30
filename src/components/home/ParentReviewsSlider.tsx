import React, { useRef, useState, useEffect } from 'react';
import { Star, ShieldCheck, Heart, Sparkles, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  avatar: string;
  rating: number;
  productName: string;
  review: string;
  childAge: string;
  tag: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ayesha & Tariq Siddiqui',
    role: 'Parents of two (3 & 6 yrs)',
    city: 'Karachi, Clifton',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    productName: 'Architectural Solid Beechwood Building Blocks',
    review:
      'Finding real, untreated, non-toxic wooden toys in Pakistan used to be so difficult. Learnora’s beechwood blocks are heirloom quality — completely smooth edges, no toxic odors, and our kids build castles for hours every single weekend!',
    childAge: 'Ages 3 & 6',
    tag: 'Montessori Play',
  },
  {
    id: 't2',
    name: 'Dr. Bilal Mansoor',
    role: 'Pediatrician & Father',
    city: 'Lahore, DHA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    productName: 'STEM Modular Programmable Coding Robot',
    review:
      'As a doctor, toy safety and screen-free developmental stimulation are non-negotiable for me. The STEM robotics kit exceeded our expectations. Solid components, clear step-by-step logic, and outstanding customer service.',
    childAge: 'Age 8',
    tag: 'STEM Learning',
  },
  {
    id: 't3',
    name: 'Zainab Qureshi',
    role: 'Montessori Early Years Teacher',
    city: 'Islamabad, F-7',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    productName: 'Artisanal Scandinavian Birch Dollhouse',
    review:
      'We ordered three sets for our school activity room. The precision and safety certifications give us complete peace of mind. Delivery was prompt within 48 hours, packed with zero plastic waste!',
    childAge: 'Pre-K & KG',
    tag: 'Pretend Play',
  },
  {
    id: 't4',
    name: 'Hamza Farooqi',
    role: 'Parent & Software Architect',
    city: 'Rawalpindi, Bahria Town',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    productName: 'Family Strategy & Adventure Board Game',
    review:
      'Board game night is finally a household tradition again! The game rules are engaging for adults yet accessible enough for our 7-year-old. Cash on Delivery was super smooth, package arrived in mint condition.',
    childAge: 'Age 7 & 11',
    tag: 'Family Bonding',
  },
  {
    id: 't5',
    name: 'Mahnoor Farhan',
    role: 'Mother of toddler',
    city: 'Faisalabad',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    productName: 'Organic Sensory Activity Play Cube',
    review:
      'My 14-month-old is obsessed with the soft sensory textures and bell chimes. It survived countless drops and is easily machine washable. Huge congratulations to the Learnora team for bringing world-class toys here!',
    childAge: '14 Months',
    tag: 'Sensory Toddler',
  },
];

export const ParentReviewsSlider: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 360;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Trusted by 15,000+ Happy Families</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Loved by Kids, Approved by Parents
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Real feedback from Pakistani mothers, fathers, and educators who prioritize child safety,
            durable materials, and screen-free imagination.
          </p>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Previous parent review"
            disabled={!canScrollLeft}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Next parent review"
            disabled={!canScrollRight}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reviews Slider Track */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="w-[310px] sm:w-[350px] shrink-0 snap-start bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Stars & Tag */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {t.tag}
                </span>
              </div>

              {/* Product link highlight */}
              <p className="text-xs font-bold text-slate-900 line-clamp-1 mb-2">
                Purchased: <span className="text-amber-700 font-semibold">{t.productName}</span>
              </p>

              {/* Review Quote */}
              <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-4">
                "{t.review}"
              </p>
            </div>

            {/* Parent Profile */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/50"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                  <span title="Verified Customer" className="inline-flex">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {t.role} · {t.city}
                </p>
                <p className="text-[10px] font-semibold text-amber-800">
                  {t.childAge}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges Banner for Adults & Kids */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: ShieldCheck,
            title: '100% Non-Toxic & Safe',
            sub: 'EU & ASTM certified materials',
            color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          },
          {
            icon: Sparkles,
            title: 'Childhood Development',
            sub: 'STEM, Montessori & Creative',
            color: 'text-amber-600 bg-amber-50 border-amber-200',
          },
          {
            icon: CheckCircle2,
            title: 'Free Delivery > Rs. 3,000',
            sub: 'Nationwide safe doorstep shipping',
            color: 'text-sky-600 bg-sky-50 border-sky-200',
          },
          {
            icon: Heart,
            title: 'Family Care Guarantee',
            sub: '7-day easy replacements',
            color: 'text-rose-600 bg-rose-50 border-rose-200',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center gap-3 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
