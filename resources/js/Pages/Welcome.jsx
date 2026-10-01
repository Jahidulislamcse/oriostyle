import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Storefront/Navbar';
import Footer from '@/Components/Storefront/Footer';
import ProductCard from '@/Components/Storefront/ProductCard';
import QuickViewModal from '@/Components/Storefront/QuickViewModal';

export default function Welcome({
    categoriesTree = [],
    featuredBrands = [],
    featuredProducts = [],
    newArrivals = [],
}) {
    const { settings, appName } = usePage().props;
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';
    const siteFavicon = settings?.site_favicon;

    const [quickViewProduct, setQuickViewProduct] = useState(null);

    return (
        <div className="min-h-screen bg-light text-dark font-sans selection:bg-warning selection:text-dark">
            <Head title={`${siteName} - Antu Storefront`}>
                {siteFavicon && <link rel="icon" href={siteFavicon} />}
            </Head>

            {/* Antu Navbar */}
            <Navbar categoriesTree={categoriesTree} />

            <main className="mn-main-content">
                {/* Hero Banner Section */}
                <section className="bg-dark text-white py-5 position-relative overflow-hidden border-bottom border-warning">
                    <div className="container-fluid max-w-7xl mx-auto px-3 py-4">
                        <div className="row align-items-center g-5">
                            <div className="col-lg-7 text-center text-lg-start">
                                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-warning text-dark fw-bold text-xs mb-3">
                                    <i className="ri-sparkling-fill"></i>
                                    <span>{settings?.storefront_tagline || 'Official Antu Ecommerce Storefront'}</span>
                                </div>
                                <h1 className="display-4 fw-extrabold text-white tracking-tight mb-3">
                                    Discover Pure <span className="text-warning">Elegance & Style</span>
                                </h1>
                                <p className="text-slate-300 fs-6 max-w-xl mx-auto mx-lg-0 mb-4 leading-relaxed">
                                    {settings?.storefront_description || 'Explore our verified multi-category catalog featuring authentic craft, premium brands, and seamless digital shopping experience.'}
                                </p>
                                <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                                    <Link
                                        href="/shop"
                                        className="btn btn-warning btn-lg text-dark fw-bold px-4 py-2.5 rounded-pill shadow d-flex align-items-center gap-2"
                                    >
                                        <i className="ri-store-2-line fs-5"></i>
                                        <span>Shop Full Catalog</span>
                                    </Link>
                                    <a
                                        href="#categories"
                                        className="btn btn-outline-light btn-lg fw-bold px-4 py-2.5 rounded-pill"
                                    >
                                        Browse Categories
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-5 d-none d-lg-block text-center">
                                <div className="p-4 bg-secondary bg-opacity-10 border border-secondary rounded-4 shadow-lg">
                                    <img src="/assets/img/logo/logo.png" alt="Antu Banner" className="img-fluid mb-3" style={{ maxHeight: '80px' }} />
                                    <h4 className="fw-bold text-white mb-2">{siteName}</h4>
                                    <p className="text-muted text-xs mb-0">Single Vendor Enterprise Storefront Engine</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories Grid Section */}
                {categoriesTree.length > 0 && (
                    <section id="categories" className="py-5 border-bottom">
                        <div className="container-fluid max-w-7xl mx-auto px-3">
                            <div className="d-flex justify-content-between align-items-end mb-4">
                                <div>
                                    <span className="text-warning text-uppercase fw-bold text-xs tracking-wider">Taxonomies</span>
                                    <h2 className="fs-3 fw-bold text-dark mb-0">Explore Top Categories</h2>
                                </div>
                                <Link href="/shop" className="text-dark fw-bold text-xs text-decoration-none hover-warning">
                                    Browse All Categories →
                                </Link>
                            </div>

                            <div className="row g-4">
                                {categoriesTree.map((cat) => (
                                    <div key={cat.id} className="col-6 col-md-3">
                                        <Link
                                            href={`/shop?category=${cat.slug}`}
                                            className="card h-100 border-0 shadow-sm hover-shadow rounded-4 p-4 text-center text-decoration-none text-dark transition"
                                        >
                                            <div className="bg-light text-warning rounded-circle p-3 mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                <i className="ri-shopping-bag-line fs-3"></i>
                                            </div>
                                            <h5 className="fs-6 fw-bold mb-1">{cat.name}</h5>
                                            <span className="badge bg-light text-dark rounded-pill text-xs">
                                                {cat.products_count ?? 0} Products
                                            </span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Products Grid */}
                {featuredProducts.length > 0 && (
                    <section className="py-5 border-bottom">
                        <div className="container-fluid max-w-7xl mx-auto px-3">
                            <div className="d-flex justify-content-between align-items-end mb-4">
                                <div>
                                    <span className="text-warning text-uppercase fw-bold text-xs tracking-wider">Handpicked</span>
                                    <h2 className="fs-3 fw-bold text-dark mb-0">Featured Products</h2>
                                </div>
                                <Link href="/shop" className="text-dark fw-bold text-xs text-decoration-none hover-warning">
                                    Shop All Featured →
                                </Link>
                            </div>

                            <div className="row g-4">
                                {featuredProducts.map((product) => (
                                    <div key={product.id} className="col-6 col-md-3">
                                        <ProductCard
                                            product={product}
                                            onQuickView={(p) => setQuickViewProduct(p)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Brands Section */}
                {featuredBrands.length > 0 && (
                    <section className="py-5 border-bottom bg-light">
                        <div className="container-fluid max-w-7xl mx-auto px-3 text-center">
                            <span className="text-warning text-uppercase fw-bold text-xs tracking-wider">Partners</span>
                            <h2 className="fs-3 fw-bold text-dark mb-4">Featured Brands</h2>

                            <div className="row g-3 justify-content-center">
                                {featuredBrands.map((brand) => (
                                    <div key={brand.id} className="col-4 col-md-2">
                                        <Link
                                            href={`/shop?brand=${brand.slug}`}
                                            className="card border-0 shadow-sm p-3 rounded-3 text-decoration-none text-dark hover-shadow transition h-100 d-flex flex-column align-items-center justify-content-center"
                                        >
                                            <span className="fw-bold fs-6">{brand.name}</span>
                                            {brand.products_count !== undefined && (
                                                <span className="text-muted text-xs mt-1">{brand.products_count} Items</span>
                                            )}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* New Arrivals Section */}
                {newArrivals.length > 0 && (
                    <section className="py-5">
                        <div className="container-fluid max-w-7xl mx-auto px-3">
                            <div className="d-flex justify-content-between align-items-end mb-4">
                                <div>
                                    <span className="text-warning text-uppercase fw-bold text-xs tracking-wider">Just In</span>
                                    <h2 className="fs-3 fw-bold text-dark mb-0">New Arrivals</h2>
                                </div>
                                <Link href="/shop" className="text-dark fw-bold text-xs text-decoration-none hover-warning">
                                    Explore All Arrivals →
                                </Link>
                            </div>

                            <div className="row g-4">
                                {newArrivals.map((product) => (
                                    <div key={product.id} className="col-6 col-md-3">
                                        <ProductCard
                                            product={product}
                                            onQuickView={(p) => setQuickViewProduct(p)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />

            {/* Antu Footer */}
            <Footer />
        </div>
    );
}
