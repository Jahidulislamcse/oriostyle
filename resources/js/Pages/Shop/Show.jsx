import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Storefront/Navbar';
import Footer from '@/Components/Storefront/Footer';
import ProductCard from '@/Components/Storefront/ProductCard';
import QuickViewModal from '@/Components/Storefront/QuickViewModal';
import { 
    ChevronRight, 
    ShoppingBag, 
    ShieldCheck, 
    Truck, 
    RefreshCw, 
    CheckCircle, 
    AlertCircle, 
    Tag, 
    Sparkles, 
    Layers, 
    Award,
    Info
} from 'lucide-react';

export default function Show({ product, relatedProducts = [] }) {
    const { settings, appName } = usePage().props;
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';

    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState('description');

    // Collect all image paths
    const allImages = product.images && product.images.length > 0
        ? product.images
        : (product.primary_image ? [product.primary_image] : []);

    const [selectedImgIndex, setSelectedImgIndex] = useState(0);

    const mainImageUrl = allImages.length > 0 && allImages[selectedImgIndex]?.image_path
        ? (allImages[selectedImgIndex].image_path.startsWith('http') ? allImages[selectedImgIndex].image_path : `/storage/${allImages[selectedImgIndex].image_path}`)
        : null;

    // Pricing calculation based on active selected variant or main product
    const currentBasePrice = selectedVariant
        ? parseFloat(selectedVariant.price || product.base_price)
        : parseFloat(product.base_price || 0);

    const currentSalePrice = (!selectedVariant && product.sale_price)
        ? parseFloat(product.sale_price)
        : null;

    const hasDiscount = currentSalePrice !== null && currentSalePrice < currentBasePrice;
    const effectivePrice = hasDiscount ? currentSalePrice : currentBasePrice;
    const currentStock = selectedVariant ? selectedVariant.stock_quantity : (product.stock_quantity ?? 0);
    const isOutOfStock = currentStock <= 0;
    const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

    // Brand logo
    const brandLogoUrl = product.brand?.logo
        ? (product.brand.logo.startsWith('http') ? product.brand.logo : `/storage/${product.brand.logo}`)
        : null;

    return (
        <div className="min-h-screen bg-[#071324] text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-[#D4AF37] selection:text-[#071324]">
            <Head title={`${product.name} - ${siteName}`} />

            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs text-slate-400 overflow-x-auto pb-1">
                    <Link href="/" className="hover:text-[#EBD495] transition shrink-0">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <Link href="/shop" className="hover:text-[#EBD495] transition shrink-0">Shop Catalog</Link>
                    {product.category && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#EBD495] transition shrink-0">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="text-[#EBD495] font-semibold truncate max-w-xs">{product.name}</span>
                </nav>

                {/* Main PDP Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left Column: Image Showcase & Gallery (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="relative aspect-square w-full rounded-3xl bg-[#0E2038] border border-[#D4AF37]/30 p-6 flex items-center justify-center overflow-hidden shadow-2xl">
                            {mainImageUrl ? (
                                <img
                                    src={mainImageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-600">
                                    <ShoppingBag className="w-20 h-20 stroke-1" />
                                    <span className="text-xs mt-2 font-medium">No Image Available</span>
                                </div>
                            )}

                            {/* Floating Discount Badge */}
                            {hasDiscount && (
                                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#071324] shadow-lg flex items-center gap-1">
                                    <Tag className="w-3.5 h-3.5" /> SAVE ${(currentBasePrice - currentSalePrice).toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Thumbnails list */}
                        {allImages.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                                {allImages.map((img, idx) => {
                                    const thumbUrl = img.image_path?.startsWith('http')
                                        ? img.image_path
                                        : `/storage/${img.image_path}`;
                                    return (
                                        <button
                                            key={img.id || idx}
                                            onClick={() => setSelectedImgIndex(idx)}
                                            className={`w-16 h-16 rounded-2xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                                                selectedImgIndex === idx
                                                    ? 'border-[#D4AF37] scale-105 shadow-lg shadow-[#D4AF37]/20'
                                                    : 'border-slate-800 opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Specifications, Variants & Details (7 Cols) */}
                    <div className="lg:col-span-7 space-y-6 bg-[#0E2038] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
                        <div>
                            {/* Taxonomy Header & Brand Logo */}
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                                    <span>{product.category?.name || 'Uncategorized'}</span>
                                    {product.brand?.name && (
                                        <>
                                            <span>•</span>
                                            <span className="text-slate-400">{product.brand.name}</span>
                                        </>
                                    )}
                                </div>

                                {brandLogoUrl && (
                                    <div className="h-8 max-w-[120px] flex items-center">
                                        <img src={brandLogoUrl} alt={product.brand?.name} className="max-h-full max-w-full object-contain" />
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                                {product.name}
                            </h1>

                            {/* SKU & Stock Badge */}
                            <div className="mt-3 flex items-center justify-between border-b border-slate-800 pb-4">
                                <span className="text-xs text-slate-400 font-mono">
                                    SKU: <strong className="text-slate-200">{currentSku || 'N/A'}</strong>
                                </span>

                                <div className="flex items-center gap-1.5 text-xs font-semibold">
                                    {isOutOfStock ? (
                                        <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                                            <CheckCircle className="w-3.5 h-3.5" /> In Stock ({currentStock} available)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="bg-[#071324] p-4 rounded-2xl border border-slate-800/90 flex items-baseline gap-4">
                            <span className="text-3xl font-black text-[#EBD495]">
                                ${effectivePrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                                <span className="text-base text-slate-400 line-through font-medium">
                                    ${currentBasePrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Short Description */}
                        {product.short_description && (
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                {product.short_description}
                            </p>
                        )}

                        {/* Product Variant Selector */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="border-t border-slate-800 pt-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5" /> Available Product Variants
                                    </label>
                                    {selectedVariant && (
                                        <button
                                            onClick={() => setSelectedVariant(null)}
                                            className="text-[11px] text-slate-400 hover:text-[#EBD495]"
                                        >
                                            Clear Selection
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {product.variants.map((v) => {
                                        const isSelected = selectedVariant?.id === v.id;
                                        const vStock = v.stock_quantity ?? 0;
                                        const attrString = typeof v.attribute_values === 'object'
                                            ? Object.entries(v.attribute_values || {}).map(([k, val]) => `${k}: ${val}`).join(' / ')
                                            : (v.sku || `Variant #${v.id}`);

                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(isSelected ? null : v)}
                                                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-lg'
                                                        : 'bg-[#071324] border-slate-800 text-slate-300 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="text-xs font-bold truncate">{attrString}</div>
                                                <div className="text-[11px] text-[#EBD495] font-semibold mt-1">
                                                    ${parseFloat(v.price).toFixed(2)}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {vStock > 0 ? `${vStock} in stock` : 'Out of stock'}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Value Highlights */}
                        <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-5 text-center">
                            <div className="p-3 rounded-xl bg-[#071324] border border-slate-800 space-y-1">
                                <ShieldCheck className="w-5 h-5 text-[#D4AF37] mx-auto" />
                                <span className="text-[11px] font-bold text-white block">100% Genuine</span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#071324] border border-slate-800 space-y-1">
                                <Truck className="w-5 h-5 text-[#D4AF37] mx-auto" />
                                <span className="text-[11px] font-bold text-white block">Safe Delivery</span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#071324] border border-slate-800 space-y-1">
                                <RefreshCw className="w-5 h-5 text-[#D4AF37] mx-auto" />
                                <span className="text-[11px] font-bold text-white block">Verified Stock</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section: Description & Specs */}
                <div className="bg-[#0E2038] rounded-3xl border border-slate-800 overflow-hidden">
                    <div className="flex border-b border-slate-800 bg-[#071324]/60">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                                activeTab === 'description'
                                    ? 'border-[#D4AF37] text-[#EBD495] bg-[#0E2038]'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Product Overview & Description
                        </button>
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                                activeTab === 'specs'
                                    ? 'border-[#D4AF37] text-[#EBD495] bg-[#0E2038]'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Technical Specifications
                        </button>
                    </div>

                    <div className="p-6 sm:p-8">
                        {activeTab === 'description' ? (
                            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
                                {product.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                ) : (
                                    <p className="text-slate-400 italic">No detailed description provided for this product.</p>
                                )}
                            </div>
                        ) : (
                            <div className="max-w-2xl space-y-3 text-xs">
                                <div className="grid grid-cols-2 p-3 rounded-xl bg-[#071324] border border-slate-800">
                                    <span className="text-slate-400 font-semibold">SKU Identifier</span>
                                    <span className="text-white font-mono">{product.sku || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-2 p-3 rounded-xl bg-[#071324] border border-slate-800">
                                    <span className="text-slate-400 font-semibold">Category Taxonomy</span>
                                    <span className="text-[#EBD495] font-bold">{product.category?.name || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-2 p-3 rounded-xl bg-[#071324] border border-slate-800">
                                    <span className="text-slate-400 font-semibold">Brand Partner</span>
                                    <span className="text-white font-bold">{product.brand?.name || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-2 p-3 rounded-xl bg-[#071324] border border-slate-800">
                                    <span className="text-slate-400 font-semibold">Stock Quantity Level</span>
                                    <span className="text-emerald-400 font-bold">{product.stock_quantity} Units</span>
                                </div>
                                <div className="grid grid-cols-2 p-3 rounded-xl bg-[#071324] border border-slate-800">
                                    <span className="text-slate-400 font-semibold">Featured Item</span>
                                    <span className="text-white">{product.is_featured ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products Showcase */}
                {relatedProducts.length > 0 && (
                    <section className="pt-6 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                                    Recommendations
                                </span>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                                    Related Products in {product.category?.name}
                                </h2>
                            </div>
                            <Link
                                href={`/shop?category=${product.category?.slug}`}
                                className="text-xs font-semibold text-[#D4AF37] hover:text-[#EBD495] transition"
                            >
                                View Category →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((relProd) => (
                                <ProductCard
                                    key={relProd.id}
                                    product={relProd}
                                    onQuickView={(p) => setQuickViewProduct(p)}
                                />
                            ))}
                        </div>
                    </section>
                )}
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
