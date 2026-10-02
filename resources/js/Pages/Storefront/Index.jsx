import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function Index({
    navCategories = [],
    featuredCategories = [],
    featuredProducts = [],
    newArrivals = [],
    brands = [],
    settings = {},
}) {
    const siteName = settings.site_name || 'ORIO STYLE';
    const siteTagline = settings.site_tagline || 'Enterprise Single-Vendor E-Commerce Platform';
    const currencySymbol = settings.currency_symbol || '৳';

    return (
        <StorefrontLayout navCategories={navCategories}>
            <Head title={`${siteName} - ${siteTagline}`} />

            <div className="mn-main-content">
                <div className="row">
                    <div className="col-xxl-12">

                        {/* Hero Banner Section */}
                        <section className="mn-hero swiper-container m-b-15">
                            <div className="mn-hero-slider owl-carousel">
                                <div className="mn-hero-slide swiper-slide slide-1">
                                    <div className="mn-hero-detail">
                                        <p className="label"><span>50%<br />OFF</span></p>
                                        <h1>Fashion & Style<br />Collection 2026</h1>
                                        <p>Discover premium apparel and trending dynamic catalog items.</p>
                                        <a href="#featured-products" className="mn-btn-2"><span>Shop Now</span></a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Featured Categories Carousel Section */}
                        {featuredCategories && featuredCategories.length > 0 && (
                            <section className="mn-category p-tb-15">
                                <div className="mn-title mb-4">
                                    <h2>Featured <span>Categories</span></h2>
                                </div>
                                <div className="row">
                                    {featuredCategories.map((cat, index) => (
                                        <div key={cat.id} className="col-lg-2 col-md-4 col-6 m-b-15">
                                            <div className={`mn-cat-card cat-card-${(index % 6) + 1}`}>
                                                <span className="bg">{cat.products_count || 0}</span>
                                                <h4>Category</h4>
                                                <h3>{cat.name}</h3>
                                                <p>Items ({cat.products_count || 0})</p>
                                                <ul>
                                                    <li>
                                                        <Link href={`/?category=${cat.slug}`}>
                                                            <img
                                                                src={cat.image || `/storefront/img/category/${(index % 12) + 1}.jpg`}
                                                                alt={cat.name}
                                                            />
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Featured Products Section */}
                        {featuredProducts && featuredProducts.length > 0 && (
                            <section id="featured-products" className="mn-new-product p-tb-15">
                                <div className="mn-title mb-4">
                                    <h2>Featured <span>Products</span></h2>
                                </div>
                                <div className="row">
                                    {featuredProducts.map((product) => {
                                        const primaryImg = product.primary_image?.image_path || '/storefront/img/product/1.jpg';
                                        const price = parseFloat(product.base_price || 0).toFixed(2);
                                        const comparePrice = product.sale_price ? parseFloat(product.sale_price).toFixed(2) : null;

                                        return (
                                            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 m-b-30">
                                                <div className="mn-product-card">
                                                    <div className="mn-product-img">
                                                        {comparePrice ? (
                                                            <div className="lbl">
                                                                <span className="trending">Sale</span>
                                                            </div>
                                                        ) : product.is_featured ? (
                                                            <div className="lbl">
                                                                <span className="new">Featured</span>
                                                            </div>
                                                        ) : null}
                                                        <div className="mn-img">
                                                            <Link href="/" className="image">
                                                                <img className="main-img" src={primaryImg} alt={product.name} />
                                                            </Link>
                                                            <div className="mn-options">
                                                                <ul>
                                                                    <li>
                                                                        <button type="button" className="mn-add-cart border-0 bg-transparent" title="Add To Cart">
                                                                            <i className="ri-shopping-cart-line" />
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mn-product-detail">
                                                        <div className="cat">
                                                            <Link href={`/?category=${product.category?.slug || ''}`}>
                                                                {product.category?.name || 'General'}
                                                            </Link>
                                                        </div>
                                                        <h5>
                                                            <Link href="/">{product.name}</Link>
                                                        </h5>
                                                        <div className="mn-price">
                                                            <div className="mn-price-new">{currencySymbol}{price}</div>
                                                            {comparePrice && (
                                                                <div className="mn-price-old">{currencySymbol}{comparePrice}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* New Arrivals Section */}
                        {newArrivals && newArrivals.length > 0 && (
                            <section id="new-arrivals" className="mn-new-product p-tb-15">
                                <div className="mn-title mb-4">
                                    <h2>New <span>Arrivals</span></h2>
                                </div>
                                <div className="row">
                                    {newArrivals.map((product) => {
                                        const primaryImg = product.primary_image?.image_path || '/storefront/img/product/5.jpg';
                                        const price = parseFloat(product.base_price || 0).toFixed(2);
                                        const comparePrice = product.sale_price ? parseFloat(product.sale_price).toFixed(2) : null;

                                        return (
                                            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 m-b-30">
                                                <div className="mn-product-card">
                                                    <div className="mn-product-img">
                                                        <div className="lbl">
                                                            <span className="new">New</span>
                                                        </div>
                                                        <div className="mn-img">
                                                            <Link href="/" className="image">
                                                                <img className="main-img" src={primaryImg} alt={product.name} />
                                                            </Link>
                                                            <div className="mn-options">
                                                                <ul>
                                                                    <li>
                                                                        <button type="button" className="mn-add-cart border-0 bg-transparent" title="Add To Cart">
                                                                            <i className="ri-shopping-cart-line" />
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mn-product-detail">
                                                        <div className="cat">
                                                            <Link href={`/?category=${product.category?.slug || ''}`}>
                                                                {product.category?.name || 'General'}
                                                            </Link>
                                                        </div>
                                                        <h5>
                                                            <Link href="/">{product.name}</Link>
                                                        </h5>
                                                        <div className="mn-price">
                                                            <div className="mn-price-new">{currencySymbol}{price}</div>
                                                            {comparePrice && (
                                                                <div className="mn-price-old">{currencySymbol}{comparePrice}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Service Highlights Section */}
                        <section className="mn-service p-tb-15 my-4">
                            <div className="row">
                                <div className="col-lg-3 col-sm-6 m-b-15">
                                    <div className="mn-service-box p-3 border rounded text-center">
                                        <i className="ri-truck-line display-6 text-primary mb-2" />
                                        <h5>Fast Delivery</h5>
                                        <p className="text-muted mb-0">Inside city: {settings.estimated_delivery_inside || '24-48 Hours'}</p>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-sm-6 m-b-15">
                                    <div className="mn-service-box p-3 border rounded text-center">
                                        <i className="ri-shield-check-line display-6 text-primary mb-2" />
                                        <h5>100% Genuine</h5>
                                        <p className="text-muted mb-0">Authentic products directly from brands</p>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-sm-6 m-b-15">
                                    <div className="mn-service-box p-3 border rounded text-center">
                                        <i className="ri-customer-service-2-line display-6 text-primary mb-2" />
                                        <h5>24/7 Support</h5>
                                        <p className="text-muted mb-0">Dedicated customer care assistance</p>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-sm-6 m-b-15">
                                    <div className="mn-service-box p-3 border rounded text-center">
                                        <i className="ri-secure-payment-line display-6 text-primary mb-2" />
                                        <h5>Secure Payment</h5>
                                        <p className="text-muted mb-0">COD & encrypted payment processing</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Partner Brands Section */}
                        {brands && brands.length > 0 && (
                            <section className="mn-brand p-tb-15">
                                <div className="mn-title mb-4">
                                    <h2>Partner <span>Brands</span></h2>
                                </div>
                                <div className="row align-items-center">
                                    {brands.map((brand) => (
                                        <div key={brand.id} className="col-lg-2 col-md-3 col-4 text-center mb-3">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} style={{ maxHeight: '50px', filter: 'grayscale(80%)', opacity: 0.8 }} className="img-fluid" />
                                            ) : (
                                                <span className="fw-bold text-muted">{brand.name}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
