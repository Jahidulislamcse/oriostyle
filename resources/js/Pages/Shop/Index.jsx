import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
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
    const [sort, setSort] = useState(filters.sort || 'newest');

    const updateFilters = (newParams = {}) => {
        const queryParams = {
            search: newParams.search !== undefined ? newParams.search : search,
            category: newParams.category !== undefined ? newParams.category : (filters.category || ''),
            brand: newParams.brand !== undefined ? newParams.brand : (filters.brand || ''),
            min_price: newParams.min_price !== undefined ? newParams.min_price : minPrice,
            max_price: newParams.max_price !== undefined ? newParams.max_price : maxPrice,
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

    const resetAllFilters = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSort('newest');
        router.get('/shop', {}, { preserveState: false });
    };

    return (
        <StoreLayout categoriesTree={categories}>
            <Head title={`Shop Catalog - ${siteName}`} />

            <div className="container-fluid px-3 py-3">
                {/* Page Breadcrumbs */}
                <div className="mn-breadcrumb mb-3">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h2 className="mn-breadcrumb-title fs-4 fw-bold">
                                {selectedCategory ? selectedCategory.name : selectedBrand ? `${selectedBrand.name} Collection` : 'Shop Catalog'}
                            </h2>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <ul className="mn-breadcrumb-list list-inline mb-0 text-xs text-muted">
                                <li className="list-inline-item"><Link href="/" className="text-dark">Home</Link></li>
                                <li className="list-inline-item">/</li>
                                <li className="list-inline-item active">Shop</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="row g-3">
                    {/* Filters Sidebar Column */}
                    <div className="col-lg-3">
                        <div className="bg-white p-3 rounded border shadow-sm space-y-4">
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
                                        <button type="submit" className="btn btn-primary text-white">
                                            <i className="ri-search-line"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {categories && categories.length > 0 && (
                                <div className="border-top pt-3">
                                    <h6 className="fw-bold text-uppercase text-xs text-muted mb-2">Categories</h6>
                                    <div className="list-group list-group-flush text-xs">
                                        <button
                                            onClick={() => updateFilters({ category: '' })}
                                            className={`list-group-item list-group-item-action border-0 px-2 py-1.5 ${!filters.category ? 'fw-bold bg-light' : ''}`}
                                        >
                                            All Categories
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => updateFilters({ category: cat.slug })}
                                                className={`list-group-item list-group-item-action border-0 px-2 py-1.5 ${filters.category === cat.slug ? 'fw-bold bg-light text-primary' : ''}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {brands && brands.length > 0 && (
                                <div className="border-top pt-3">
                                    <h6 className="fw-bold text-uppercase text-xs text-muted mb-2">Brands</h6>
                                    <div className="list-group list-group-flush text-xs max-h-48 overflow-auto">
                                        {brands.map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => updateFilters({ brand: filters.brand === b.slug ? '' : b.slug })}
                                                className={`list-group-item list-group-item-action border-0 px-2 py-1.5 ${filters.brand === b.slug ? 'fw-bold bg-light text-primary' : ''}`}
                                            >
                                                {b.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Products Grid Column */}
                    <div className="col-lg-9">
                        <div className="mn-pro-list-top d-flex justify-content-between align-items-center mb-3 bg-white p-2 rounded border">
                            <span className="text-xs text-muted">Showing {products.total || 0} products</span>
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-xs text-muted font-semibold">Sort by:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        updateFilters({ sort: e.target.value });
                                    }}
                                    className="form-select form-select-sm text-xs"
                                    style={{ width: 'auto' }}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name_asc">Name: A to Z</option>
                                </select>
                            </div>
                        </div>

                        {products.data && products.data.length > 0 ? (
                            <div className="row g-3">
                                {products.data.map((product) => (
                                    <div key={product.id} className="col-lg-4 col-md-6 col-sm-6">
                                        <ProductCard
                                            product={product}
                                            onQuickView={(p) => setQuickViewProduct(p)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded border p-5 text-center">
                                <i className="ri-shopping-bag-line fs-1 text-muted mb-2 d-block"></i>
                                <h5>No products found</h5>
                                <button onClick={resetAllFilters} className="btn btn-sm btn-primary mt-2">
                                    Reset Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {products.links && products.links.length > 3 && (
                            <div className="d-flex justify-content-center gap-1 mt-4">
                                {products.links.map((link, idx) => (
                                    link.url ? (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={idx}
                                            className="btn btn-sm btn-light disabled"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </StoreLayout>
    );
}
