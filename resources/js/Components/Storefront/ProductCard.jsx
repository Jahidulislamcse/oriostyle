import React from 'react';
import { Link } from '@inertiajs/react';

export default function ProductCard({
    product,
    currencySymbol = 'Tk ',
    isNew = true,
}) {
    if (!product) return null;

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
                    {product.brand?.name || 'OUBD'}
                </span>

                {/* Badges */}
                {hasDiscount && discountPercent ? (
                    <span className="oubd-badge oubd-badge-discount">-{discountPercent}%</span>
                ) : isNew ? (
                    <span className="oubd-badge oubd-badge-new">New</span>
                ) : null}

                <Link href={`/?category=${product.category?.slug || ''}`}>
                    <img
                        src={primaryImg}
                        alt={product.name}
                        loading="lazy"
                    />
                </Link>
            </div>

            <div className="oubd-product-info">
                <h3 className="oubd-product-title">
                    <Link href={`/?category=${product.category?.slug || ''}`} className="text-dark text-decoration-none">
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
