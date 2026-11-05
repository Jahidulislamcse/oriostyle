import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

export default function ProductCard({
    product,
    currencySymbol = 'Tk ',
    isNew = true,
}) {
    if (!product) return null;

    const { wishlistProductIds = [] } = usePage().props;
    const isInitiallyWishlisted = Array.isArray(wishlistProductIds) && wishlistProductIds.includes(product.id);
    const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
    const [isAnimateHeart, setIsAnimateHeart] = useState(false);

    useEffect(() => {
        setIsWishlisted(Array.isArray(wishlistProductIds) && wishlistProductIds.includes(product.id));
    }, [wishlistProductIds, product.id]);

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const nextState = !isWishlisted;
        setIsWishlisted(nextState);
        setIsAnimateHeart(true);
        setTimeout(() => setIsAnimateHeart(false), 500);

        router.post('/wishlist/toggle', {
            product_id: product.id,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    let primaryImg = product.primary_image_url
        || product.primary_image?.image_url
        || product.images?.[0]?.image_url
        || product.primary_image?.image_path
        || product.images?.[0]?.image_path
        || product.image
        || '/storefront/img/product/1.jpg';

    if (primaryImg && typeof primaryImg === 'string') {
        if (!primaryImg.startsWith('http://') && !primaryImg.startsWith('https://') && !primaryImg.startsWith('/')) {
            primaryImg = `/storage/${primaryImg}`;
        }
    } else {
        primaryImg = '/storefront/img/product/1.jpg';
    }
    const priceNum = parseFloat(product.base_price || 0);
    const salePriceNum = product.sale_price ? parseFloat(product.sale_price) : null;
    
    // Determine active price vs comparison price
    const hasDiscount = salePriceNum !== null && salePriceNum < priceNum;
    const currentPrice = hasDiscount ? salePriceNum : priceNum;
    const originalPrice = hasDiscount ? priceNum : null;

    const discountPercent = hasDiscount && priceNum > 0
        ? Math.round(((priceNum - salePriceNum) / priceNum) * 100)
        : null;

    const formattedPrice = Number(currentPrice).toLocaleString();
    const formattedOriginal = originalPrice ? Number(originalPrice).toLocaleString() : null;

    return (
        <div className="oubd-product-card">
            <div className="oubd-product-img-wrap">
                {/* Brand Tag watermark */}
                <span className="oubd-product-brand-tag">
                    {product.brand?.name || 'ORIO STYLE'}
                </span>

                {/* 1-Click Wishlist Heart Button */}
                <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`oubd-card-wishlist-btn ${isWishlisted ? 'active' : ''} ${isAnimateHeart ? 'heart-bump' : ''}`}
                    title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                    aria-label="Wishlist"
                >
                    <i className={isWishlisted ? "ri-heart-fill text-danger" : "ri-heart-line text-dark"} />
                </button>

                {/* Badges */}
                {hasDiscount && discountPercent ? (
                    <span className="oubd-badge oubd-badge-discount">-{discountPercent}%</span>
                ) : isNew ? (
                    <span className="oubd-badge oubd-badge-new">New</span>
                ) : null}

                <Link href={product.slug ? `/products/${product.slug}` : '/shop'}>
                    <img
                        src={primaryImg}
                        alt={product.name}
                        loading="lazy"
                    />
                </Link>
            </div>

            <div className="oubd-product-info">
                <h3 className="oubd-product-title">
                    <Link href={product.slug ? `/products/${product.slug}` : '/shop'} className="text-dark text-decoration-none">
                        {product.name}
                    </Link>
                </h3>

                <div className="oubd-product-price">
                    {formattedOriginal && (
                        <span className="original-price">{currencySymbol}{formattedOriginal}</span>
                    )}
                    <span className={hasDiscount ? 'sale-price' : ''}>
                        {currencySymbol}{formattedPrice}
                    </span>
                </div>
            </div>
        </div>
    );
}
