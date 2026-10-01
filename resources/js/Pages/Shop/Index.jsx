import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Storefront/Navbar';
import Footer from '@/Components/Storefront/Footer';
import ProductCard from '@/Components/Storefront/ProductCard';
import QuickViewModal from '@/Components/Storefront/QuickViewModal';

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
        <div className="min-h-screen bg-light text-dark font-sans selection:bg-warning selection:text-dark">
            <Head title={`Shop Catalog - ${siteName}`} />

            <Navbar categoriesTree={categories} />

            <main className="mn-main-content py-4">
                <div className="container-fluid max-w-7xl mx-auto px-3">
                    {/* Breadcrumbs & Header */}
                    <div className="mb-4">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb text-xs">
                                <li className="breadcrumb-item"><Link href="/" className="text-dark text-decoration-none">Home</Link></li>
                                <li className="breadcrumb-item active">Shop Catalog</li>
                                {selectedCategory && <li className="breadcrumb-item active">{selectedCategory.name}</li>}
                                {selectedBrand && <li className="breadcrumb-item active">{selectedBrand.name}</li>}
                            </ol>
                        </nav>

                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 border-bottom pb-3">
                            <div>
                                <h1 className="fs-3 fw-extrabold mb-1">
                                    {selectedCategory ? selectedCategory.name : selectedBrand ? `${selectedBrand.name} Collection` : 'All Products Catalog'}
                                </h1>
                                <p className="text-muted text-xs mb-0">Showing {products.total || 0} active products</p>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <span className="text-xs fw-bold text-muted">Sort:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        updateFilters({ sort: e.target.value });
                                    }}
                                    className="form-select form-select-sm text-xs font-semibold"
                                    style={{ width: 'auto' }}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name_asc">Name: A to Z</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Active Filter Badges */}
                    {activeFilterCount > 0 && (
                        <div className="mb-4 d-flex flex-wrap align-items-center gap-2 bg-white p-2.5 rounded-3 border shadow-sm">
                            <span className="text-xs fw-bold text-uppercase text-muted me-2">Active Filters:</span>
                            {filters.search && (
                                <span className="badge bg-light text-dark border d-flex align-items-center gap-1">
                                    Search: "{filters.search}"
                                    <i className="ri-close-line cursor-pointer" onClick={() => { setSearch(''); updateFilters({ search: '' }); }}></i>
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                                    Category: {selectedCategory.name}
                                    <i className="ri-close-line cursor-pointer" onClick={() => updateFilters({ category: '' })}></i>
                                </span>
                            )}
                            {selectedBrand && (
                                <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                                    Brand: {selectedBrand.name}
                                    <i className="ri-close-line cursor-pointer" onClick={() => updateFilters({ brand: '' })}></i>
                                </span>
                            )}
                            <button onClick={resetAllFilters} className="btn btn-link btn-sm text-danger text-xs ms-auto text-decoration-none">
                                Clear All
                            </button>
                        </div>
                    )}

                    <div className="row g-4 items-start">
                        {/* Sidebar Filters */}
                        <aside className="col-lg-3">
                            <div className="bg-white p-3 rounded-4 border shadow-sm space-y-4">
                                <div>
                                    <h6 className="fw-bold text-uppercase text-xs text-muted mb-2">Search Catalog</h6>
                                    <form onSubmit={handleSearchSubmit}>
                                        <div className="input-group input-group-sm">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Keywords..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                            <button type="submit" className="btn btn-warning text-dark">
                                                <i className="ri-search-line"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {categories.length > 0 && (
                                    <div className="border-top pt-3">
                                        <h6 className="fw-bold text-uppercase text-xs text-muted mb-2">Categories</h6>
                                        <div className="list-group list-group-flush text-xs">
                                            <button
                                                onClick={() => updateFilters({ category: '' })}
                                                className={`list-group-item list-group-item-action border-0 px-2 py-1.5 rounded-2 ${!filters.category ? 'fw-bold bg-warning bg-opacity-20 text-dark' : ''}`}
                                            >
                                                All Categories
                                            </button>
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => updateFilters({ category: cat.slug })}
                                                    className={`list-group-item list-group-item-action border-0 px-2 py-1.5 rounded-2 ${filters.category === cat.slug ? 'fw-bold bg-warning bg-opacity-20 text-dark' : ''}`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {brands.length > 0 && (
                                    <div className="border-top pt-3">
                                        <h6 className="fw-bold text-uppercase text-xs text-muted mb-2">Brands</h6>
                                        <div className="list-group list-group-flush text-xs max-h-48 overflow-auto">
                                            {brands.map((b) => (
                                                <button
                                                    key={b.id}
                                                    onClick={() => updateFilters({ brand: filters.brand === b.slug ? '' : b.slug })}
                                                    className={`list-group-item list-group-item-action border-0 px-2 py-1.5 rounded-2 ${filters.brand === b.slug ? 'fw-bold bg-warning bg-opacity-20 text-dark' : ''}`}
                                                >
                                                    {b.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="border-top pt-3">
                                    <h6 className="fw-bold text-uppercase text-xs text-muted mb-2">Price Range ($)</h6>
                                    <form onSubmit={handlePriceApply} className="space-y-2">
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm text-xs"
                                                    placeholder="Min"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm text-xs"
                                                    placeholder="Max"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-sm btn-outline-dark w-100 fw-bold mt-2 text-xs">
                                            Apply Price
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </aside>

                        {/* Product Grid Column */}
                        <div className="col-lg-9">
                            {products.data && products.data.length > 0 ? (
                                <div className="row g-4">
                                    {products.data.map((product) => (
                                        <div key={product.id} className="col-6 col-md-4">
                                            <ProductCard
                                                product={product}
                                                onQuickView={(p) => setQuickViewProduct(p)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-4 border p-5 text-center">
                                    <i className="ri-shopping-bag-line fs-1 text-muted mb-3 d-block"></i>
                                    <h5 className="fw-bold">No products found</h5>
                                    <p className="text-muted text-xs">Try adjusting your filters or search keywords.</p>
                                    <button onClick={resetAllFilters} className="btn btn-warning font-bold text-xs mt-2">
                                        Reset All Filters
                                    </button>
                                </div>
                            )}

                            {/* Pagination */}
                            {products.links && products.links.length > 3 && (
                                <div className="d-flex justify-content-center gap-1 mt-4 pt-3 border-top">
                                    {products.links.map((link, idx) => (
                                        link.url ? (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className={`btn btn-sm ${link.active ? 'btn-warning text-dark font-bold' : 'btn-outline-secondary'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={idx}
                                                className="btn btn-sm btn-light text-muted disabled"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
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
