import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import HeroSlider from '@/Components/Storefront/HeroSlider';
import CategoryScrollSection from '@/Components/Storefront/CategoryScrollSection';

const DEFAULT_CATEGORIES = [
    { title: 'Clothes', subtitle: 'Fashion', count: 16, discount: '35%', card: 1, imgs: [1, 2, 3], slug: 'clothes' },
    { title: 'Cosmetics', subtitle: 'Generic', count: 45, discount: '22%', card: 2, imgs: [4, 5, 6], slug: 'cosmetics' },
    { title: 'Shoes', subtitle: 'Stylish', count: 58, discount: '65%', card: 3, imgs: [7, 8, 9], slug: 'shoes' },
    { title: 'Watches', subtitle: 'Digital', count: 64, discount: '45%', card: 4, imgs: [10, 11, 12], slug: 'watches' },
    { title: 'Belts', subtitle: 'Leather', count: 75, discount: '63%', card: 5, imgs: [13, 14, 15], slug: 'belts' },
    { title: 'Bags', subtitle: 'Cotton', count: 15, discount: '23%', card: 6, imgs: [16, 17, 18], slug: 'bags' },
];

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

    // Map dynamic subcategories to template structure with up to 3 dynamic images & fallback
    const categoriesToRender = featuredCategories && featuredCategories.length > 0
        ? featuredCategories.map((cat, index) => {
            const fallback = DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length];
            
            // Build 3 image list from dynamic category images
            let dynamicImgs = [];
            if (cat.images && cat.images.length > 0) {
                dynamicImgs = cat.images.slice(0, 3).map((img) => img.image_url || img.image_path);
            }
            
            // Fill up to 3 images with fallback if fewer than 3 uploaded
            while (dynamicImgs.length < 3) {
                const fallbackImgNum = fallback.imgs[dynamicImgs.length] || ((index * 3 + dynamicImgs.length + 1) % 18 || 1);
                dynamicImgs.push(`/storefront/img/category/${fallbackImgNum}.jpg`);
            }

            return {
                id: cat.id,
                title: cat.name,
                subtitle: cat.parent?.name || fallback.subtitle,
                count: cat.products_count !== undefined ? cat.products_count : fallback.count,
                discount: cat.discount ? String(cat.discount).trim() : null,
                card: (index % 6) + 1,
                slug: cat.slug || fallback.slug,
                images: dynamicImgs,
            };
        })
        : DEFAULT_CATEGORIES.map(c => ({
            ...c,
            images: c.imgs.map(n => `/storefront/img/category/${n}.jpg`)
        }));

    return (
        <StorefrontLayout navCategories={navCategories}>
            <Head title={`${siteName} - ${siteTagline}`} />

            <div className="row">
                <div className="col-xxl-12">

                    {/* Banner Carousel below Nav */}
                    <HeroSlider />

                    {/* Scrollable Category Cards Section (4 cards desktop, 2 cards mobile) */}
                    <CategoryScrollSection categories={categoriesToRender} />

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
                                                                    <a href="javascript:void(0)" className="mn-add-cart" title="Add To Cart">
                                                                        <i className="ri-shopping-cart-line" />
                                                                    </a>
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
                                                                    <a href="javascript:void(0)" className="mn-add-cart" title="Add To Cart">
                                                                        <i className="ri-shopping-cart-line" />
                                                                    </a>
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
        </StorefrontLayout>
    );
}
