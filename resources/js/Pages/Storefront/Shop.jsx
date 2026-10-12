import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import ProductCard from '@/Components/Storefront/ProductCard';
import ShopFilterSidebar from '@/Components/Storefront/ShopFilterSidebar';

export default function Shop({
    products = { data: [], links: [], total: 0, from: 0, to: 0, current_page: 1, last_page: 1 },
    categoriesTree = [],
    brands = [],
    priceRange = { min: 0, max: 10000 },
    filters = {},
    activeCategory = null,
    navCategories = [],
    settings = {},
}) {
    const currencySymbol = settings.currency_symbol || '৳';
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // Apply filter helper: updates URL query params smoothly via Inertia router
    const updateFilters = (keyOrObject, value) => {
        let newFilters = { ...filters };

        if (typeof keyOrObject === 'object' && keyOrObject !== null) {
            newFilters = { ...newFilters, ...keyOrObject };
        } else {
            if (value === null || value === undefined || value === '') {
                delete newFilters[keyOrObject];
            } else {
                newFilters[keyOrObject] = value;
            }
        }

        // Clean out empty keys
        Object.keys(newFilters).forEach((k) => {
            if (newFilters[k] === null || newFilters[k] === undefined || newFilters[k] === '') {
                delete newFilters[k];
            }
        });

        // Reset to page 1 on filter changes
        delete newFilters.page;

        router.get('/shop', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleResetAll = () => {
        router.get('/shop', {}, {
            preserveState: false,
            preserveScroll: true,
            replace: true,
        });
    };

    // Remove a single active filter chip
    const removeFilter = (filterKey, specificValue = null) => {
        if (filterKey === 'brand' && specificValue && filters.brand) {
            const currentBrands = Array.isArray(filters.brand) ? filters.brand : filters.brand.split(',').filter(Boolean);
            const remaining = currentBrands.filter(b => b !== specificValue);
            updateFilters('brand', remaining.length > 0 ? remaining.join(',') : null);
        } else if (filterKey === 'price') {
            updateFilters({ min_price: null, max_price: null });
        } else {
            updateFilters(filterKey, null);
        }
    };

    // Active filters summary list for chips
    const activeChips = [];
    if (filters.category) {
        const catName = activeCategory?.name || filters.category;
        activeChips.push({ key: 'category', label: `Category: ${catName}` });
    }
    if (filters.brand) {
        const brandSlugs = Array.isArray(filters.brand) ? filters.brand : filters.brand.split(',').filter(Boolean);
        brandSlugs.forEach(bs => {
            const bModel = brands.find(b => b.slug === bs);
            activeChips.push({ key: 'brand', value: bs, label: `Brand: ${bModel?.name || bs}` });
        });
    }
    if (filters.min_price || filters.max_price) {
        const minStr = filters.min_price ? `${currencySymbol}${filters.min_price}` : `${currencySymbol}0`;
        const maxStr = filters.max_price ? `${currencySymbol}${filters.max_price}` : 'Any';
        activeChips.push({ key: 'price', label: `Price: ${minStr} - ${maxStr}` });
    }
    if (filters.in_stock) {
        activeChips.push({ key: 'in_stock', label: 'In Stock Only' });
    }
    if (filters.search) {
        activeChips.push({ key: 'search', label: `Search: "${filters.search}"` });
    }

    const pageTitle = activeCategory
        ? `${activeCategory.name} | ORIO STYLE`
        : (filters.search ? `Search: "${filters.search}" | ORIO STYLE` : 'Shop All Collections | ORIO STYLE');

    return (
        <StorefrontLayout navCategories={navCategories} headerSolid={true}>
            <Head title={pageTitle} />

            {/* --- Hero Banner / Breadcrumb Header --- */}
            <section className="oubd-shop-banner py-5" style={{ backgroundColor: '#0e1c2a', color: '#ffffff', borderBottom: '1px solid #1a2c3f' }}>
                <div className="container-fluid" style={{ maxWidth: '1600px', padding: '0 40px' }}>
                    <nav aria-label="breadcrumb" className="mb-2">
                        <ol className="breadcrumb mb-0 font-size-12 text-uppercase tracking-wider">
                            <li className="breadcrumb-item">
                                <Link href="/" className="text-muted text-decoration-none hover-text-white">Home</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href="/shop" className="text-muted text-decoration-none hover-text-white">Shop</Link>
                            </li>
                            {activeCategory && (
                                <li className="breadcrumb-item active text-warning" aria-current="page">
                                    {activeCategory.name}
                                </li>
                            )}
                            {filters.search && (
                                <li className="breadcrumb-item active text-warning" aria-current="page">
                                    Search: "{filters.search}"
                                </li>
                            )}
                        </ol>
                    </nav>

                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div>
                            <h1 className="fw-bold text-uppercase mb-1" style={{ fontSize: '28px', letterSpacing: '1px' }}>
                                {activeCategory?.name || (filters.search ? `Results for "${filters.search}"` : 'All Collections')}
                            </h1>
                            <p className="font-size-13 text-muted mb-0">
                                {activeCategory?.description || 'Explore our complete catalog of signature designs, refined casuals, and luxury essentials.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Main Shop Discovery Section --- */}
            <div className="container-fluid py-4" style={{ maxWidth: '1600px', padding: '0 40px' }}>
                {/* Control Toolbar */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-3 border-bottom">
                    {/* Left: Item count & Mobile filter toggle */}
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="btn btn-outline-dark d-lg-none d-flex align-items-center gap-2 font-size-13 fw-semibold py-2 px-3"
                            onClick={() => setIsMobileDrawerOpen(true)}
                        >
                            <i className="ri-filter-3-line" />
                            Filters
                            {activeChips.length > 0 && (
                                <span className="badge bg-warning text-dark rounded-pill ms-1 font-size-11">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>

                        <span className="text-muted font-size-13">
                            {products.total > 0 ? (
                                <>
                                    Showing <strong className="text-dark">{products.from || 1}–{products.to || products.total}</strong> of <strong className="text-dark">{products.total}</strong> products
                                </>
                            ) : (
                                'No products found'
                            )}
                        </span>
                    </div>

                    {/* Right: Sorting & Per-Page Controls */}
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <label htmlFor="shopSortSelect" className="font-size-13 text-muted text-nowrap mb-0 d-none d-sm-inline">
                                Sort By:
                            </label>
                            <select
                                id="shopSortSelect"
                                className="form-select form-select-sm font-size-13 cursor-pointer"
                                value={filters.sort || 'newest'}
                                onChange={(e) => updateFilters('sort', e.target.value)}
                                style={{ minWidth: '170px' }}
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="popular">Featured / Popular</option>
                                <option value="name_asc">Alphabetical: A–Z</option>
                                <option value="name_desc">Alphabetical: Z–A</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Active Filter Chips Strip */}
                {activeChips.length > 0 && (
                    <div className="d-flex flex-wrap align-items-center gap-2 pb-3 mb-3 border-bottom">
                        <span className="font-size-12 fw-bold text-muted text-uppercase tracking-wider me-1">
                            Active Filters:
                        </span>
                        {activeChips.map((chip, idx) => (
                            <span
                                key={idx}
                                className="badge bg-light text-dark border px-2 py-1 font-size-12 fw-normal d-inline-flex align-items-center gap-2 rounded-pill shadow-xs"
                            >
                                {chip.label}
                                <button
                                    type="button"
                                    onClick={() => removeFilter(chip.key, chip.value)}
                                    className="btn btn-link p-0 border-0 text-muted hover-text-danger"
                                    style={{ lineHeight: 1, textDecoration: 'none' }}
                                    title="Remove filter"
                                >
                                    <i className="ri-close-line font-size-13" />
                                </button>
                            </span>
                        ))}
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className="btn btn-link text-danger font-size-12 p-0 ms-2 text-decoration-none fw-semibold"
                        >
                            Reset All
                        </button>
                    </div>
                )}

                {/* Main 2-Column Content Layout */}
                <div className="row g-4">
                    {/* Left Column: Desktop Sticky Filter Sidebar */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <div style={{ position: 'sticky', top: '100px' }}>
                            <ShopFilterSidebar
                                categoriesTree={categoriesTree}
                                brands={brands}
                                priceRange={priceRange}
                                filters={filters}
                                currencySymbol={currencySymbol}
                                onFilterChange={updateFilters}
                                onResetFilters={handleResetAll}
                            />
                        </div>
                    </div>

                    {/* Right Column: Products Grid & Pagination */}
                    <div className="col-lg-9 col-12">
                        {products.data && products.data.length > 0 ? (
                            <>
                                <div className="oubd-product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                                    {products.data.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            currencySymbol={currencySymbol}
                                            isNew={product.is_new_arrival}
                                        />
                                    ))}
                                </div>

                                {/* Custom Pagination Controls */}
                                {products.last_page > 1 && (
                                    <div className="d-flex justify-content-center align-items-center gap-1 mt-5 pt-3 border-top">
                                        {products.links.map((link, idx) => {
                                            if (!link.url && link.label.includes('&laquo;')) {
                                                return (
                                                    <span key={idx} className="btn btn-sm btn-outline-secondary disabled border-0 px-3">
                                                        <i className="ri-arrow-left-s-line" />
                                                    </span>
                                                );
                                            }
                                            if (!link.url && link.label.includes('&raquo;')) {
                                                return (
                                                    <span key={idx} className="btn btn-sm btn-outline-secondary disabled border-0 px-3">
                                                        <i className="ri-arrow-right-s-line" />
                                                    </span>
                                                );
                                            }
                                            if (!link.url) {
                                                return (
                                                    <span key={idx} className="btn btn-sm btn-light disabled px-3">
                                                        {link.label}
                                                    </span>
                                                );
                                            }

                                            const isPrevious = link.label.includes('&laquo;');
                                            const isNext = link.label.includes('&raquo;');
                                            const labelText = isPrevious ? <i className="ri-arrow-left-s-line" /> : isNext ? <i className="ri-arrow-right-s-line" /> : link.label;

                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url}
                                                    preserveScroll
                                                    preserveState
                                                    className={`btn btn-sm rounded px-3 font-size-13 fw-semibold ${
                                                        link.active
                                                            ? 'btn-dark bg-dark text-white shadow-sm'
                                                            : 'btn-outline-secondary text-dark border-0 hover-bg-light'
                                                    }`}
                                                >
                                                    {labelText}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-5 my-5 bg-light rounded p-4">
                                <div className="mb-3">
                                    <i className="ri-search-eye-line text-muted" style={{ fontSize: '56px' }} />
                                </div>
                                <h4 className="fw-bold text-dark text-uppercase font-size-18 mb-2">
                                    No Products Match Your Selection
                                </h4>
                                <p className="text-muted font-size-13 mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                                    We couldn't find any items matching your active filter criteria. Try adjusting the price range or resetting all active filters.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    className="btn btn-dark px-4 py-2 text-uppercase font-size-12 fw-bold tracking-wider"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Mobile Offcanvas Filter Drawer --- */}
            {isMobileDrawerOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
                    style={{ zIndex: 1250 }}
                    onClick={() => setIsMobileDrawerOpen(false)}
                >
                    <div
                        className="bg-white h-100 position-absolute top-0 start-0 p-4 overflow-auto shadow-lg"
                        style={{ width: '85%', maxWidth: '360px', zIndex: 1260 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                            <h5 className="fw-bold font-size-15 text-uppercase mb-0 tracking-wider">
                                Filter Products
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setIsMobileDrawerOpen(false)}
                            />
                        </div>

                        <ShopFilterSidebar
                            categoriesTree={categoriesTree}
                            brands={brands}
                            priceRange={priceRange}
                            filters={filters}
                            currencySymbol={currencySymbol}
                            onFilterChange={(k, v) => {
                                updateFilters(k, v);
                            }}
                            onResetFilters={() => {
                                handleResetAll();
                                setIsMobileDrawerOpen(false);
                            }}
                        />

                        <div className="pt-3 mt-4 border-top">
                            <button
                                type="button"
                                onClick={() => setIsMobileDrawerOpen(false)}
                                className="btn btn-dark w-100 py-2 text-uppercase font-size-13 fw-bold"
                            >
                                Apply Filters ({products.total} Items)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
