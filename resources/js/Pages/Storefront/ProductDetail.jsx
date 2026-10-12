import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import ProductCard from '@/Components/Storefront/ProductCard';
import VariantSelector from '@/Components/Storefront/VariantSelector';

export default function ProductDetail({
    product,
    relatedProducts = [],
    navCategories = [],
    settings = {},
}) {
    if (!product) return null;

    const currencySymbol = settings.currency_symbol || '৳';

    // Gallery images preparation
    const allImages = [];
    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            const url = img.image_url || img.image_path;
            if (url) {
                allImages.push(url.startsWith('http') || url.startsWith('/') ? url : `/storage/${url}`);
            }
        });
    }
    if (allImages.length === 0 && product.image) {
        const u = product.image;
        allImages.push(u.startsWith('http') || u.startsWith('/') ? u : `/storage/${u}`);
    }
    if (allImages.length === 0) {
        allImages.push('/storefront/img/product/1.jpg');
    }

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [zoomScale, setZoomScale] = useState(1.5);

    // Variant selection state
    const variants = product.variants || [];
    const [selectedVariant, setSelectedVariant] = useState(
        variants.length > 0 ? (variants.find(v => v.stock_quantity > 0) || variants[0]) : null
    );

    // Quantity state
    const [quantity, setQuantity] = useState(1);
    const [addedNotice, setAddedNotice] = useState(false);

    // Price calculation
    const baseEffective = parseFloat(product.effective_price || product.base_price || 0);
    const baseOriginal = parseFloat(product.base_price || 0);
    const adjustment = selectedVariant ? parseFloat(selectedVariant.price_adjustment || 0) : 0;

    const currentPrice = baseEffective + adjustment;
    const originalPrice = product.sale_price && product.sale_price < baseOriginal
        ? baseOriginal + adjustment
        : null;

    const hasDiscount = originalPrice !== null && originalPrice > currentPrice;
    const discountPercent = hasDiscount && originalPrice > 0
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : null;

    // Stock availability calculation
    const currentStock = selectedVariant ? selectedVariant.stock_quantity : (product.stock_quantity || 0);
    const isOutOfStock = currentStock <= 0;
    const threshold = product.low_stock_threshold || 5;
    const isLowStock = !isOutOfStock && currentStock <= threshold;

    // Handle variant selection
    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        if (quantity > variant.stock_quantity && variant.stock_quantity > 0) {
            setQuantity(variant.stock_quantity);
        }
    };

    const handleQuantityChange = (delta) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && (newQty <= currentStock || isOutOfStock)) {
            setQuantity(newQty);
        }
    };

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        setAddedNotice(true);
        setTimeout(() => setAddedNotice(false), 3500);
    };

    // Close zoom on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsZoomOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const activeImageSrc = allImages[activeImageIndex] || allImages[0];

    return (
        <StorefrontLayout navCategories={navCategories} headerSolid={true}>
            <Head title={`${product.name} | ORIO STYLE`} />

            {/* --- Breadcrumb Bar --- */}
            <div className="oubd-breadcrumb-strip py-3 border-bottom" style={{ backgroundColor: '#fcfcfc' }}>
                <div className="container-fluid" style={{ maxWidth: '1600px', padding: '0 40px' }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0 font-size-12 text-uppercase tracking-wider">
                            <li className="breadcrumb-item">
                                <Link href="/" className="text-muted text-decoration-none hover-text-dark">Home</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href="/shop" className="text-muted text-decoration-none hover-text-dark">Shop</Link>
                            </li>
                            {product.category && (
                                <li className="breadcrumb-item">
                                    <Link href={`/shop?category=${product.category.slug}`} className="text-muted text-decoration-none hover-text-dark">
                                        {product.category.name}
                                    </Link>
                                </li>
                            )}
                            <li className="breadcrumb-item active text-dark fw-bold text-truncate" style={{ maxWidth: '300px' }} aria-current="page">
                                {product.name}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* --- Main Product Section --- */}
            <section className="py-5">
                <div className="container-fluid" style={{ maxWidth: '1600px', padding: '0 40px' }}>
                    <div className="row g-5">
                        
                        {/* --- Left Column: Interactive High-Res Gallery --- */}
                        <div className="col-lg-6 col-12">
                            <div className="d-flex flex-column-reverse flex-md-row gap-3">
                                {/* Thumbnails Column */}
                                {allImages.length > 1 && (
                                    <div className="d-flex flex-row flex-md-column gap-2 overflow-auto" style={{ maxWidth: '100%', maxHeight: '550px' }}>
                                        {allImages.map((imgSrc, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveImageIndex(idx)}
                                                className={`btn p-0 border rounded overflow-hidden transition-all flex-shrink-0 ${
                                                    activeImageIndex === idx ? 'border-dark shadow-sm ring-2' : 'border-light opacity-75 hover-opacity-100'
                                                }`}
                                                style={{ width: '75px', height: '90px' }}
                                            >
                                                <img
                                                    src={imgSrc}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Main Active Showcase Preview */}
                                <div className="position-relative flex-grow-1 border rounded overflow-hidden bg-light" style={{ minHeight: '480px', maxHeight: '640px' }}>
                                    {/* Badges Overlay */}
                                    <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1" style={{ zIndex: 10 }}>
                                        {hasDiscount && discountPercent && (
                                            <span className="badge bg-danger font-size-12 px-2 py-1 text-uppercase fw-bold shadow-xs">
                                                -{discountPercent}% OFF
                                            </span>
                                        )}
                                        {product.is_new_arrival && (
                                            <span className="badge bg-dark font-size-11 px-2 py-1 text-uppercase fw-semibold shadow-xs">
                                                New Edition
                                            </span>
                                        )}
                                    </div>

                                    {/* Zoom Hint Icon */}
                                    <button
                                        type="button"
                                        onClick={() => setIsZoomOpen(true)}
                                        className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center"
                                        title="Click to Zoom"
                                        style={{ width: '38px', height: '38px', zIndex: 10 }}
                                    >
                                        <i className="ri-zoom-in-line font-size-16" />
                                    </button>

                                    {/* Image with Click to Zoom */}
                                    <div
                                        className="w-100 h-100 d-flex align-items-center justify-content-center cursor-pointer"
                                        onClick={() => setIsZoomOpen(true)}
                                    >
                                        <img
                                            src={activeImageSrc}
                                            alt={product.name}
                                            className="w-100 h-100 transition-all"
                                            style={{ objectFit: 'cover', maxHeight: '640px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Right Column: Details & Dynamic Variant Selector --- */}
                        <div className="col-lg-6 col-12">
                            <div className="product-summary ps-lg-4">
                                {/* Brand Name Watermark */}
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="font-size-12 fw-bold text-uppercase tracking-wider text-muted">
                                        {product.brand?.name || 'ORIO STYLE SIGNATURE'}
                                    </span>
                                    {product.category && (
                                        <span className="font-size-12 text-muted">
                                            • <Link href={`/shop?category=${product.category.slug}`} className="text-muted text-decoration-none">{product.category.name}</Link>
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="fw-bold text-uppercase text-dark mb-3" style={{ fontSize: '28px', letterSpacing: '0.8px', lineHeight: 1.25 }}>
                                    {product.name}
                                </h1>

                                {/* Dynamic Price Display */}
                                <div className="d-flex align-items-baseline gap-3 mb-3">
                                    <span className="fw-bold text-dark font-size-28" style={{ fontSize: '28px' }}>
                                        {currencySymbol}{Number(currentPrice).toLocaleString()}
                                    </span>
                                    {originalPrice && (
                                        <span className="text-muted text-decoration-line-through font-size-18">
                                            {currencySymbol}{Number(originalPrice).toLocaleString()}
                                        </span>
                                    )}
                                    {hasDiscount && (
                                        <span className="badge bg-warning text-dark font-size-12 fw-bold px-2 py-1">
                                            Save {currencySymbol}{Number(originalPrice - currentPrice).toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Live SKU & Stock Availability Alert */}
                                <div className="d-flex align-items-center gap-3 py-2 border-top border-bottom mb-4">
                                    <div className="font-size-12 text-muted">
                                        SKU: <strong className="text-dark font-mono">{selectedVariant ? selectedVariant.sku : product.sku}</strong>
                                    </div>
                                    <div className="vr my-1" />
                                    <div className="d-flex align-items-center gap-2 font-size-12">
                                        {isOutOfStock ? (
                                            <span className="badge bg-danger text-white px-2 py-1">
                                                <i className="ri-close-circle-line me-1" /> Out of Stock
                                            </span>
                                        ) : isLowStock ? (
                                            <span className="badge bg-warning text-dark px-2 py-1 d-inline-flex align-items-center gap-1 animate-pulse">
                                                <i className="ri-fire-fill text-danger" /> Only {currentStock} Left in Stock!
                                            </span>
                                        ) : (
                                            <span className="badge bg-success-subtle text-success px-2 py-1 border border-success-subtle">
                                                <i className="ri-checkbox-circle-line me-1" /> In Stock ({currentStock} available)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Short Description */}
                                {product.short_description && (
                                    <p className="font-size-14 text-secondary line-height-24 mb-4">
                                        {product.short_description}
                                    </p>
                                )}

                                {/* --- Interactive Variant Selector --- */}
                                <VariantSelector
                                    variants={variants}
                                    selectedVariant={selectedVariant}
                                    onVariantSelect={handleVariantChange}
                                    currencySymbol={currencySymbol}
                                />

                                {/* --- Quantity Selector & Action Buttons --- */}
                                <div className="d-flex flex-wrap align-items-center gap-3 my-4">
                                    {/* Quantity Stepper */}
                                    <div className="d-inline-flex align-items-center border rounded bg-light p-1">
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1 || isOutOfStock}
                                            className="btn btn-sm btn-link text-dark p-2 text-decoration-none"
                                            style={{ width: '36px', height: '36px' }}
                                        >
                                            <i className="ri-subtract-line font-size-14" />
                                        </button>
                                        <span className="px-3 fw-bold font-size-15 font-mono text-center" style={{ minWidth: '40px' }}>
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= currentStock || isOutOfStock}
                                            className="btn btn-sm btn-link text-dark p-2 text-decoration-none"
                                            style={{ width: '36px', height: '36px' }}
                                        >
                                            <i className="ri-add-line font-size-14" />
                                        </button>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock}
                                        className={`btn flex-grow-1 py-3 px-4 text-uppercase fw-bold font-size-13 tracking-wider d-flex align-items-center justify-content-center gap-2 shadow-sm ${
                                            isOutOfStock ? 'btn-secondary disabled' : 'btn-dark'
                                        }`}
                                        style={{ minWidth: '200px' }}
                                    >
                                        <i className="ri-shopping-bag-3-line font-size-16" />
                                        {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                                    </button>
                                </div>

                                {/* Confirmation Toast Feedback */}
                                {addedNotice && (
                                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 font-size-13 mb-4 shadow-xs" role="alert">
                                        <i className="ri-checkbox-circle-fill font-size-16" />
                                        <span>
                                            Added <strong>{quantity}x {product.name}</strong> to bag successfully!
                                        </span>
                                    </div>
                                )}

                                {/* Trust Highlights Box */}
                                <div className="bg-light p-3 rounded mb-4 border">
                                    <div className="row g-2 font-size-12 text-secondary">
                                        <div className="col-sm-4 d-flex align-items-center gap-2">
                                            <i className="ri-shield-check-line text-warning font-size-16" />
                                            <span>100% Genuine</span>
                                        </div>
                                        <div className="col-sm-4 d-flex align-items-center gap-2">
                                            <i className="ri-truck-line text-warning font-size-16" />
                                            <span>Fast Delivery</span>
                                        </div>
                                        <div className="col-sm-4 d-flex align-items-center gap-2">
                                            <i className="ri-arrow-go-back-line text-warning font-size-16" />
                                            <span>07-Day Returns</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Specifications & Details Accordion */}
                                <div className="accordion border-top pt-3" id="productInfoAccordion">
                                    {/* Description */}
                                    {product.description && (
                                        <div className="border-bottom pb-3 mb-3">
                                            <h6 className="fw-bold font-size-13 text-uppercase text-dark tracking-wider mb-2">
                                                Description & Craftsmanship
                                            </h6>
                                            <div className="font-size-13 text-muted line-height-24" style={{ whiteSpace: 'pre-line' }}>
                                                {product.description}
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Terms */}
                                    <div>
                                        <h6 className="fw-bold font-size-13 text-uppercase text-dark tracking-wider mb-2">
                                            Shipping & Returns Policy
                                        </h6>
                                        <p className="font-size-13 text-muted line-height-22 mb-0">
                                            Enjoy prompt door-to-door delivery across Bangladesh within 24 to 72 hours. Cash on Delivery and seamless 7-day exchange available for unworn items in original packaging.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- Related Products Showcase Section --- */}
            {relatedProducts && relatedProducts.length > 0 && (
                <section className="py-5 border-top" style={{ backgroundColor: '#fcfcfc' }}>
                    <div className="container-fluid" style={{ maxWidth: '1600px', padding: '0 40px' }}>
                        <div className="text-center mb-5">
                            <span className="text-muted font-size-12 fw-bold text-uppercase tracking-wider">Curated Pairings</span>
                            <h2 className="fw-bold text-uppercase text-dark font-size-24 mt-1" style={{ letterSpacing: '1px' }}>
                                You May Also Like
                            </h2>
                        </div>

                        <div className="oubd-product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                            {relatedProducts.map((relProduct) => (
                                <ProductCard
                                    key={relProduct.id}
                                    product={relProduct}
                                    currencySymbol={currencySymbol}
                                    isNew={relProduct.is_new_arrival}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* --- Full-Screen Interactive Lightbox Gallery Modal --- */}
            {isZoomOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-95 d-flex align-items-center justify-content-center p-3"
                    style={{ zIndex: 2000 }}
                    onClick={() => setIsZoomOpen(false)}
                >
                    {/* Controls Toolbar */}
                    <div className="position-absolute top-0 end-0 m-4 d-flex align-items-center gap-2" style={{ zIndex: 2010 }} onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setZoomScale(prev => Math.min(prev + 0.3, 3))}
                            className="btn btn-outline-light btn-sm rounded-circle p-2"
                            title="Zoom In"
                            style={{ width: '40px', height: '40px' }}
                        >
                            <i className="ri-zoom-in-line font-size-16" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setZoomScale(prev => Math.max(prev - 0.3, 1))}
                            className="btn btn-outline-light btn-sm rounded-circle p-2"
                            title="Zoom Out"
                            style={{ width: '40px', height: '40px' }}
                        >
                            <i className="ri-zoom-out-line font-size-16" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsZoomOpen(false)}
                            className="btn btn-light btn-sm rounded-circle p-2 ms-2"
                            title="Close (Esc)"
                            style={{ width: '40px', height: '40px' }}
                        >
                            <i className="ri-close-line font-size-18 text-dark" />
                        </button>
                    </div>

                    {/* High-Res Image Container */}
                    <div
                        className="overflow-auto text-center"
                        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={activeImageSrc}
                            alt={product.name}
                            className="transition-all rounded shadow-lg"
                            style={{
                                transform: `scale(${zoomScale})`,
                                transformOrigin: 'center center',
                                maxWidth: '85vw',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                cursor: zoomScale > 1 ? 'grab' : 'zoom-in',
                            }}
                            onClick={() => setZoomScale(prev => prev > 1 ? 1 : 1.8)}
                        />
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
