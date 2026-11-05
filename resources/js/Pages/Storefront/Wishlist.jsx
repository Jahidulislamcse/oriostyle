import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function Wishlist({
    wishlistItems = [],
    navCategories = [],
}) {
    const { settings = {} } = usePage().props;
    const currencySymbol = settings.currency_symbol || '৳';
    const siteName = settings.site_name || 'ORIO STYLE';

    const [movingId, setMovingId] = useState(null);
    const [removingId, setRemovingId] = useState(null);
    const [copiedShare, setCopiedShare] = useState(false);

    // Add wishlisted item to cart
    const handleMoveToCart = (item) => {
        setMovingId(item.product_id);
        router.post('/cart/items', {
            product_id: item.product_id,
            quantity: 1,
        }, {
            preserveScroll: true,
            onFinish: () => setMovingId(null),
        });
    };

    // Remove item from wishlist
    const handleRemove = (productId) => {
        setRemovingId(productId);
        router.delete(`/wishlist/${productId}`, {
            preserveScroll: true,
            onFinish: () => setRemovingId(null),
        });
    };

    // Share wishlist link
    const handleCopyShareLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopiedShare(true);
            setTimeout(() => setCopiedShare(false), 3000);
        }
    };

    return (
        <StorefrontLayout navCategories={navCategories}>
            <Head title={`My Wishlist - ${siteName}`} />

            <div className="oubd-wishlist-page py-5">
                <div className="container" style={{ maxWidth: '1200px' }}>
                    {/* Header Breadcrumb & Title */}
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-4 mb-4 border-bottom gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 font-size-12 text-muted text-uppercase tracking-wider mb-2">
                                <Link href="/" className="text-muted text-decoration-none hover-dark">Home</Link>
                                <span>/</span>
                                <span className="text-dark fw-semibold">My Wishlist</span>
                            </div>
                            <h1 className="fw-bold fs-3 text-dark mb-1 text-uppercase tracking-wide d-flex align-items-center gap-2">
                                <i className="ri-heart-3-line text-danger" />
                                <span>My Curated Wishlist</span>
                                <span className="badge bg-dark rounded-pill font-size-12 px-2.5 py-1 fw-semibold">
                                    {wishlistItems.length}
                                </span>
                            </h1>
                            <p className="font-size-14 text-muted mb-0">
                                Save your favorite handcrafted garments and effortlessly transfer them to your shopping cart.
                            </p>
                        </div>

                        {wishlistItems.length > 0 && (
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopyShareLink}
                                    className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 px-3 py-2 text-uppercase font-size-11 fw-bold tracking-wider"
                                >
                                    <i className={copiedShare ? "ri-check-line text-success" : "ri-share-forward-line"} />
                                    <span>{copiedShare ? "Link Copied!" : "Share Wishlist"}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Empty State */}
                    {wishlistItems.length === 0 ? (
                        <div className="text-center py-5 my-4 bg-light rounded-3 p-5 shadow-xs">
                            <div className="w-20 h-20 rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow-xs" style={{ width: '80px', height: '80px' }}>
                                <i className="ri-heart-line display-5 text-muted opacity-50" />
                            </div>
                            <h3 className="fw-bold text-dark font-size-20 mb-2">Your Wishlist is Empty</h3>
                            <p className="font-size-14 text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                                Explore our bespoke collections, thobes, and artisan streetwear, and click the heart icon on any product to save it here.
                            </p>
                            <Link
                                href="/shop"
                                className="btn btn-dark px-4 py-2.5 text-uppercase fw-bold font-size-12 tracking-wider shadow-sm"
                            >
                                Explore Collections
                            </Link>
                        </div>
                    ) : (
                        /* Wishlist Items Grid */
                        <div className="row g-3 g-md-4">
                            {wishlistItems.map((item) => {
                                const isMoving = movingId === item.product_id;
                                const isRemoving = removingId === item.product_id;
                                const isOutOfStock = !item.is_in_stock;

                                return (
                                    <div key={item.id} className="col-6 col-md-4 col-lg-3">
                                        <div className={`oubd-product-card h-100 position-relative ${isRemoving ? 'opacity-50' : ''}`}>
                                            {/* Top corner remove button */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.product_id)}
                                                disabled={isRemoving}
                                                className="btn btn-sm btn-light rounded-circle shadow-xs position-absolute top-2 end-2 z-2 d-flex align-items-center justify-content-center"
                                                style={{ width: '30px', height: '30px', padding: 0 }}
                                                title="Remove from wishlist"
                                                aria-label="Remove"
                                            >
                                                <i className="ri-close-line font-size-16 text-muted" />
                                            </button>

                                            {/* Image Wrap */}
                                            <div className="oubd-product-img-wrap">
                                                <span className="oubd-product-brand-tag">{item.brand_name}</span>

                                                {item.is_on_sale && item.base_price > item.effective_price && (
                                                    <span className="oubd-badge oubd-badge-discount">
                                                        -{Math.round(((item.base_price - item.effective_price) / item.base_price) * 100)}%
                                                    </span>
                                                )}

                                                <Link href={item.slug ? `/products/${item.slug}` : '/shop'}>
                                                    <img
                                                        src={item.primary_image_url || '/storefront/img/product/1.jpg'}
                                                        alt={item.name}
                                                        loading="lazy"
                                                    />
                                                </Link>
                                            </div>

                                            {/* Info Wrap */}
                                            <div className="oubd-product-info d-flex flex-column justify-content-between p-3">
                                                <div>
                                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                                        <span className={`font-size-11 fw-semibold ${item.is_in_stock ? 'text-success' : 'text-danger'}`}>
                                                            {item.is_in_stock ? '• In Stock' : '• Sold Out'}
                                                        </span>
                                                    </div>

                                                    <h3 className="oubd-product-title mb-2">
                                                        <Link
                                                            href={item.slug ? `/products/${item.slug}` : '/shop'}
                                                            className="text-dark text-decoration-none hover-gold"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    </h3>

                                                    <div className="oubd-product-price mb-3">
                                                        {item.is_on_sale && (
                                                            <span className="original-price">
                                                                {currencySymbol}{Number(item.base_price).toLocaleString()}
                                                            </span>
                                                        )}
                                                        <span className={item.is_on_sale ? 'sale-price' : ''}>
                                                            {currencySymbol}{Number(item.effective_price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action: Move to Bag */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveToCart(item)}
                                                    disabled={isOutOfStock || isMoving}
                                                    className={`btn btn-sm w-100 py-2 text-uppercase fw-bold font-size-11 tracking-wider d-flex align-items-center justify-content-center gap-1.5 ${
                                                        isOutOfStock ? 'btn-secondary disabled' : 'btn-dark'
                                                    }`}
                                                >
                                                    {isMoving ? (
                                                        <>
                                                            <div className="spinner-border spinner-border-sm text-warning" role="status" />
                                                            <span>Moving...</span>
                                                        </>
                                                    ) : isOutOfStock ? (
                                                        <span>Sold Out</span>
                                                    ) : (
                                                        <>
                                                            <i className="ri-shopping-bag-3-line" />
                                                            <span>Add to Cart</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </StorefrontLayout>
    );
}
