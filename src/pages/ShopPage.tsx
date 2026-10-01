import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import {
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  RotateCcw,
  Check,
  Star,
} from 'lucide-react';

interface ShopPageProps {
  onNavigate: (route: string) => void;
  onQuickView?: (product: Product) => void;
  initialParams?: Record<string, string>;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onNavigate,
  onQuickView,
  initialParams = {},
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialParams.search || '');
  const [category, setCategory] = useState(initialParams.category || 'all');
  const [age, setAge] = useState(initialParams.age || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(
    initialParams.maxPrice ? Number(initialParams.maxPrice) : 10000
  );
  const [brand, setBrand] = useState('all');
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState(initialParams.sort || 'featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 12;

  // Load categories
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.categories) setCategories(res.categories);
    }).catch(() => {});
  }, []);

  // Update from initialParams changes (e.g. navigation query param)
  useEffect(() => {
    if (initialParams.search !== undefined) setSearch(initialParams.search);
    if (initialParams.category !== undefined) setCategory(initialParams.category);
    if (initialParams.age !== undefined) setAge(initialParams.age);
    if (initialParams.maxPrice !== undefined) setMaxPrice(Number(initialParams.maxPrice));
    if (initialParams.sort !== undefined) setSort(initialParams.sort);
  }, [initialParams]);

  // Load products when filters change
  useEffect(() => {
    async function loadFilteredProducts() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit,
          sort,
        };
        if (search) params.search = search;
        if (category && category !== 'all') params.category = category;
        if (age && age !== 'all') params.age = age;
        if (maxPrice < 10000) params.maxPrice = maxPrice;
        if (brand && brand !== 'all') params.brand = brand;
        if (inStock) params.inStock = 'true';

        const res = await api.getProducts(params);
        setProducts(res.products || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('[Shop] Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFilteredProducts();
  }, [category, age, maxPrice, brand, inStock, sort, search, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setAge('all');
    setMaxPrice(10000);
    setBrand('all');
    setInStock(false);
    setSort('featured');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  // Available brands list
  const availableBrands = [
    'RoboSpark',
    'NordicTimber',
    'Little Manor',
    'TorqueApex',
    'Montessori World',
    'MagnaCraft',
    'GreenSci',
    'TabletopTales',
    'PureSprout',
    'CuriousKids Press',
    'LittleLoom',
    'WaldorfStudio',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <button onClick={() => onNavigate('/')} className="hover:text-slate-900">
              Home
            </button>
            <span>/</span>
            <span className="font-semibold text-slate-900">Shop Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {category !== 'all'
              ? categories.find((c) => c.slug === category || c.id === category)?.name || 'Products'
              : search
              ? `Results for "${search}"`
              : 'All Toys & Family Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} of {total} items
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 text-slate-900 cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="newest">New Arrivals</option>
              <option value="best-selling">Best Sellers</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ==============================================================
            DESKTOP FILTERS SIDEBAR
            ============================================================== */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Categories
            </label>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                  category === 'all'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.slug)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                    category === c.slug || category === c.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Age Filter */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Age Range
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {['all', '0-2', '3-5', '6-8', '9-12', '12+'].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(a)}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors ${
                    age === a
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {a === 'all' ? 'All Ages' : `${a} Years`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Max Price
              </label>
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {maxPrice >= 10000 ? 'Any Price' : `Rs. ${maxPrice.toLocaleString()}`}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 tabular-nums">
              <span>Rs. 500</span>
              <span>Rs. 10,000+</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
            >
              <option value="all">All Brands</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
              />
              <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* ==============================================================
            MAIN PRODUCT GRID
            ============================================================== */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-84 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={onQuickView}
                    onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg ${
                        page === i + 1
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                We couldn't find anything matching your selected filters. Try broadening your price
                range or removing the search keyword.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ==============================================================
          MOBILE FILTER DRAWER
          ============================================================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-base">Filter Catalog</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-amber-700 font-semibold px-2 py-1 rounded-lg hover:bg-amber-50"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
                  Categories
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setCategory('all')}
                    className={`p-2 text-left text-xs rounded-xl font-medium border transition-colors ${
                      category === 'all'
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.slug)}
                      className={`p-2 text-left text-xs rounded-xl font-medium border truncate transition-colors ${
                        category === c.slug
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
                  Age Range
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: 'all', label: 'All Ages' },
                    { val: '0-2', label: '0–2 Y' },
                    { val: '3-5', label: '3–5 Y' },
                    { val: '6-8', label: '6–8 Y' },
                    { val: '9-12', label: '9–12 Y' },
                    { val: '12+', label: '12+ Y' },
                  ].map((a) => (
                    <button
                      key={a.val}
                      type="button"
                      onClick={() => setAge(a.val)}
                      className={`py-2 px-1 text-center text-xs rounded-xl border transition-all ${
                        age === a.val
                          ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Max Price
                  </label>
                  <span className="text-xs font-bold text-amber-700">
                    Rs. {maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Rs. 500</span>
                  <span>Rs. 5,000</span>
                  <span>Rs. 10,000+</span>
                </div>
              </div>

              {/* In stock toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-colors"
              >
                Apply & View Products ({total})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
