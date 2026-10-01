import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Storefront/Navbar';
import Footer from '@/Components/Storefront/Footer';
import ProductCard from '@/Components/Storefront/ProductCard';
import QuickViewModal from '@/Components/Storefront/QuickViewModal';
import { 
    Filter, 
    Search, 
    X, 
    ChevronRight, 
    SlidersHorizontal, 
    ArrowUpDown, 
    ShoppingBag, 
    Check, 
    RotateCcw 
} from 'lucide-react';

export default function Index({
    products = { data: [], links: [] },
    categories = [],
    brands = [],
    selectedCategory = null,
    selectedBrand = null,
    filters = {}
}) {
    const { settings, appName } = usePage().props;
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';

    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Form Filter State
    const [search, setSearch] = useState(filters.search || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [inStock, setInStock] = useState(Boolean(filters.in_stock));
    const [onSale, setOnSale] = useState(Boolean(filters.on_sale));
    const [sort, setSort] = useState(filters.sort || 'newest');

    const updateFilters = (newParams = {}) => {
        const queryParams = {
            search: newParams.search !== undefined ? newParams.search : search,
            category: newParams.category !== undefined ? newParams.category : (filters.category || ''),
            brand: newParams.brand !== undefined ? newParams.brand : (filters.brand || ''),
            min_price: newParams.min_price !== undefined ? newParams.min_price : minPrice,
            max_price: newParams.max_price !== undefined ? newParams.max_price : maxPrice,
            in_stock: newParams.in_stock !== undefined ? (newParams.in_stock ? 1 : '') : (inStock ? 1 : ''),
            on_sale: newParams.on_sale !== undefined ? (newParams.on_sale ? 1 : '') : (onSale ? 1 : ''),
            sort: newParams.sort !== undefined ? newParams.sort : sort,
        };

        // Remove empty keys
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });

        router.get('/shop', queryParams, { preserveState: true, preserveScroll: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilters({ search });
    };

    const handlePriceApply = (e) => {
        e.preventDefault();
        updateFilters({ min_price: minPrice, max_price: maxPrice });
    };

    const resetAllFilters = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setInStock(false);
        setOnSale(false);
        setSort('newest');
        router.get('/shop', {}, { preserveState: false });
    };

    const activeFilterCount = [
        filters.search,
        filters.category,
        filters.brand,
        filters.min_price,
        filters.max_price,
        filters.in_stock,
        filters.on_sale
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-[#071324] text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-[#D4AF37] selection:text-[#071324]">
            <Head title={`Shop Catalog - ${siteName}`} />

            <Navbar categoriesTree={categories} />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
                {/* Header Breadcrumb & Title */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <Link href="/" className="hover:text-[#EBD495]">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-[#EBD495] font-semibold">Shop Catalog</span>
                        {selectedCategory && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                <span className="text-slate-200">{selectedCategory.name}</span>
                            </>
                        )}
                        {selectedBrand && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                <span className="text-slate-200">{selectedBrand.name}</span>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                                {selectedCategory ? selectedCategory.name : selectedBrand ? `${selectedBrand.name} Collection` : 'All Products Catalog'}
                            </h1>
                            <p className="text-xs text-slate-400 mt-1">
                                Showing {products.total || 0} active products in catalog
                            </p>
                        </div>

                        {/* Top Sort & Mobile Filter Toggle */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E2038] text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                            >
                                <Filter className="w-4 h-4 text-[#D4AF37]" />
                                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                            </button>

                            <div className="flex items-center gap-2 bg-[#0E2038] px-3 py-2 rounded-xl border border-slate-700/80">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        updateFilters({ sort: e.target.value });
                                    }}
                                    className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-4"
                                >
                                    <option value="newest" className="bg-[#0E2038] text-white">Newest First</option>
                                    <option value="price_asc" className="bg-[#0E2038] text-white">Price: Low to High</option>
                                    <option value="price_desc" className="bg-[#0E2038] text-white">Price: High to Low</option>
                                    <option value="name_asc" className="bg-[#0E2038] text-white">Name: A to Z</option>
                                    <option value="oldest" className="bg-[#0E2038] text-white">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Filters Badges Bar */}
                {activeFilterCount > 0 && (
                    <div className="mb-6 flex flex-wrap items-center gap-2 bg-[#0E2038]/60 p-3 rounded-2xl border border-slate-800">
                        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mr-2">Active Filters:</span>
                        {filters.search && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#071324] text-slate-200 border border-slate-700">
                                Search: "{filters.search}"
                                <button onClick={() => { setSearch(''); updateFilters({ search: '' }); }}><X className="w-3 h-3 hover:text-rose-400" /></button>
                            </span>
                        )}
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#071324] text-[#EBD495] border border-[#D4AF37]/40">
                                Category: {selectedCategory.name}
                                <button onClick={() => updateFilters({ category: '' })}><X className="w-3 h-3 hover:text-rose-400" /></button>
                            </span>
                        )}
                        {selectedBrand && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#071324] text-[#EBD495] border border-[#D4AF37]/40">
                                Brand: {selectedBrand.name}
                                <button onClick={() => updateFilters({ brand: '' })}><X className="w-3 h-3 hover:text-rose-400" /></button>
                            </span>
                        )}
                        {(filters.min_price || filters.max_price) && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#071324] text-slate-200 border border-slate-700">
                                Price: ${filters.min_price || 0} - ${filters.max_price || '∞'}
                                <button onClick={() => { setMinPrice(''); setMaxPrice(''); updateFilters({ min_price: '', max_price: '' }); }}><X className="w-3 h-3 hover:text-rose-400" /></button>
                            </span>
                        )}
                        {filters.in_stock && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#071324] text-emerald-400 border border-emerald-500/40">
                                In Stock Only
                                <button onClick={() => { setInStock(false); updateFilters({ in_stock: false }); }}><X className="w-3 h-3 hover:text-rose-400" /></button>
                            </span>
                        )}
                        {filters.on_sale && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#071324] text-[#EBD495] border border-[#D4AF37]/40">
                                On Sale
                                <button onClick={() => { setOnSale(false); updateFilters({ on_sale: false }); }}><X className="w-3 h-3 hover:text-rose-400" /></button>
                            </span>
                        )}

                        <button
                            onClick={resetAllFilters}
                            className="ml-auto text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Clear All
                        </button>
                    </div>
                )}

                {/* Main Content Layout (Sidebar Filters + Products Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Filter Sidebar (Desktop & Mobile Drawer) */}
                    <aside className={`lg:block space-y-6 ${mobileFilterOpen ? 'block' : 'hidden'}`}>
                        <div className="bg-[#0E2038] p-6 rounded-2xl border border-slate-800 space-y-6">
                            {/* Search Filter Box */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3">Search Products</h3>
                                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Keywords..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 bg-[#071324] border border-slate-700 text-xs text-white rounded-xl focus:outline-none focus:border-[#D4AF37]"
                                    />
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearch(''); updateFilters({ search: '' }); }}
                                            className="absolute right-2.5 text-slate-400 hover:text-white"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* Categories Filter */}
                            {categories.length > 0 && (
                                <div className="border-t border-slate-800 pt-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Categories</h3>
                                        {filters.category && (
                                            <button
                                                onClick={() => updateFilters({ category: '' })}
                                                className="text-[11px] text-slate-400 hover:text-[#EBD495]"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                        <button
                                            onClick={() => updateFilters({ category: '' })}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                                                !filters.category ? 'bg-[#D4AF37]/20 text-[#EBD495] font-bold' : 'text-slate-300 hover:bg-[#142C49]'
                                            }`}
                                        >
                                            <span>All Categories</span>
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => updateFilters({ category: cat.slug })}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                                                    filters.category === cat.slug ? 'bg-[#D4AF37]/20 text-[#EBD495] font-bold' : 'text-slate-300 hover:bg-[#142C49]'
                                                }`}
                                            >
                                                <span className="truncate">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Brands Filter */}
                            {brands.length > 0 && (
                                <div className="border-t border-slate-800 pt-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Brands</h3>
                                        {filters.brand && (
                                            <button
                                                onClick={() => updateFilters({ brand: '' })}
                                                className="text-[11px] text-slate-400 hover:text-[#EBD495]"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                        {brands.map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => updateFilters({ brand: filters.brand === b.slug ? '' : b.slug })}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                                                    filters.brand === b.slug ? 'bg-[#D4AF37]/20 text-[#EBD495] font-bold' : 'text-slate-300 hover:bg-[#142C49]'
                                                }`}
                                            >
                                                <span className="truncate">{b.name}</span>
                                                {filters.brand === b.slug && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Range Filter */}
                            <div className="border-t border-slate-800 pt-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3">Price Range ($)</h3>
                                <form onSubmit={handlePriceApply} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-[#071324] border border-slate-700 text-xs text-white rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-[#071324] border border-slate-700 text-xs text-white rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#EBD495] border border-[#D4AF37]/40 rounded-lg text-xs font-bold transition cursor-pointer"
                                    >
                                        Apply Price Filter
                                    </button>
                                </form>
                            </div>

                            {/* Status Toggles */}
                            <div className="border-t border-slate-800 pt-5 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Status Toggles</h3>
                                
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={inStock}
                                        onChange={(e) => {
                                            setInStock(e.target.checked);
                                            updateFilters({ in_stock: e.target.checked });
                                        }}
                                        className="rounded border-slate-700 bg-[#071324] text-[#D4AF37] focus:ring-0"
                                    />
                                    <span>In Stock Products Only</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={onSale}
                                        onChange={(e) => {
                                            setOnSale(e.target.checked);
                                            updateFilters({ on_sale: e.target.checked });
                                        }}
                                        className="rounded border-slate-700 bg-[#071324] text-[#D4AF37] focus:ring-0"
                                    />
                                    <span>On Sale Products Only</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid Column */}
                    <div className="lg:col-span-3 space-y-8">
                        {products.data && products.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onQuickView={(p) => setQuickViewProduct(p)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#0E2038] rounded-3xl border border-slate-800 p-12 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-[#071324] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto">
                                    <ShoppingBag className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-white">No products found matching filters</h3>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    Try adjusting your search query, price ranges, or removing specific category & brand filters.
                                </p>
                                <button
                                    onClick={resetAllFilters}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#071324] font-bold text-xs hover:brightness-110 transition shadow cursor-pointer"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination Links */}
                        {products.links && products.links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-6 border-t border-slate-800">
                                {products.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-3.5 py-2 rounded-xl text-xs text-slate-600 bg-[#0E2038]/50 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                                link.active
                                                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#071324] font-bold shadow-md'
                                                    : 'bg-[#0E2038] text-slate-300 hover:bg-[#142C49] hover:text-[#EBD495] border border-slate-800'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />

            <Footer />
        </div>
    );
}
