import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Storefront/Navbar';
import Footer from '@/Components/Storefront/Footer';
import ProductCard from '@/Components/Storefront/ProductCard';
import QuickViewModal from '@/Components/Storefront/QuickViewModal';
import { Sparkles, SlidersHorizontal, ArrowRight, Grid, Award, Flame, ShoppingBag, ShieldCheck } from 'lucide-react';

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
        <div className="min-h-screen bg-[#071324] text-slate-100 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#071324] font-sans antialiased">
            <Head title={`${siteName} - Luxury Storefront & Catalog`}>
                {siteFavicon && <link rel="icon" href={siteFavicon} />}
            </Head>

            {/* Storefront Header Navigation */}
            <Navbar categoriesTree={categoriesTree} />

            <main className="flex-1">
                {/* Hero Showcase Banner */}
                <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#0B1D35] via-[#071324] to-[#071324] border-b border-[#D4AF37]/20">
                    {/* Glowing Ambient Background Elements */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Left Text Banner Content */}
                            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E2038] border border-[#D4AF37]/40 text-[#EBD495] text-xs font-semibold shadow-lg">
                                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>{settings?.storefront_tagline || 'Exclusive Single-Vendor Luxury Collection'}</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                                    Discover Pure <span className="bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#926F18] bg-clip-text text-transparent">Elegance & Style</span>
                                </h1>

                                <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                                    {settings?.storefront_description || 'Explore our dynamic multi-category collection featuring verified brands, authentic craft, and seamless digital shopping experience.'}
                                </p>

                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <Link
                                        href="/shop"
                                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#926F18] text-[#071324] font-extrabold text-sm hover:brightness-110 transition shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center gap-2"
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        <span>Explore Full Shop Catalog</span>
                                    </Link>

                                    <a
                                        href="#categories"
                                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0E2038] hover:bg-[#142C49] text-slate-200 border border-slate-700/80 text-sm font-semibold transition text-center"
                                    >
                                        View Taxonomies
                                    </a>
                                </div>
                            </div>

                            {/* Right Featured Banner Visual */}
                            <div className="lg:col-span-5 flex justify-center">
                                <div className="relative w-full max-w-md bg-gradient-to-br from-[#0E2038] to-[#08172C] rounded-3xl p-6 border border-[#D4AF37]/30 shadow-2xl space-y-4">
                                    <div className="flex items-center justify-between text-xs text-[#D4AF37] font-semibold tracking-wider">
                                        <span className="flex items-center gap-1">
                                            <ShieldCheck className="w-4 h-4" /> Verified Authenticity
                                        </span>
                                        <span className="bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                                            ORIO Engine v1.0
                                        </span>
                                    </div>

                                    {/* Dynamic Stats Row */}
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-[#071324] p-4 rounded-2xl border border-slate-800">
                                            <span className="text-2xl font-black text-white block">
                                                {categoriesTree.length}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                Top Categories
                                            </span>
                                        </div>
                                        <div className="bg-[#071324] p-4 rounded-2xl border border-slate-800">
                                            <span className="text-2xl font-black text-[#EBD495] block">
                                                {featuredBrands.length}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                Featured Brands
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories Taxonomy Showcase */}
                {categoriesTree.length > 0 && (
                    <section id="categories" className="py-16 max-w-7xl mx-auto px-4 sm:px-8 border-b border-slate-800/80">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                            <div>
                                <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase flex items-center gap-1.5">
                                    <Grid className="w-3.5 h-3.5" /> Structured Taxonomies
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                                    Explore Top Categories
                                </h2>
                            </div>
                            <Link
                                href="/shop"
                                className="text-xs font-semibold text-[#D4AF37] hover:text-[#EBD495] flex items-center gap-1 transition"
                            >
                                <span>Browse All Categories</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categoriesTree.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/shop?category=${cat.slug}`}
                                    className="group p-6 rounded-2xl bg-[#0E2038] border border-slate-800 hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-[#D4AF37]/10 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#071324] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#071324] transition-colors">
                                                <ShoppingBag className="w-6 h-6" />
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#071324] text-[#EBD495] border border-slate-800">
                                                {cat.products_count ?? 0} Products
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold text-white group-hover:text-[#EBD495] transition">
                                            {cat.name}
                                        </h3>
                                        
                                        {cat.description && (
                                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                                {cat.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Subcategories preview tags */}
                                    {cat.children && cat.children.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-1.5">
                                            {cat.children.slice(0, 3).map((sub) => (
                                                <span
                                                    key={sub.id}
                                                    className="px-2 py-0.5 rounded text-[10px] bg-[#071324] text-slate-300 font-medium"
                                                >
                                                    {sub.name}
                                                </span>
                                            ))}
                                            {cat.children.length > 3 && (
                                                <span className="text-[10px] text-slate-500 font-medium self-center">
                                                    +{cat.children.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Products Grid */}
                {featuredProducts.length > 0 && (
                    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8 border-b border-slate-800/80">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                            <div>
                                <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5" /> Handpicked Highlights
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                                    Featured Products
                                </h2>
                            </div>
                            <Link
                                href="/shop"
                                className="text-xs font-semibold text-[#D4AF37] hover:text-[#EBD495] flex items-center gap-1 transition"
                            >
                                <span>Shop All Featured</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onQuickView={(p) => setQuickViewProduct(p)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Brands Section */}
                {featuredBrands.length > 0 && (
                    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8 border-b border-slate-800/80">
                        <div className="text-center max-w-xl mx-auto mb-10">
                            <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">
                                Verified Partners
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                                Featured Brands Showcase
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            {featuredBrands.map((brand) => {
                                const logoUrl = brand.logo
                                    ? (brand.logo.startsWith('http') ? brand.logo : `/storage/${brand.logo}`)
                                    : null;
                                return (
                                    <Link
                                        key={brand.id}
                                        href={`/shop?brand=${brand.slug}`}
                                        className="group p-4 rounded-2xl bg-[#0E2038] border border-slate-800 hover:border-[#D4AF37]/50 transition flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg"
                                    >
                                        {logoUrl ? (
                                            <div className="w-16 h-12 flex items-center justify-center mb-2">
                                                <img
                                                    src={logoUrl}
                                                    alt={brand.name}
                                                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-[#071324] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-sm mb-2 group-hover:scale-105 transition">
                                                {brand.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-xs font-bold text-slate-200 group-hover:text-[#EBD495] transition">
                                            {brand.name}
                                        </span>
                                        {brand.products_count !== undefined && (
                                            <span className="text-[10px] text-slate-500 mt-0.5">
                                                {brand.products_count} Items
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* New Arrivals Section */}
                {newArrivals.length > 0 && (
                    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                            <div>
                                <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase flex items-center gap-1.5">
                                    <Flame className="w-3.5 h-3.5" /> Just In Store
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                                    New Arrivals
                                </h2>
                            </div>
                            <Link
                                href="/shop"
                                className="text-xs font-semibold text-[#D4AF37] hover:text-[#EBD495] flex items-center gap-1 transition"
                            >
                                <span>Explore All Arrivals</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {newArrivals.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onQuickView={(p) => setQuickViewProduct(p)}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />

            {/* Storefront Footer */}
            <Footer />
        </div>
    );
}
