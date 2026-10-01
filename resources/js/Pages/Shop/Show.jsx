import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import ProductCard from '@/Components/Storefront/ProductCard';
import QuickViewModal from '@/Components/Storefront/QuickViewModal';

export default function Show({ product, relatedProducts = [] }) {
    const { settings, appName } = usePage().props;
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';

    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

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

    return (
        <StoreLayout>
            <Head title={`${product.name} - ${siteName}`} />

            <div className="container-fluid px-3 py-3">
                <div className="mn-breadcrumb mb-3">
                    <ul className="mn-breadcrumb-list list-inline mb-0 text-xs text-muted">
                        <li className="list-inline-item"><Link href="/" className="text-dark">Home</Link></li>
                        <li className="list-inline-item">/</li>
                        <li className="list-inline-item"><Link href="/shop" className="text-dark">Shop</Link></li>
                        <li className="list-inline-item">/</li>
                        <li className="list-inline-item active">{product.name}</li>
                    </ul>
                </div>

                <div className="row g-4 mb-4">
                    {/* Main Image */}
                    <div className="col-md-5">
                        <div className="bg-white rounded border p-3 mb-2" style={{ aspectRatio: '1/1' }}>
                            <img src={mainImageUrl} alt={product.name} className="w-100 h-100 object-fit-contain" />
                        </div>
                        {allImages.length > 1 && (
                            <div className="d-flex gap-2 overflow-auto">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={img.id || idx}
                                        onClick={() => setSelectedImgIndex(idx)}
                                        className={`rounded border p-1 ${selectedImgIndex === idx ? 'border-primary' : ''}`}
                                        style={{ width: '60px', height: '60px' }}
                                    >
                                        <img src={img.image_path?.startsWith('http') ? img.image_path : `/storage/${img.image_path}`} alt="" className="w-100 h-100 object-fit-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Column */}
                    <div className="col-md-7">
                        <div className="bg-white p-4 rounded border h-100">
                            <span className="text-uppercase text-primary font-bold text-xs">{product.category?.name}</span>
                            <h2 className="fs-3 fw-bold text-dark mt-1 mb-2">{product.name}</h2>
                            <p className="text-muted text-xs font-mono mb-3">SKU: {product.sku || 'N/A'}</p>

                            <div className="d-flex align-items-baseline gap-3 bg-light p-3 rounded mb-3">
                                <span className="fs-2 fw-extrabold text-dark">${effectivePrice.toFixed(2)}</span>
                                {hasDiscount && (
                                    <span className="text-muted text-decoration-line-through fs-5">${currentBasePrice.toFixed(2)}</span>
                                )}
                            </div>

                            <div className="mb-3">
                                {isOutOfStock ? (
                                    <span className="badge bg-danger">Out of Stock</span>
                                ) : (
                                    <span className="badge bg-success">In Stock ({currentStock} available)</span>
                                )}
                            </div>

                            {product.short_description && (
                                <p className="text-xs text-muted mb-4">{product.short_description}</p>
                            )}

                            {product.variants && product.variants.length > 0 && (
                                <div className="border-top pt-3 mb-3">
                                    <h6 className="fw-bold text-xs text-uppercase mb-2">Variants</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {product.variants.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                                                className={`btn btn-sm ${selectedVariant?.id === v.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            >
                                                {v.sku} (${v.price})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {relatedProducts && relatedProducts.length > 0 && (
                    <section className="pt-4 border-top">
                        <h4 className="fw-bold mb-3">Related Products</h4>
                        <div className="row g-3">
                            {relatedProducts.map((relProd) => (
                                <div key={relProd.id} className="col-lg-3 col-md-4 col-sm-6">
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

            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </StoreLayout>
    );
}
