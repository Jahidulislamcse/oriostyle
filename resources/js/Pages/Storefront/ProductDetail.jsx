import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import ProductCard from '@/Components/Storefront/ProductCard';
import VariantSelector from '@/Components/Storefront/VariantSelector';
import FrequentlyBoughtTogether from '@/Components/Storefront/FrequentlyBoughtTogether';

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
    const [lightboxScale, setLightboxScale] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState(null);
    const [isHoverZooming, setIsHoverZooming] = useState(false);
    const [hoverPosition, setHoverPosition] = useState({ x: 50, y: 50 });

    // Variant selection state
    const variants = product.variants || [];
    const [selectedVariant, setSelectedVariant] = useState(
        variants.length > 0 ? (variants.find(v => v.stock_quantity > 0) || variants[0]) : null
    );

    // Quantity state
    const [quantity, setQuantity] = useState(1);
    const [addedNotice, setAddedNotice] = useState(false);

    // Wishlist & Stock Alert state
    const { wishlistProductIds = [], auth = {} } = usePage().props;
    const isInitiallyWishlisted = Array.isArray(wishlistProductIds) && wishlistProductIds.includes(product.id);
    const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
    const [notifyEmail, setNotifyEmail] = useState(auth?.user?.email || '');
    const [stockNotified, setStockNotified] = useState(false);
    const [isSubmittingStockNotify, setIsSubmittingStockNotify] = useState(false);

    useEffect(() => {
        setIsWishlisted(Array.isArray(wishlistProductIds) && wishlistProductIds.includes(product.id));
    }, [wishlistProductIds, product.id]);

    const handleToggleWishlist = () => {
        const next = !isWishlisted;
        setIsWishlisted(next);
        router.post('/wishlist/toggle', {
            product_id: product.id,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleStockNotificationSubmit = (e) => {
        e.preventDefault();
        if (!notifyEmail) return;
        setIsSubmittingStockNotify(true);
        router.post('/stock-notifications', {
            product_id: product.id,
            product_variant_id: selectedVariant?.id || null,
            email: notifyEmail,
        }, {
            preserveScroll: true,
            onSuccess: () => setStockNotified(true),
            onFinish: () => setIsSubmittingStockNotify(false),
        });
    };

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

    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const handleAddToCart = () => {
        if (isOutOfStock || isAddingToCart) return;

        setIsAddingToCart(true);

        // Safety timeout so the button state is always released
        const safetyTimer = setTimeout(() => {
            setIsAddingToCart(false);
        }, 3000);

        router.post(
            route('cart.items.store'),
            {
                product_id: product.id,
                product_variant_id: selectedVariant ? selectedVariant.id : null,
                quantity: quantity,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    clearTimeout(safetyTimer);
                    setIsAddingToCart(false);
                    setAddedNotice(true);
                    setTimeout(() => setAddedNotice(false), 3500);
                    window.dispatchEvent(new CustomEvent('open-cart'));
                },
                onError: () => {
                    clearTimeout(safetyTimer);
                    setIsAddingToCart(false);
                },
                onFinish: () => {
                    clearTimeout(safetyTimer);
                    setIsAddingToCart(false);
                },
            }
        );
    };

    // Showcase Desktop Hover Loupe Handlers
    const handleShowcaseMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setHoverPosition({
            x: Math.min(100, Math.max(0, x)),
            y: Math.min(100, Math.max(0, y)),
        });
    };

    const handleShowcaseMouseEnter = () => {
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
            setIsHoverZooming(true);
        }
    };

    const handleShowcaseMouseLeave = () => {
        setIsHoverZooming(false);
    };

    // Lightbox Gallery Navigation & Zoom Controls
    const handlePrevImage = () => {
        setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
        setLightboxScale(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const handleNextImage = () => {
        setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
        setLightboxScale(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const handleZoomIn = () => {
        setLightboxScale((prev) => Math.min(prev + 0.5, 3.5));
    };

    const handleZoomOut = () => {
        setLightboxScale((prev) => {
            const next = Math.max(prev - 0.5, 1);
            if (next === 1) setPanOffset({ x: 0, y: 0 });
            return next;
        });
    };

    const handleResetZoom = () => {
        setLightboxScale(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const handleToggleZoomAtPoint = () => {
        if (isDragging) return;
        if (lightboxScale === 1) {
            setLightboxScale(2.2);
        } else {
            setLightboxScale(1);
            setPanOffset({ x: 0, y: 0 });
        }
    };

    const handleLightboxMouseDown = (e) => {
        if (lightboxScale <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    const handleLightboxMouseMove = (e) => {
        if (!isDragging || lightboxScale <= 1) return;
        setPanOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleLightboxMouseUp = () => {
        setIsDragging(false);
    };

    const handleLightboxTouchStart = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            setTouchStart({ x: touch.clientX, y: touch.clientY });
            if (lightboxScale > 1) {
                setIsDragging(true);
                setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
            }
        }
    };

    const handleLightboxTouchMove = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            if (lightboxScale > 1 && isDragging) {
                setPanOffset({
                    x: touch.clientX - dragStart.x,
                    y: touch.clientY - dragStart.y,
                });
            }
        }
    };

    const handleLightboxTouchEnd = (e) => {
        if (lightboxScale <= 1 && touchStart) {
            const touch = e.changedTouches[0];
            const diffX = touch.clientX - touchStart.x;
            const diffY = touch.clientY - touchStart.y;
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    handlePrevImage();
                } else {
                    handleNextImage();
                }
            }
        }
        setIsDragging(false);
    };

    // Keyboard navigation & scroll locking for Lightbox Modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isZoomOpen) return;
            if (e.key === 'Escape') {
                setIsZoomOpen(false);
            } else if (e.key === 'ArrowLeft') {
                handlePrevImage();
            } else if (e.key === 'ArrowRight') {
                handleNextImage();
            } else if (e.key === '+' || e.key === '=') {
                handleZoomIn();
            } else if (e.key === '-') {
                handleZoomOut();
            } else if (e.key === '0') {
                handleResetZoom();
            }
        };

        if (isZoomOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isZoomOpen, activeImageIndex, lightboxScale]);

    const activeImageSrc = allImages[activeImageIndex] || allImages[0];

    return (
        <StorefrontLayout navCategories={navCategories} headerSolid={true}>
            <Head title={`${product.name} | ORIO STYLE`} />

            {/* --- Breadcrumb Bar --- */}
            <div className="oubd-breadcrumb-strip py-2 py-md-3 border-bottom" style={{ backgroundColor: '#fcfcfc' }}>
                <div className="container-fluid px-3 px-md-4" style={{ maxWidth: '1600px' }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0 font-size-11 font-size-md-12 text-uppercase tracking-wider flex-nowrap overflow-auto text-nowrap pb-1">
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
                            <li className="breadcrumb-item active text-dark fw-bold text-truncate" style={{ maxWidth: '280px' }} aria-current="page">
                                {product.name}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* --- Main Product Section --- */}
            <section className="py-3 py-md-5">
                <div className="container-fluid px-3 px-md-4" style={{ maxWidth: '1600px' }}>
                    <div className="row g-4 g-lg-5">
                        
                        {/* --- Left Column: Interactive High-Res Gallery --- */}
                        <div className="col-lg-6 col-12">
                            <div className="d-flex flex-column-reverse flex-md-row gap-3">
                                {/* Thumbnails Column */}
                                {allImages.length > 1 && (
                                    <div className="d-flex flex-row flex-md-column gap-2 overflow-auto pb-1" style={{ maxWidth: '100%', maxHeight: '550px' }}>
                                        {allImages.map((imgSrc, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveImageIndex(idx)}
                                                className={`btn p-0 border rounded overflow-hidden transition-all flex-shrink-0 ${
                                                    activeImageIndex === idx ? 'border-dark shadow-sm ring-2' : 'border-light opacity-75 hover-opacity-100'
                                                }`}
                                                style={{ width: '60px', height: '75px' }}
                                            >
                                                <img
                                                    src={imgSrc}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover', objectPosition: 'top center' }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Main Active Showcase Preview (Desktop Hover Loupe + Click to Lightbox) */}
                                <div
                                    className={`oubd-product-showcase-wrap flex-grow-1 border shadow-xs ${isHoverZooming ? 'is-zooming' : ''}`}
                                    onMouseMove={handleShowcaseMouseMove}
                                    onMouseEnter={handleShowcaseMouseEnter}
                                    onMouseLeave={handleShowcaseMouseLeave}
                                    onClick={() => {
                                        setIsZoomOpen(true);
                                        setLightboxScale(1);
                                        setPanOffset({ x: 0, y: 0 });
                                    }}
                                >
                                    {/* Badges Overlay */}
                                    <div className="position-absolute top-0 start-0 m-2 m-md-3 d-flex flex-column gap-1 pointer-events-none" style={{ zIndex: 10 }}>
                                        {hasDiscount && discountPercent && (
                                            <span className="badge bg-danger font-size-11 font-size-md-12 px-2 py-1 text-uppercase fw-bold shadow-xs">
                                                -{discountPercent}% OFF
                                            </span>
                                        )}
                                        {product.is_new_arrival && (
                                            <span className="badge bg-dark font-size-10 font-size-md-11 px-2 py-1 text-uppercase fw-semibold shadow-xs">
                                                New Edition
                                            </span>
                                        )}
                                    </div>

                                    {/* Zoom Hint Icon */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsZoomOpen(true);
                                            setLightboxScale(1);
                                            setPanOffset({ x: 0, y: 0 });
                                        }}
                                        className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-2 m-md-3 shadow-sm d-flex align-items-center justify-content-center"
                                        title="Click to expand"
                                        style={{ width: '36px', height: '36px', zIndex: 10 }}
                                    >
                                        <i className="ri-zoom-in-line font-size-16" />
                                    </button>

                                    {/* Image with Interactive Desktop Hover Loupe Zoom */}
                                    <div className="w-100 h-100 overflow-hidden position-relative">
                                        <img
                                            src={activeImageSrc}
                                            alt={product.name}
                                            className="w-100 h-100"
                                            style={{
                                                objectFit: 'cover',
                                                objectPosition: 'top center',
                                                transformOrigin: `${hoverPosition.x}% ${hoverPosition.y}%`,
                                                transform: isHoverZooming ? 'scale(2.2)' : 'scale(1)',
                                                transition: isHoverZooming ? 'transform 0.08s ease-out' : 'transform 0.25s ease-out',
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    </div>

                                    {/* Desktop Hover Hint Pill */}
                                    <div className="oubd-zoom-prompt d-none d-md-flex align-items-center gap-1.5 position-absolute bottom-0 start-50 translate-middle-x mb-3 px-3 py-1 rounded-pill bg-dark bg-opacity-75 text-white font-size-11 fw-semibold backdrop-blur-xs shadow-sm">
                                        <i className="ri-zoom-in-line text-warning font-size-13" />
                                        <span>Hover to zoom • Click to expand</span>
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
                                        disabled={isOutOfStock || isAddingToCart}
                                        className={`btn flex-grow-1 py-3 px-4 text-uppercase fw-bold font-size-13 tracking-wider d-flex align-items-center justify-content-center gap-2 shadow-sm ${
                                            isOutOfStock ? 'btn-secondary disabled' : 'btn-dark'
                                        }`}
                                        style={{ minWidth: '180px' }}
                                    >
                                        {isAddingToCart ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm text-warning" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <span>Adding to Cart...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-shopping-bag-3-line font-size-16" />
                                                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Add to Wishlist Button */}
                                    <button
                                        type="button"
                                        onClick={handleToggleWishlist}
                                        className={`btn py-3 px-3.5 d-flex align-items-center justify-content-center shadow-sm transition ${
                                            isWishlisted
                                                ? 'btn-danger text-white border-danger'
                                                : 'btn-outline-dark'
                                        }`}
                                        title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                                        aria-label="Wishlist"
                                        style={{ width: '48px', height: '48px' }}
                                    >
                                        <i className={isWishlisted ? "ri-heart-fill font-size-18" : "ri-heart-line font-size-18"} />
                                    </button>
                                </div>

                                {/* Out of Stock Back-In-Stock Alert Form */}
                                {isOutOfStock && (
                                    <div className="mb-4 p-3 bg-light rounded-2 border shadow-xs">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="font-size-12 fw-bold text-dark text-uppercase tracking-wider d-flex align-items-center gap-1.5">
                                                <i className="ri-notification-3-line text-warning font-size-15" />
                                                Notify Me When Back in Stock
                                            </span>
                                            <span className="badge bg-danger-subtle text-danger font-size-10 px-2 py-0.5">Sold Out</span>
                                        </div>
                                        {stockNotified ? (
                                            <div className="alert alert-success py-2 px-3 font-size-12 mb-0 d-flex align-items-center gap-2">
                                                <i className="ri-checkbox-circle-fill text-success font-size-15" />
                                                <span>You're on the priority notification list! We'll alert you the moment this item is restocked.</span>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleStockNotificationSubmit} className="d-flex gap-2">
                                                <input
                                                    type="email"
                                                    required
                                                    value={notifyEmail}
                                                    onChange={(e) => setNotifyEmail(e.target.value)}
                                                    placeholder="Enter your email address"
                                                    className="form-control form-control-sm font-size-12 bg-white"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isSubmittingStockNotify}
                                                    className="btn btn-sm btn-dark text-uppercase font-size-11 fw-bold px-3 text-nowrap"
                                                >
                                                    {isSubmittingStockNotify ? 'Saving...' : 'Alert Me'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* Confirmation Toast Feedback */}
                                {addedNotice && (
                                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 font-size-13 mb-4 shadow-xs" role="alert">
                                        <i className="ri-checkbox-circle-fill font-size-16" />
                                        <span>
                                            Added <strong>{quantity}x {product.name}</strong> to cart successfully!
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

                {/* Frequently Bought Together & Styled Outfit Bundles */}
                <div className="row mt-4">
                    <div className="col-12">
                        <FrequentlyBoughtTogether
                            mainProduct={product}
                            bundles={product.bundles || []}
                            currencySymbol={currencySymbol}
                        />
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

                        <div className="oubd-shop-product-grid">
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
                <div className="oubd-lightbox-modal">
                    {/* Top Header Bar */}
                    <div className="oubd-lightbox-header">
                        <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-white bg-opacity-15 text-white font-size-12 px-3 py-1.5 rounded-pill font-mono">
                                {activeImageIndex + 1} / {allImages.length}
                            </span>
                            <span className="text-white-50 font-size-13 d-none d-sm-inline text-truncate" style={{ maxWidth: '320px' }}>
                                {product.name}
                            </span>
                        </div>

                        {/* Zoom Actions & Close */}
                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                disabled={lightboxScale <= 1}
                                className="btn btn-outline-light btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                style={{ width: '38px', height: '38px', opacity: lightboxScale <= 1 ? 0.35 : 1 }}
                                title="Zoom Out (-)"
                            >
                                <i className="ri-zoom-out-line font-size-16" />
                            </button>

                            <span className="text-white font-mono font-size-12 px-1 text-center" style={{ minWidth: '42px' }}>
                                {Math.round(lightboxScale * 100)}%
                            </span>

                            <button
                                type="button"
                                onClick={handleZoomIn}
                                disabled={lightboxScale >= 3.5}
                                className="btn btn-outline-light btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                style={{ width: '38px', height: '38px', opacity: lightboxScale >= 3.5 ? 0.35 : 1 }}
                                title="Zoom In (+)"
                            >
                                <i className="ri-zoom-in-line font-size-16" />
                            </button>

                            {lightboxScale > 1 && (
                                <button
                                    type="button"
                                    onClick={handleResetZoom}
                                    className="btn btn-warning btn-sm rounded-pill font-size-11 fw-bold px-2.5 py-1 text-dark ms-1 d-none d-sm-inline-block"
                                    title="Reset Zoom (0)"
                                >
                                    Reset
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsZoomOpen(false)}
                                className="btn btn-light btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center ms-2"
                                title="Close (Esc)"
                                style={{ width: '38px', height: '38px' }}
                            >
                                <i className="ri-close-line font-size-20 text-dark" />
                            </button>
                        </div>
                    </div>

                    {/* Main Zoom Stage with Pan & Swipe */}
                    <div
                        className="oubd-lightbox-main"
                        onMouseDown={handleLightboxMouseDown}
                        onMouseMove={handleLightboxMouseMove}
                        onMouseUp={handleLightboxMouseUp}
                        onMouseLeave={handleLightboxMouseUp}
                        onTouchStart={handleLightboxTouchStart}
                        onTouchMove={handleLightboxTouchMove}
                        onTouchEnd={handleLightboxTouchEnd}
                        onClick={handleToggleZoomAtPoint}
                        style={{
                            cursor: lightboxScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                        }}
                    >
                        {/* Left Navigation Arrow */}
                        {allImages.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevImage();
                                }}
                                className="oubd-lightbox-nav-btn prev"
                                aria-label="Previous Image"
                            >
                                <i className="ri-arrow-left-s-line font-size-24" />
                            </button>
                        )}

                        {/* Active Showcase Image */}
                        <div
                            className="oubd-lightbox-img-wrapper"
                            style={{
                                transform: `scale(${lightboxScale}) translate(${panOffset.x / lightboxScale}px, ${panOffset.y / lightboxScale}px)`,
                                transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                        >
                            <img
                                src={activeImageSrc}
                                alt={product.name}
                                className="oubd-lightbox-img"
                                draggable={false}
                            />
                        </div>

                        {/* Right Navigation Arrow */}
                        {allImages.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextImage();
                                }}
                                className="oubd-lightbox-nav-btn next"
                                aria-label="Next Image"
                            >
                                <i className="ri-arrow-right-s-line font-size-24" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Gallery Thumbnail Strip */}
                    {allImages.length > 1 && (
                        <div className="oubd-lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
                            {allImages.map((imgSrc, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setActiveImageIndex(idx);
                                        setLightboxScale(1);
                                        setPanOffset({ x: 0, y: 0 });
                                    }}
                                    className={`oubd-lightbox-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                                    title={`View photo ${idx + 1}`}
                                >
                                    <img src={imgSrc} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- Mobile Sticky Quick Buy Bar --- */}
            <div className="oubd-mobile-sticky-buy d-lg-none">
                <div className="d-flex align-items-center justify-content-between gap-3">
                    <div className="min-width-0">
                        <div className="fw-bold text-dark font-size-15 font-mono text-truncate">
                            {currencySymbol}{Number(currentPrice).toLocaleString()}
                            {originalPrice && (
                                <span className="text-muted text-decoration-line-through font-size-11 ms-1.5 font-normal">
                                    {currencySymbol}{Number(originalPrice).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="font-size-10 text-muted text-truncate">
                            {selectedVariant ? selectedVariant.name : (variants.length > 0 ? 'Select Size / Variant' : 'In Stock')}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAddingToCart}
                        className={`btn py-2 px-3 text-uppercase fw-bold font-size-12 tracking-wider d-flex align-items-center justify-content-center gap-1.5 rounded-pill shadow-sm flex-shrink-0 ${
                            isOutOfStock ? 'btn-secondary disabled' : 'btn-dark'
                        }`}
                        style={{ minWidth: '135px' }}
                    >
                        {isAddingToCart ? (
                            <>
                                <span className="spinner-border spinner-border-sm text-warning" role="status" aria-hidden="true" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <i className="ri-shopping-bag-3-line font-size-14" />
                                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </StorefrontLayout>
    );
}
