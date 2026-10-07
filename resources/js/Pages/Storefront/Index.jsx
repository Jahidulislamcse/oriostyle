import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import HeroSlider from '@/Components/Storefront/HeroSlider';
import CategoryLookbookSection from '@/Components/Storefront/CategoryLookbookSection';
import ProductCard from '@/Components/Storefront/ProductCard';

const DEFAULT_LOOKBOOK_CATEGORIES = [
    { id: 1, title: 'THOBE', slug: 'thobe', images: ['/storefront/img/category/1.jpg'] },
    { id: 2, title: 'DAWAH T-SHIRT (PREMIUM)', slug: 'dawah-t-shirt', images: ['/storefront/img/category/2.jpg'] },
    { id: 3, title: 'DROP SHOULDER T-SHIRT', slug: 'drop-shoulder-t-shirt', images: ['/storefront/img/category/3.jpg'] },
    { id: 4, title: 'VISOR CAP', slug: 'visor-cap', images: ['/storefront/img/category/4.jpg'] },
    { id: 5, title: 'REGULAR T-SHIRT (PREMIUM)', slug: 'regular-t-shirt', images: ['/storefront/img/category/5.jpg'] },
    { id: 6, title: 'PAJAMA', slug: 'pajama', images: ['/storefront/img/category/6.jpg'] },
];

export default function Index({
    navCategories = [],
    featuredCategories = [],
    featuredProducts = [],
    newArrivals = [],
    brands = [],
    settings = {},
}) {
    const siteName = settings.site_name || 'OUBD';
    const siteTagline = settings.site_tagline || 'Purpose & Style with Premium Quality Collections';
    const currencySymbol = settings.currency_symbol || '৳';

    // Map dynamic categories to lookbook format
    const lookbookCategories = featuredCategories && featuredCategories.length > 0
        ? featuredCategories.map((cat, index) => {
            const fallback = DEFAULT_LOOKBOOK_CATEGORIES[index % DEFAULT_LOOKBOOK_CATEGORIES.length];
            let dynamicImg = null;
            if (cat.images && cat.images.length > 0) {
                dynamicImg = cat.images[0].image_url || cat.images[0].image_path;
            } else if (cat.image_url) {
                dynamicImg = cat.image_url;
            } else {
                dynamicImg = `/storefront/img/category/${(index % 18) + 1}.jpg`;
            }

            return {
                id: cat.id,
                title: cat.name,
                slug: cat.slug || fallback.slug,
                images: [dynamicImg],
                image_url: dynamicImg,
            };
        })
        : DEFAULT_LOOKBOOK_CATEGORIES;

    // Display items for new arrivals section
    const displayNewArrivals = newArrivals && newArrivals.length > 0
        ? newArrivals
        : [
            { id: 101, name: 'MENS PATCHWORK DROPSHOULDER T-SHIRT', base_price: 1600, primary_image: { image_path: '/storefront/img/product/1.jpg' }, brand: { name: 'OUBD' } },
            { id: 102, name: 'MENS DROPSHOULDER T-SHIRT', base_price: 1650, primary_image: { image_path: '/storefront/img/product/2.jpg' }, brand: { name: 'OUBD' } },
            { id: 103, name: 'MENS PATCHWORK DROPSHOULDER T-SHIRT', base_price: 2150, primary_image: { image_path: '/storefront/img/product/3.jpg' }, brand: { name: 'OUBD' } },
            { id: 104, name: 'MENS PATCHWORK DROPSHOULDER T-SHIRT', base_price: 2150, primary_image: { image_path: '/storefront/img/product/5.jpg' }, brand: { name: 'OUBD' } },
            { id: 105, name: 'MENS PATCHWORK DROPSHOULDER T-SHIRT', base_price: 2150, primary_image: { image_path: '/storefront/img/product/6.jpg' }, brand: { name: 'OUBD' } },
            { id: 106, name: 'MENS PATCHWORK T-SHIRT', base_price: 1050, primary_image: { image_path: '/storefront/img/product/9.jpg' }, brand: { name: 'OUBD' } },
        ];

    // Display items for Visor Cap / Accessories collection
    const visorCapProducts = [
        { id: 201, name: 'SPECIAL SUEDE VISOR CAP – SABR', base_price: 550, primary_image: { image_path: '/storefront/img/product/10.jpg' }, brand: { name: 'OUBD' } },
        { id: 202, name: 'SPECIAL SUEDE VISOR CAP SOLID', base_price: 550, primary_image: { image_path: '/storefront/img/product/11.jpg' }, brand: { name: 'OUBD' } },
        { id: 203, name: 'SPECIAL CORDUROY VISOR CAP – INSAF', base_price: 550, sale_price: 440, primary_image: { image_path: '/storefront/img/product/12.jpg' }, brand: { name: 'OUBD' } },
        { id: 204, name: 'SPECIAL SUEDE VISOR CAP RIDE TO HEAL', base_price: 550, primary_image: { image_path: '/storefront/img/product/13.jpg' }, brand: { name: 'OUBD' } },
        { id: 205, name: 'SPECIAL SUEDE VISOR CAP ZUHD', base_price: 550, primary_image: { image_path: '/storefront/img/product/14.jpg' }, brand: { name: 'OUBD' } },
        { id: 206, name: 'SPECIAL TWILL VISOR CAP – HOPE', base_price: 550, primary_image: { image_path: '/storefront/img/product/15.jpg' }, brand: { name: 'OUBD' } },
    ];

    // Display items for Thobe / Panjabi collection
    const thobeProducts = featuredProducts && featuredProducts.length > 0
        ? featuredProducts
        : [
            { id: 301, name: 'PREMIUM EMBROIDERED THOBE', base_price: 3450, primary_image: { image_path: '/storefront/img/product/16.jpg' }, brand: { name: 'OUBD' } },
            { id: 302, name: 'CLASSIC SHORT SLEEVE THOBE', base_price: 2950, primary_image: { image_path: '/storefront/img/product/17.jpg' }, brand: { name: 'OUBD' } },
            { id: 303, name: 'EXCLUSIVE ARABIAN THOBE', base_price: 3850, sale_price: 3250, primary_image: { image_path: '/storefront/img/product/18.jpg' }, brand: { name: 'OUBD' } },
            { id: 304, name: 'CASUAL COTTON THOBE', base_price: 2650, primary_image: { image_path: '/storefront/img/product/21.jpg' }, brand: { name: 'OUBD' } },
            { id: 305, name: 'MENS EXECUTIVE THOBE', base_price: 3200, primary_image: { image_path: '/storefront/img/product/23.jpg' }, brand: { name: 'OUBD' } },
            { id: 306, name: 'ROYAL EMBROIDERED THOBE', base_price: 4100, primary_image: { image_path: '/storefront/img/product/24.jpg' }, brand: { name: 'OUBD' } },
        ];

    return (
        <StorefrontLayout navCategories={navCategories}>
            <Head title={`${siteName} - ${siteTagline}`} />

            {/* 1. Full-Width Hero Slider */}
            <HeroSlider />

            {/* 2. High-Impact Collection Lookbook Grid (2-col mobile, 4/3-col desktop) */}
            <CategoryLookbookSection categories={lookbookCategories} />

            {/* 3. New Arrivals Product Grid Section (6-col desktop, 2-col mobile) */}
            <section id="new-arrivals" className="oubd-products-section">
                <div className="oubd-product-grid">
                    {displayNewArrivals.slice(0, 6).map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            currencySymbol={currencySymbol}
                            isNew={true}
                        />
                    ))}
                </div>

                <div className="oubd-btn-container">
                    <Link href="/#featured-products" className="oubd-outline-btn">
                        VIEW ALL NEW ARRIVAL
                    </Link>
                </div>
            </section>

            {/* 4. Promotional Collection Showcase 1 (Half Sleeve Thobe) */}
            <section className="oubd-collection-section">
                <div className="oubd-collection-banner-wrap">
                    <img
                        src="/storefront/img/banner/1.jpg"
                        alt="Mens Thobe Collection"
                        loading="lazy"
                    />
                </div>

                <h2 className="oubd-collection-title">HALF SLEEVE THOBE</h2>

                <div className="oubd-product-grid">
                    {thobeProducts.slice(0, 6).map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            currencySymbol={currencySymbol}
                            isNew={false}
                        />
                    ))}
                </div>

                <div className="oubd-btn-container">
                    <Link href="/?category=thobe" className="oubd-outline-btn">
                        VIEW ALL THOBE
                    </Link>
                </div>
            </section>

            {/* 5. Promotional Collection Showcase 2 (Visor Cap) */}
            <section className="oubd-collection-section">
                <div className="oubd-collection-banner-wrap">
                    <img
                        src="/storefront/img/banner/2.jpg"
                        alt="Special Suede Visor Cap Collection"
                        loading="lazy"
                    />
                </div>

                <h2 className="oubd-collection-title">VISOR CAP</h2>

                <div className="oubd-product-grid">
                    {visorCapProducts.slice(0, 6).map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            currencySymbol={currencySymbol}
                            isNew={false}
                        />
                    ))}
                </div>

                <div className="oubd-btn-container">
                    <Link href="/?category=visor-cap" className="oubd-outline-btn">
                        VIEW ALL VISOR CAP
                    </Link>
                </div>
            </section>

            {/* 6. Partner Brands Section */}
            {brands && brands.length > 0 && (
                <section className="oubd-products-section border-top pt-4">
                    <div className="container-fluid" style={{ maxWidth: '1600px' }}>
                        <div className="row align-items-center justify-content-center text-center g-3">
                            {brands.map((brand) => (
                                <div key={brand.id} className="col-lg-2 col-md-3 col-4">
                                    {brand.logo ? (
                                        <img
                                            src={brand.logo}
                                            alt={brand.name}
                                            style={{ maxHeight: '42px', filter: 'grayscale(100%)', opacity: 0.7 }}
                                            className="img-fluid"
                                        />
                                    ) : (
                                        <span className="fw-bold text-uppercase text-muted font-size-13">{brand.name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </StorefrontLayout>
    );
}
