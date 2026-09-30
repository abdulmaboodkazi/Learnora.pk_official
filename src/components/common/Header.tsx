import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { Product, Category } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Gift,
  ShieldCheck,
  LogOut,
  Sliders,
  PackageCheck,
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.categories) setCategories(res.categories);
    }).catch(() => {});
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

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      onNavigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* 1. Announcement Bar */}
      <div className="bg-[#0F172A] text-slate-100 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-slate-800">
        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wide">
          Nationwide
        </span>
        <span className="text-slate-200">
          Free Delivery on Orders Above <strong>Rs. 3,000</strong> · Safe, Tested & Montessori Approved · Cash on Delivery
        </span>
      </div>

      {/* 2. Main Brand & Search Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Wordmark (Zone 1) */}
        <div
          onClick={() => onNavigate('/')}
          className="cursor-pointer flex items-center gap-2 select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-900 font-extrabold flex items-center justify-center text-lg shadow-sm group-hover:bg-amber-400 transition-colors">
            L
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
              Learnora
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-500 font-medium">
              Kids & Family
            </span>
          </div>
        </div>

        {/* Global Search Bar with Autocomplete Suggestions */}
        <div ref={searchRef} className="hidden sm:block flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search toys, books, STEM, games, clothing..."
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

        {/* User Actions (Zone 3) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Gift Finder Link */}
          <button
            onClick={() => onNavigate('/gift-finder')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 hover:bg-amber-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Gift Finder
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else onNavigate('/account/wishlist');
            }}
            aria-label="Wishlist"
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
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
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping Bag"
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Dropdown */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
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
                  onClick={() => onNavigate('/account')}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => onNavigate('/account/orders')}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4 text-slate-400" />
                  My Orders
                </button>
                <button
                  onClick={() => onNavigate('/account/wishlist')}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-slate-400" />
                  Saved Wishlist
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
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

      {/* 3. Horizontal Navigation Links (Zone 2) */}
      <nav className="hidden lg:flex items-center justify-between border-t border-slate-100 px-4 sm:px-6 lg:px-8 py-2 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('/')}
            className={`hover:text-slate-900 transition-colors ${currentRoute === '/' ? 'text-slate-900 font-bold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className={`hover:text-slate-900 transition-colors ${currentRoute === '/shop' ? 'text-slate-900 font-bold' : ''}`}
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
                    onClick={() => {
                      setCategoriesDropdownOpen(false);
                      onNavigate(`/category/${cat.slug}`);
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors block"
                  >
                    {cat.name}
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
            <button onClick={() => onNavigate('/shop?maxPrice=1000')} className="hover:text-slate-900">
              &lt; 1K
            </button>
            <button onClick={() => onNavigate('/shop?maxPrice=3000')} className="hover:text-slate-900">
              &lt; 3K
            </button>
            <button onClick={() => onNavigate('/shop?maxPrice=5000')} className="hover:text-slate-900">
              &lt; 5K
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('/shop?sort=best-selling')}
            className="hover:text-amber-700 transition-colors flex items-center gap-1"
          >
            Best Sellers
          </button>
          <button
            onClick={() => onNavigate('/shop?isNew=true')}
            className="hover:text-amber-700 transition-colors"
          >
            New Arrivals
          </button>
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-base">Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-slate-100">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 rounded-lg outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </form>
            </div>

            <div className="p-4 flex flex-col gap-1 text-sm font-medium text-slate-700">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/');
                }}
                className="text-left py-2 hover:text-amber-700"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/shop');
                }}
                className="text-left py-2 hover:text-amber-700"
              >
                All Products
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/gift-finder');
                }}
                className="text-left py-2 text-amber-700 font-semibold flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Gift Finder
              </button>

              <div className="py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                Categories
              </div>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(`/category/${c.slug}`);
                  }}
                  className="text-left py-1.5 pl-2 text-slate-600 hover:text-slate-900 text-xs"
                >
                  {c.name}
                </button>
              ))}

              <div className="py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                Shop by Age
              </div>
              <div className="grid grid-cols-2 gap-2 pl-2">
                {['0-2', '3-5', '6-8', '9-12', '12+'].map((age) => (
                  <button
                    key={age}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(`/shop?age=${age}`);
                    }}
                    className="text-left text-xs text-slate-600 py-1"
                  >
                    {age} Years
                  </button>
                ))}
              </div>

              {/* Demo Account Switcher on Mobile */}
              <div className="border-t border-slate-100 mt-4 pt-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Demo Fast Login</p>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      demoLogin('customer');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-800 text-center font-medium"
                  >
                    1-Click Parent Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
