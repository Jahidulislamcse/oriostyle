import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import HeroSlider from '@/Components/Storefront/HeroSlider';
import CategoryLookbookSection from '@/Components/Storefront/CategoryLookbookSection';
import ProductCard from '@/Components/Storefront/ProductCard';
import SplitPromoBanners from '@/Components/Storefront/SplitPromoBanners';
import TrustFeaturesSection from '@/Components/Storefront/TrustFeaturesSection';
import FaqAndSupportSection from '@/Components/Storefront/FaqAndSupportSection';
import BrandStorySection from '@/Components/Storefront/BrandStorySection';
import { sanitizeImageUrl } from '@/Utils/image';

export default function Index({
    navCategories = [],
    featuredCategories = [],
    featuredProducts = [],
    newArrivals = [],
    brands = [],
    settings = {},
    heroBanners = [],
    splitBanners = [],
    promoBanners = [],
    bentoSlots = {},
    categoryShowcases = [],
}) {
    const siteName = settings.site_name || 'ORIO STYLE';
    const siteTagline = settings.site_tagline || 'Elevate Your Everyday Luxury & Contemporary Fashion';
    const currencySymbol = settings.currency_symbol || '৳';

    // Map dynamic categories to lookbook format
    const lookbookCategories = featuredCategories && featuredCategories.length > 0
        ? featuredCategories.map((cat, index) => {
            let rawImg = null;
            if (cat.images && cat.images.length > 0) {
                rawImg = cat.images[0].image_url || cat.images[0].image_path;
            } else if (cat.image_url) {
                rawImg = cat.image_url;
            } else if (cat.banner_url || cat.banner) {
                rawImg = cat.banner_url || cat.banner;
            }

            const dynamicImg = sanitizeImageUrl(rawImg, `/storefront/img/category/${(index % 10) + 1}.jpg`);

            return {
                id: cat.id,
                title: cat.name,
                slug: cat.slug || '',
                images: [dynamicImg],
                image_url: dynamicImg,
            };
        })
        : [];

    return (
        <StorefrontLayout navCategories={navCategories}>
            <Head title={`${siteName} - ${siteTagline}`} />

            {/* 1. Full-Width Hero Slider */}
            <HeroSlider banners={heroBanners} />

            {/* 2. High-Impact Collection Lookbook Grid (4/3-col desktop, 2-col mobile) */}
            <CategoryLookbookSection bentoSlots={bentoSlots} categories={lookbookCategories} />

            {/* 3. New Arrivals Product Grid Section (6-col desktop, 2-col mobile) */}
            {newArrivals && newArrivals.length > 0 && (
                <section id="new-arrivals" className="oubd-products-section">
                    <h2 className="oubd-collection-title">NEW ARRIVALS</h2>

                    <div className="oubd-product-grid">
                        {newArrivals.slice(0, 6).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                currencySymbol={currencySymbol}
                                isNew={true}
                            />
                        ))}
                    </div>

                    <div className="oubd-btn-container">
                        <Link href="/shop?sort=newest" className="oubd-outline-btn">
                            VIEW ALL NEW ARRIVAL
                        </Link>
                    </div>
                </section>
            )}

            {/* 4 & 5. Promotional Collection Showcases with Dynamic Category Banners */}
            {categoryShowcases && categoryShowcases.length > 0 && categoryShowcases.map((catItem, idx) => {
                const bannerSrc = catItem.banner_url || catItem.banner || null;
                const catProducts = (catItem.products && catItem.products.length > 0) ? catItem.products : [];

                if (catProducts.length === 0) return null;

                return (
                    <section key={catItem.id || idx} className="oubd-collection-section">
                        {bannerSrc && (
                            <div className="oubd-collection-banner-wrap">
                                <Link href={catItem.slug ? `/shop?category=${encodeURIComponent(catItem.slug)}` : '/shop'}>
                                    <img
                                        src={bannerSrc}
                                        alt={`${catItem.name || 'Category'} Collection Banner`}
                                        loading="lazy"
                                    />
                                </Link>
                            </div>
                        )}

                        <h2 className="oubd-collection-title">{(catItem.name || 'COLLECTION').toUpperCase()}</h2>

                        <div className="oubd-product-grid">
                            {catProducts.slice(0, 6).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    currencySymbol={currencySymbol}
                                    isNew={Boolean(product.is_new_arrival)}
                                />
                            ))}
                        </div>

                        <div className="oubd-btn-container">
                            <Link
                                href={catItem.slug ? `/shop?category=${encodeURIComponent(catItem.slug)}` : '/shop'}
                                className="oubd-outline-btn"
                            >
                                VIEW ALL {(catItem.name || 'COLLECTION').toUpperCase()}
                            </Link>
                        </div>
                    </section>
                );
            })}

            {/* 6. Dual Split Promotional Banners */}
            <SplitPromoBanners banners={splitBanners} />

            {/* 7. Trust & Feature Badges (Cash on Delivery, Flexible Payment, 07 Day Returns, Premium Support) */}
            <TrustFeaturesSection />

            {/* 8. Interactive FAQ & Customer Support / Refund Card */}
            <FaqAndSupportSection />

            {/* 9. Brand Story / Mission & Vision Section */}
            <BrandStorySection />
        </StorefrontLayout>
    );
}
