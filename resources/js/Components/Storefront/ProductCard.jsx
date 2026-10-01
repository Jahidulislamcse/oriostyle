import React from 'react';
import { Link } from '@inertiajs/react';

export default function ProductCard({ product, onQuickView }) {
    if (!product) return null;

    const basePrice = parseFloat(product.base_price || 0);
    const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
    const hasDiscount = salePrice !== null && salePrice < basePrice;
    const discountPercent = hasDiscount ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;
    const effectivePrice = hasDiscount ? salePrice : basePrice;

    // Get primary image & hover image
    const primaryImgObj = product.primary_image || (product.images && product.images.length > 0 ? product.images[0] : null);
    const hoverImgObj = product.images && product.images.length > 1 ? product.images[1] : primaryImgObj;

    const imageUrl = primaryImgObj?.image_path 
        ? (primaryImgObj.image_path.startsWith('http') ? primaryImgObj.image_path : `/storage/${primaryImgObj.image_path}`)
        : '/assets/img/product/17.jpg';

    const hoverUrl = hoverImgObj?.image_path 
        ? (hoverImgObj.image_path.startsWith('http') ? hoverImgObj.image_path : `/storage/${hoverImgObj.image_path}`)
        : imageUrl;

    const isOutOfStock = (product.stock_quantity ?? 0) <= 0;

    return (
        <div className="mn-product-box pro-gl-content">
            <div className="mn-product-card bg-white border rounded-3 p-3 h-100 d-flex flex-column justify-content-between position-relative shadow-sm hover-shadow transition">
                {/* Product Image & Badges */}
                <div className="mn-product-img position-relative overflow-hidden rounded-2 mb-3 bg-light d-flex align-items-center justify-content-center" style={{ aspectRatio: '1/1' }}>
                    <div className="lbl position-absolute top-0 start-0 m-2 z-2">
                        {isOutOfStock ? (
                            <span className="badge bg-danger">Out of Stock</span>
                        ) : hasDiscount ? (
                            <span className="badge bg-warning text-dark font-bold">-{discountPercent}% OFF</span>
                        ) : product.is_new_arrival ? (
                            <span className="badge bg-success">NEW</span>
                        ) : null}
                    </div>

                    <div className="mn-img w-100 h-100 d-flex align-items-center justify-content-center">
                        <Link href={`/product/${product.slug}`} className="image d-block w-100 h-100">
                            <img className="main-img w-100 h-100 object-fit-contain" src={imageUrl} alt={product.name} />
                        </Link>

                        {/* Antu Hover Action Buttons Overlay */}
                        <div className="mn-options position-absolute bottom-0 start-50 translate-middle-x mb-3 z-2">
                            <ul className="list-unstyled d-flex gap-2 mb-0 bg-dark bg-opacity-75 p-1.5 rounded-pill shadow">
                                {onQuickView && (
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => onQuickView(product)}
                                            className="btn btn-sm btn-warning rounded-circle p-2 d-flex align-items-center justify-content-center text-dark"
                                            title="Quick View"
                                        >
                                            <i className="ri-eye-line fs-5"></i>
                                        </button>
                                    </li>
                                )}
                                <li>
                                    <Link
                                        href={`/product/${product.slug}`}
                                        className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-dark"
                                        title="View Details"
                                    >
                                        <i className="ri-arrow-right-line fs-5"></i>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="mn-product-detail">
                    <div className="cat d-flex justify-content-between text-xs text-muted mb-1 font-semibold">
                        <span className="text-warning font-bold truncate">{product.category?.name || 'Uncategorized'}</span>
                        {product.brand?.name && <span className="truncate max-w-50">{product.brand.name}</span>}
                    </div>

                    <h5 className="fs-6 fw-bold mb-2 line-clamp-2">
                        <Link href={`/product/${product.slug}`} className="text-dark text-decoration-none hover-warning">
                            {product.name}
                        </Link>
                    </h5>

                    {/* Pricing */}
                    <div className="mn-price d-flex align-items-baseline gap-2 pt-2 border-top">
                        <div className="mn-price-new fw-extrabold fs-5 text-dark">
                            ${effectivePrice.toFixed(2)}
                        </div>
                        {hasDiscount && (
                            <div className="mn-price-old text-muted text-decoration-line-through text-xs">
                                ${basePrice.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
