import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Storefront/Navbar';
import Footer from '@/Components/Storefront/Footer';
import ProductCard from '@/Components/Storefront/ProductCard';
import QuickViewModal from '@/Components/Storefront/QuickViewModal';

export default function Show({ product, relatedProducts = [] }) {
    const { settings, appName } = usePage().props;
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';

    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState('description');

    const allImages = product.images && product.images.length > 0
        ? product.images
        : (product.primary_image ? [product.primary_image] : []);

    const [selectedImgIndex, setSelectedImgIndex] = useState(0);

    const mainImageUrl = allImages.length > 0 && allImages[selectedImgIndex]?.image_path
        ? (allImages[selectedImgIndex].image_path.startsWith('http') ? allImages[selectedImgIndex].image_path : `/storage/${allImages[selectedImgIndex].image_path}`)
        : '/assets/img/product/17.jpg';

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

    return (
        <div className="min-h-screen bg-light text-dark font-sans selection:bg-warning selection:text-dark">
            <Head title={`${product.name} - ${siteName}`} />

            <Navbar />

            <main className="mn-main-content py-4">
                <div className="container-fluid max-w-7xl mx-auto px-3">
                    {/* Breadcrumbs */}
                    <nav aria-label="breadcrumb" className="mb-4">
                        <ol className="breadcrumb text-xs">
                            <li className="breadcrumb-item"><Link href="/" className="text-dark text-decoration-none">Home</Link></li>
                            <li className="breadcrumb-item"><Link href="/shop" className="text-dark text-decoration-none">Shop Catalog</Link></li>
                            {product.category && (
                                <li className="breadcrumb-item">
                                    <Link href={`/shop?category=${product.category.slug}`} className="text-dark text-decoration-none">
                                        {product.category.name}
                                    </Link>
                                </li>
                            )}
                            <li className="breadcrumb-item active text-truncate">{product.name}</li>
                        </ol>
                    </nav>

                    {/* Main PDP Grid */}
                    <div className="row g-4 mb-5">
                        {/* Image Column */}
                        <div className="col-md-5">
                            <div className="bg-white rounded-4 border p-4 shadow-sm mb-3 position-relative" style={{ aspectRatio: '1/1' }}>
                                <img src={mainImageUrl} alt={product.name} className="w-100 h-100 object-fit-contain" />
                                {hasDiscount && (
                                    <span className="position-absolute top-0 start-0 m-3 badge bg-warning text-dark font-bold fs-6">
                                        SAVE ${(currentBasePrice - currentSalePrice).toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {allImages.length > 1 && (
                                <div className="d-flex gap-2 overflow-auto pb-2">
                                    {allImages.map((img, idx) => {
                                        const thumbUrl = img.image_path?.startsWith('http')
                                            ? img.image_path
                                            : `/storage/${img.image_path}`;
                                        return (
                                            <button
                                                key={img.id || idx}
                                                onClick={() => setSelectedImgIndex(idx)}
                                                className={`rounded-3 border p-1 overflow-hidden shrink-0 ${
                                                    selectedImgIndex === idx ? 'border-warning shadow-sm' : 'border-light opacity-75'
                                                }`}
                                                style={{ width: '64px', height: '64px' }}
                                            >
                                                <img src={thumbUrl} alt="" className="w-100 h-100 object-fit-cover" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Info Column */}
                        <div className="col-md-7">
                            <div className="bg-white rounded-4 border p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex align-items-center justify-content-between text-xs text-uppercase font-bold text-warning mb-2">
                                        <span>{product.category?.name || 'Uncategorized'}</span>
                                        {product.brand?.name && <span className="text-muted">{product.brand.name}</span>}
                                    </div>

                                    <h1 className="fs-3 fw-extrabold text-dark mb-2">{product.name}</h1>
                                    <p className="text-muted font-mono text-xs mb-3">SKU: <strong>{currentSku || 'N/A'}</strong></p>

                                    {/* Pricing Box */}
                                    <div className="bg-light p-3 rounded-3 border d-flex align-items-baseline gap-3 mb-4">
                                        <span className="display-6 fw-black text-dark">${effectivePrice.toFixed(2)}</span>
                                        {hasDiscount && (
                                            <span className="text-muted text-decoration-line-through fs-5">${currentBasePrice.toFixed(2)}</span>
                                        )}
                                    </div>

                                    {/* Stock Badge */}
                                    <div className="mb-4">
                                        {isOutOfStock ? (
                                            <span className="badge bg-danger fs-6 px-3 py-1.5">Out of Stock</span>
                                        ) : (
                                            <span className="badge bg-success fs-6 px-3 py-1.5">In Stock ({currentStock} available)</span>
                                        )}
                                    </div>

                                    {/* Short Description */}
                                    {product.short_description && (
                                        <p className="text-sm text-secondary bg-light p-3 rounded-3 border mb-4">
                                            {product.short_description}
                                        </p>
                                    )}

                                    {/* Product Variants Matrix */}
                                    {product.variants && product.variants.length > 0 && (
                                        <div className="border-top pt-3 mb-4">
                                            <h6 className="fw-bold text-uppercase text-xs text-muted mb-2">Product Variants</h6>
                                            <div className="row g-2">
                                                {product.variants.map((v) => {
                                                    const isSelected = selectedVariant?.id === v.id;
                                                    const attrString = typeof v.attribute_values === 'object'
                                                        ? Object.entries(v.attribute_values || {}).map(([k, val]) => `${k}: ${val}`).join(' / ')
                                                        : (v.sku || `Variant #${v.id}`);

                                                    return (
                                                        <div key={v.id} className="col-6 col-sm-4">
                                                            <button
                                                                onClick={() => setSelectedVariant(isSelected ? null : v)}
                                                                className={`btn btn-sm w-100 text-start border p-2 rounded-3 ${
                                                                    isSelected ? 'btn-warning text-dark font-bold' : 'btn-outline-secondary'
                                                                }`}
                                                            >
                                                                <div className="text-xs truncate">{attrString}</div>
                                                                <div className="fw-bold text-dark text-xs">${parseFloat(v.price).toFixed(2)}</div>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Trust Value Badges */}
                                <div className="row g-2 text-center border-top pt-3 text-xs text-muted">
                                    <div className="col-4">
                                        <i className="ri-shield-check-line text-warning fs-5 d-block"></i>
                                        <span className="fw-bold text-dark">100% Authentic</span>
                                    </div>
                                    <div className="col-4">
                                        <i className="ri-truck-line text-warning fs-5 d-block"></i>
                                        <span className="fw-bold text-dark">Fast Dispatch</span>
                                    </div>
                                    <div className="col-4">
                                        <i className="ri-refresh-line text-warning fs-5 d-block"></i>
                                        <span className="fw-bold text-dark">Quality Checked</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Specifications & Overview Tabs */}
                    <div className="bg-white rounded-4 border p-4 shadow-sm mb-5">
                        <ul className="nav nav-tabs border-bottom mb-4">
                            <li className="nav-item">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`nav-link fw-bold text-xs uppercase ${activeTab === 'description' ? 'active text-dark border-warning' : 'text-muted'}`}
                                >
                                    Description & Overview
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    onClick={() => setActiveTab('specs')}
                                    className={`nav-link fw-bold text-xs uppercase ${activeTab === 'specs' ? 'active text-dark border-warning' : 'text-muted'}`}
                                >
                                    Specifications
                                </button>
                            </li>
                        </ul>

                        {activeTab === 'description' ? (
                            <div className="text-sm text-secondary leading-relaxed">
                                {product.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                ) : (
                                    <p className="text-muted italic">No detailed description provided.</p>
                                )}
                            </div>
                        ) : (
                            <div className="max-w-md text-xs space-y-2">
                                <div className="d-flex justify-content-between p-2 rounded bg-light border">
                                    <span className="text-muted font-bold">SKU</span>
                                    <span className="font-mono text-dark">{product.sku || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-between p-2 rounded bg-light border">
                                    <span className="text-muted font-bold">Category</span>
                                    <span className="text-dark font-bold">{product.category?.name}</span>
                                </div>
                                <div className="d-flex justify-content-between p-2 rounded bg-light border">
                                    <span className="text-muted font-bold">Brand</span>
                                    <span className="text-dark font-bold">{product.brand?.name || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-between p-2 rounded bg-light border">
                                    <span className="text-muted font-bold">Stock</span>
                                    <span className="text-success font-bold">{product.stock_quantity} Units</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <section className="pt-4 border-top">
                            <div className="d-flex justify-content-between align-items-end mb-4">
                                <div>
                                    <span className="text-warning text-uppercase fw-bold text-xs">Recommendations</span>
                                    <h3 className="fs-4 fw-bold text-dark mb-0">Related Products in {product.category?.name}</h3>
                                </div>
                            </div>

                            <div className="row g-4">
                                {relatedProducts.map((relProd) => (
                                    <div key={relProd.id} className="col-6 col-md-3">
                                        <ProductCard
                                            product={relProd}
                                            onQuickView={(p) => setQuickViewProduct(p)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
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
