import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
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
        <StoreLayout categoriesTree={categoriesTree}>
            <Head title={`${siteName} - Mantu Storefront`}>
                {siteFavicon && <link rel="icon" href={siteFavicon} />}
            </Head>

            <div className="container-fluid px-3 py-2">
                {/* Hero Swiper Banner Section (Exact Mantu Template Visual) */}
                <section className="mn-hero swiper-container m-b-15">
                    <div className="mn-hero-slider">
                        <div className="mn-hero-slide swiper-slide slide-1">
                            <div className="mn-hero-detail">
                                <p className="label"><span>44%<br />Off</span></p>
                                <h1>Fashion sale <br />for Children's</h1>
                                <p>Wear the change. Fashion that feels good.</p>
                                <Link href="/shop" className="mn-btn-2"><span>Shop Now</span></Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category Banner Showcase Row (4 Gray Cards with 3 Thumbnails Each) */}
                <section className="mn-category p-tb-15">
                    <div className="row g-3">
                        {/* Category Card 1 */}
                        <div className="col-lg-3 col-md-6">
                            <div className="mn-cat-card cat-card-1 h-100">
                                <p className="lbl"><span>35%</span></p>
                                <span className="bg">35%</span>
                                <h4>Fashion</h4>
                                <h3>Clothes</h3>
                                <p>Items ({categoriesTree?.[0]?.products_count || 16})</p>
                                <ul>
                                    <li><Link href="/shop?category=clothes"><img src="/assets/img/category/1.jpg" alt="category" /></Link></li>
                                    <li><Link href="/shop?category=clothes"><img src="/assets/img/category/2.jpg" alt="category" /></Link></li>
                                    <li><Link href="/shop?category=clothes"><img src="/assets/img/category/3.jpg" alt="category" /></Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Category Card 2 */}
                        <div className="col-lg-3 col-md-6">
                            <div className="mn-cat-card cat-card-2 h-100">
                                <p className="lbl"><span>22%</span></p>
                                <span className="bg">22%</span>
                                <h4>Generic</h4>
                                <h3>Cosmetics</h3>
                                <p>Items (45)</p>
                                <ul>
                                    <li><Link href="/shop?category=cosmetics"><img src="/assets/img/category/4.jpg" alt="category" /></Link></li>
                                    <li><Link href="/shop?category=cosmetics"><img src="/assets/img/category/5.jpg" alt="category" /></Link></li>
                                    <li><Link href="/shop?category=cosmetics"><img src="/assets/img/category/6.jpg" alt="category" /></Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Category Card 3 */}
                        <div className="col-lg-3 col-md-6">
                            <div className="mn-cat-card cat-card-3 h-100">
                                <p className="lbl"><span>65%</span></p>
                                <span className="bg">65%</span>
                                <h4>Stylish</h4>
                                <h3>Shoes</h3>
                                <p>Items (58)</p>
                                <ul>
                                    <li><Link href="/shop?category=shoes"><img src="/assets/img/category/7.jpg" alt="category" /></Link></li>
                                    <li><Link href="/shop?category=shoes"><img src="/assets/img/category/8.jpg" alt="category" /></Link></li>
                                    <li><Link href="/shop?category=shoes"><img src="/assets/img/category/9.jpg" alt="category" /></Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Category Card 4 */}
                        <div className="col-lg-3 col-md-6">
                            <div className="mn-cat-card cat-card-4 h-100">
                                <p className="lbl"><span>45%</span></p>
                                <span className="bg">45%</span>
                                <h4>Digital</h4>
                                <h3>Watches</h3>
                                <p>Items (64)</p>
                                <ul>
                                    <li><Link href="/shop?category=watches"><img src="/assets/img/category/10.jpg" alt="category" /></Link></li>
                                    <li><Link href="/shop?category=watches"><img src="/assets/img/category/11.jpg" alt="category" /></Link></li>
                                    <li><Link href="/shop?category=watches"><img src="/assets/img/category/12.jpg" alt="category" /></Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* New Arrivals Section */}
                <section className="mn-new-product p-tb-15">
                    <div className="mn-title d-flex justify-content-between align-items-center mb-3">
                        <h2>New <span>Arrivals</span></h2>
                        <Link href="/shop" className="text-dark font-bold text-xs">View All →</Link>
                    </div>

                    <div className="row g-3">
                        {newArrivals && newArrivals.length > 0 ? (
                            newArrivals.map((product) => (
                                <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
                                    <ProductCard
                                        product={product}
                                        onQuickView={(p) => setQuickViewProduct(p)}
                                    />
                                </div>
                            ))
                        ) : (
                            featuredProducts.map((product) => (
                                <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
                                    <ProductCard
                                        product={product}
                                        onQuickView={(p) => setQuickViewProduct(p)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Value Highlights Footer Bar */}
                <section className="p-tb-15 border-top mt-4">
                    <div className="row text-center g-3">
                        <div className="col-md-3">
                            <i className="ri-truck-line fs-2 text-primary"></i>
                            <h6 className="fw-bold mt-2 mb-0">Free Shipping</h6>
                            <p className="text-muted text-xs">On orders over $100</p>
                        </div>
                        <div className="col-md-3">
                            <i className="ri-shield-check-line fs-2 text-primary"></i>
                            <h6 className="fw-bold mt-2 mb-0">Genuine Quality</h6>
                            <p className="text-muted text-xs">100% verified authentic</p>
                        </div>
                        <div className="col-md-3">
                            <i className="ri-refresh-line fs-2 text-primary"></i>
                            <h6 className="fw-bold mt-2 mb-0">Easy Returns</h6>
                            <p className="text-muted text-xs">30-day money back</p>
                        </div>
                        <div className="col-md-3">
                            <i className="ri-secure-payment-line fs-2 text-primary"></i>
                            <h6 className="fw-bold mt-2 mb-0">Secure Payment</h6>
                            <p className="text-muted text-xs">Protected transactions</p>
                        </div>
                    </div>
                </section>
            </div>

            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </StoreLayout>
    );
}
