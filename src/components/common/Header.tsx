import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { Product, Category } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_edu', name: 'Educational Toys', slug: 'educational-toys', description: 'Montessori learning sets and logic games', image: '/src/assets/images/product_stem_robotics_1790783464103.jpg', isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'cat_blocks', name: 'Building Blocks', slug: 'building-blocks', description: 'Architectural wooden blocks and magnetic tiles', image: '/src/assets/images/product_building_blocks_1790783483537.jpg', isActive: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'cat_stem', name: 'STEM Toys', slug: 'stem-toys', description: 'Robotics kits and science labs', image: '/src/assets/images/product_stem_robotics_1790783464103.jpg', isActive: true, sortOrder: 3, createdAt: '', updatedAt: '' },
  { id: 'cat_board', name: 'Board Games & Puzzles', slug: 'board-games', description: 'Family strategy games and jigsaw puzzles', image: '/src/assets/images/product_building_blocks_1790783483537.jpg', isActive: true, sortOrder: 4, createdAt: '', updatedAt: '' },
  { id: 'cat_baby', name: 'Baby Toys & Sensory', slug: 'baby-toys', description: 'Silicone teething toys and sensory rattles', image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg', isActive: true, sortOrder: 5, createdAt: '', updatedAt: '' },
  { id: 'cat_books', name: 'Kids Books & Learning', slug: 'kids-books', description: 'Interactive picture books and early phonics', image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg', isActive: true, sortOrder: 6, createdAt: '', updatedAt: '' },
  { id: 'cat_crafts', name: 'Arts, Crafts & Stationery', slug: 'arts-and-crafts', description: 'Non-toxic crayons and modeling clay', image: '/src/assets/images/product_building_blocks_1790783483537.jpg', isActive: true, sortOrder: 7, createdAt: '', updatedAt: '' },
  { id: 'cat_rc', name: 'Remote Control Toys', slug: 'remote-control-toys', description: 'All-terrain crawlers and RC vehicles', image: '/src/assets/images/product_stem_robotics_1790783464103.jpg', isActive: true, sortOrder: 8, createdAt: '', updatedAt: '' },
  { id: 'cat_dolls', name: 'Dolls & Dollhouses', slug: 'dolls', description: 'Artisanal wooden dollhouses and figurines', image: '/src/assets/images/product_wooden_dollhouse_1790783499318.jpg', isActive: true, sortOrder: 9, createdAt: '', updatedAt: '' },
  { id: 'cat_clothing', name: 'Kids Clothing & Wear', slug: 'kids-clothing', description: 'Organic cotton playwear and seasonal outfits', image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg', isActive: true, sortOrder: 10, createdAt: '', updatedAt: '' },
];
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Gift,
  ShieldCheck,
  LogOut,
  Sliders,
  PackageCheck,
  Home,
  LayoutGrid,
  Flame,
  Tag,
  Phone,
  Truck,
  CheckCircle2,
  BookOpen,
  Palette,
  Gamepad2,
  Shirt,
  Puzzle,
  Baby,
  ArrowRight,
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute, onOpenAuth }) => {
  const { user, logout, demoLogin } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .getCategories()
      .then((res) => {
        if (res.categories) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  // Search debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getProducts({ search: searchQuery.trim(), limit: 5 });
        setSearchResults(res.products || []);
        setSearchOpen(true);
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile search when toggled
  useEffect(() => {
    if (mobileSearchVisible && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchVisible]);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close sidebar and open popups on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setMobileSearchVisible(false);
        setSearchOpen(false);
        setUserDropdownOpen(false);
        setCategoriesDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      setMobileSearchVisible(false);
      setMobileMenuOpen(false);
      onNavigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryIcon = (slug: string, name: string) => {
    const lower = `${slug} ${name}`.toLowerCase();
    if (lower.includes('book') || lower.includes('read') || lower.includes('story')) {
      return <BookOpen className="w-4 h-4 text-emerald-600" />;
    }
    if (lower.includes('art') || lower.includes('craft') || lower.includes('paint') || lower.includes('draw')) {
      return <Palette className="w-4 h-4 text-pink-600" />;
    }
    if (lower.includes('baby') || lower.includes('infant') || lower.includes('toddler')) {
      return <Baby className="w-4 h-4 text-sky-600" />;
    }
    if (lower.includes('cloth') || lower.includes('wear') || lower.includes('apparel')) {
      return <Shirt className="w-4 h-4 text-indigo-600" />;
    }
    if (lower.includes('game') || lower.includes('board') || lower.includes('puzzle')) {
      return <Gamepad2 className="w-4 h-4 text-violet-600" />;
    }
    if (lower.includes('stem') || lower.includes('robot') || lower.includes('science')) {
      return <Sparkles className="w-4 h-4 text-cyan-600" />;
    }
    return <Puzzle className="w-4 h-4 text-amber-600" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* 1. Announcement Bar */}
      <div className="bg-[#0F172A] text-slate-100 text-xs py-2 px-3 text-center font-medium flex items-center justify-center gap-1.5 sm:gap-2 border-b border-slate-800">
        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wide shrink-0">
          Nationwide
        </span>
        <span className="text-slate-200 text-[11px] sm:text-xs truncate sm:text-clip">
          Free Delivery on Orders Above <strong>Rs. 3,000</strong> · Safe, Non-Toxic & Montessori Approved
        </span>
      </div>

      {/* 2. Main Brand & Search Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: 3 Parallel Lines Menu button + Logo (works on Mobile, Laptop & Desktop) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileMenuOpen(true);
            }}
            className="p-2 sm:px-3 sm:py-2 text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/90 active:bg-slate-300/80 rounded-xl transition-all active:scale-95 flex items-center gap-2 border border-slate-200/80 shadow-2xs group cursor-pointer"
            aria-label="Open sidebar menu and categories"
            title="Browse Menu & Categories"
          >
            <Menu className="w-5 h-5 text-slate-800 group-hover:text-amber-600 transition-colors" />
            <span className="hidden sm:inline-block text-xs font-bold text-slate-800 tracking-tight group-hover:text-amber-600 transition-colors">
              Menu
            </span>
          </button>

          {/* Brand Wordmark */}
          <div
            onClick={() => onNavigate('/')}
            className="cursor-pointer flex items-center gap-2 select-none group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-xs group-hover:bg-amber-400 transition-colors shrink-0">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none">
                Learnora
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-slate-500 font-semibold">
                Kids & Family
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Global Search Bar with Autocomplete Suggestions */}
        <div ref={searchRef} className="hidden sm:block flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search toys, books, STEM kits, board games..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-transparent focus:border-slate-300 outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Autocomplete Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Products
              </div>
              {searchResults.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSearchOpen(false);
                    onNavigate(`/product/${prod.slug}`);
                  }}
                  className="px-3 py-2 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-colors"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Rs. {(prod.salePrice ?? prod.price).toLocaleString()} · {prod.brand}
                    </p>
                  </div>
                </div>
              ))}
              <div
                onClick={() => {
                  setSearchOpen(false);
                  onNavigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                }}
                className="px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 cursor-pointer text-center border-t border-slate-100 mt-1"
              >
                View all results for "{searchQuery}"
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile search toggle button */}
          <button
            type="button"
            onClick={() => setMobileSearchVisible(!mobileSearchVisible)}
            aria-label="Toggle search"
            className="sm:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop Gift Finder Link */}
          <button
            type="button"
            onClick={() => onNavigate('/gift-finder')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 hover:bg-amber-200/80 rounded-xl transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Gift Finder
          </button>

          {/* Wishlist Icon */}
          <button
            type="button"
            onClick={() => {
              if (!user) onOpenAuth();
              else onNavigate('/account/wishlist');
            }}
            aria-label="Wishlist"
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Bag Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping Bag"
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Desktop Account Dropdown */}
          <div className="relative hidden sm:block">
            {user ? (
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span className="hidden md:inline text-xs font-medium text-slate-800 max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Account Menu */}
            {userDropdownOpen && user && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50"
                onClick={() => setUserDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/account')}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/account/orders')}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4 text-slate-400" />
                  My Orders
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/account/wishlist')}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-slate-400" />
                  Saved Wishlist
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onNavigate('/');
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {mobileSearchVisible && (
        <div className="sm:hidden px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/80 animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={mobileSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search toys, books, puzzles, crafts..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white rounded-xl border border-slate-200 outline-none focus:border-amber-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Quick search suggestions chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar mt-1 text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">Popular:</span>
            {['Montessori', 'Wooden Blocks', 'Board Games', 'STEM', 'Books'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setMobileSearchVisible(false);
                  onNavigate(`/shop?search=${encodeURIComponent(tag)}`);
                }}
                className="px-2 py-0.5 bg-white border border-slate-200/80 rounded-lg text-slate-700 whitespace-nowrap hover:border-amber-400"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Desktop Horizontal Navigation Links */}
      <nav className="hidden lg:flex items-center justify-between border-t border-slate-100 px-4 sm:px-6 lg:px-8 py-2 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className={`hover:text-slate-900 transition-colors ${
              currentRoute === '/' ? 'text-slate-900 font-bold' : ''
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className={`hover:text-slate-900 transition-colors ${
              currentRoute === '/shop' ? 'text-slate-900 font-bold' : ''
            }`}
          >
            All Products
          </button>

          {/* Categories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors py-1"
            >
              Categories
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {categoriesDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoriesDropdownOpen(false);
                      onNavigate(`/category/${cat.slug}`);
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(cat.slug, cat.name)}
                      {cat.name}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Shop by Age quick links */}
          <div className="flex items-center gap-2 text-slate-500 border-l border-slate-200 pl-4">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Age:</span>
            {['0-2', '3-5', '6-8', '9-12'].map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => onNavigate(`/shop?age=${age}`)}
                className="hover:text-slate-900 px-1 py-0.5"
              >
                {age}Y
              </button>
            ))}
          </div>

          {/* Shop by Budget */}
          <div className="flex items-center gap-2 text-slate-500 border-l border-slate-200 pl-4">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Budget:</span>
            <button
              type="button"
              onClick={() => onNavigate('/shop?maxPrice=1000')}
              className="hover:text-slate-900"
            >
              &lt; 1K
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/shop?maxPrice=3000')}
              className="hover:text-slate-900"
            >
              &lt; 3K
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/shop?maxPrice=5000')}
              className="hover:text-slate-900"
            >
              &lt; 5K
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/shop?sort=best-selling')}
            className="hover:text-amber-700 transition-colors flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Best Sellers
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/shop?isNew=true')}
            className="hover:text-amber-700 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            New Arrivals
          </button>
        </div>
      </nav>

      {/* ==============================================================
          4. RICH, CRYSTAL-CLEAR SIDEBAR (DRAWER FOR MOBILE, LAPTOP & DESKTOP)
          ============================================================== */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex" role="dialog" aria-modal="true">
          {/* Backdrop with dark blur */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[88vw] sm:w-[380px] max-w-md bg-white h-screen max-h-screen shadow-2xl flex flex-col z-10 overflow-hidden animate-slideInLeft border-r border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-xs shrink-0">
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/');
                }}
                className="flex items-center gap-2.5 cursor-pointer group select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base shadow-xs group-hover:bg-amber-300 transition-colors">
                  L
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight leading-none text-white group-hover:text-amber-400 transition-colors">
                    Learnora
                  </h3>
                  <p className="text-[10px] text-amber-300 font-medium tracking-wide uppercase mt-0.5">
                    Kids & Family Store
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  ESC
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                  aria-label="Close menu"
                  title="Close Menu (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-slate-800 overscroll-contain">
              {/* User Account / Sign In Status Card */}
              {user ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center overflow-hidden border border-slate-300 shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-100 text-amber-800 rounded-full">
                          Parent
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/70 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('/account');
                      }}
                      className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 flex flex-col items-center gap-0.5"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('/account/orders');
                      }}
                      className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 flex flex-col items-center gap-0.5"
                    >
                      <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>Orders</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('/account/wishlist');
                      }}
                      className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 flex flex-col items-center gap-0.5"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Wishlist</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/70 rounded-2xl p-4 text-center">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Welcome to Learnora</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 mb-3">
                    Sign in to track orders and save your child's favorite toys.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-colors"
                    >
                      Sign In / Register
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        demoLogin('customer');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      1-Click Parent Demo
                    </button>
                  </div>
                </div>
              )}

              {/* In-Drawer Search Bar */}
              <div>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search toys, books, puzzles..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-100 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-amber-500 transition-all placeholder:text-slate-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </form>
              </div>

              {/* Main Store Links */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Explore Store
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/');
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentRoute === '/'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Home className="w-4 h-4" />
                      Home Storefront
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/shop');
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentRoute === '/shop'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutGrid className="w-4 h-4" />
                      All Products & Catalog
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Gift Finder Highlight Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/gift-finder');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between hover:from-amber-200 hover:to-amber-100 transition-all shadow-2xs"
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Toy & Gift Finder
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                      Wizard
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/shop?sort=best-selling');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Best Selling Toys
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">Popular</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/shop?isNew=true');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      New Arrivals
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      Fresh
                    </span>
                  </button>
                </div>
              </div>

              {/* Shop by Category Section */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span>Categories</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/shop');
                    }}
                    className="text-amber-600 font-bold hover:underline normal-case text-xs"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate(`/category/${c.slug}`);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 flex items-center justify-between transition-colors border border-transparent hover:border-slate-200"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {getCategoryIcon(c.slug, c.name)}
                        </span>
                        <span className="truncate">{c.name}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop by Age Bracket */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Shop by Child's Age
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { age: '0-2', label: '0–2 Years', sub: 'Infant & Toddler' },
                    { age: '3-5', label: '3–5 Years', sub: 'Preschoolers' },
                    { age: '6-8', label: '6–8 Years', sub: 'Early Explorers' },
                    { age: '9-12', label: '9–12 Years', sub: 'STEM & Builders' },
                    { age: '12+', label: '12+ Years', sub: 'Teens & Family' },
                    { age: 'all', label: 'All Ages', sub: 'Full Collection' },
                  ].map((item) => (
                    <button
                      key={item.age}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate(item.age === 'all' ? '/shop' : `/shop?age=${item.age}`);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all active:scale-98"
                    >
                      <span className="text-xs font-bold text-slate-900 block">{item.label}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop by Budget */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Shop by Budget
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { max: 1000, label: '< Rs. 1,000' },
                    { max: 3000, label: '< Rs. 3,000' },
                    { max: 5000, label: '< Rs. 5,000' },
                  ].map((b) => (
                    <button
                      key={b.max}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate(`/shop?maxPrice=${b.max}`);
                      }}
                      className="px-2 py-2 text-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 hover:border-amber-400 hover:bg-amber-50/50 transition-all"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust & Support Badges */}
              <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Free Delivery over <strong>Rs. 3,000</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>100% Non-Toxic & Child-Safe Materials</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    Helpline: <strong>+92 21 3584 9200</strong>
                  </span>
                </div>
              </div>

              {/* Sign out if logged in */}
              {user && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      onNavigate('/');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out of Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
