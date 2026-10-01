import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import Modal from '@/Components/Common/Modal';

export default function QuickViewModal({ product, isOpen, onClose }) {
    if (!product) return null;

    const basePrice = parseFloat(product.base_price || 0);
    const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
    const hasDiscount = salePrice !== null && salePrice < basePrice;
    const effectivePrice = hasDiscount ? salePrice : basePrice;

    const allImages = product.images && product.images.length > 0
        ? product.images
        : (product.primary_image ? [product.primary_image] : []);

    const [selectedImgIndex, setSelectedImgIndex] = useState(0);

    const mainImageUrl = allImages.length > 0 && allImages[selectedImgIndex]?.image_path
        ? (allImages[selectedImgIndex].image_path.startsWith('http') ? allImages[selectedImgIndex].image_path : `/storage/${allImages[selectedImgIndex].image_path}`)
        : '/assets/img/product/17.jpg';

    const isOutOfStock = (product.stock_quantity ?? 0) <= 0;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="3xl">
            <div className="bg-white text-dark rounded-4 p-4 position-relative border shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3 z-3 shadow-sm"
                >
                    <i className="ri-close-line fs-5"></i>
                </button>

                <div className="row g-4 items-start">
                    {/* Image Column */}
                    <div className="col-md-6">
                        <div className="bg-light rounded-3 p-3 border d-flex align-items-center justify-content-center mb-3" style={{ aspectRatio: '1/1' }}>
                            <img src={mainImageUrl} alt={product.name} className="w-100 h-100 object-fit-contain" />
                        </div>

                        {allImages.length > 1 && (
                            <div className="d-flex gap-2 overflow-auto pb-1">
                                {allImages.map((img, idx) => {
                                    const thumbUrl = img.image_path?.startsWith('http')
                                        ? img.image_path
                                        : `/storage/${img.image_path}`;
                                    return (
                                        <button
                                            key={img.id || idx}
                                            onClick={() => setSelectedImgIndex(idx)}
                                            className={`rounded-2 border p-1 overflow-hidden shrink-0 ${
                                                selectedImgIndex === idx ? 'border-warning shadow-sm' : 'border-light opacity-75'
                                            }`}
                                            style={{ width: '54px', height: '54px' }}
                                        >
                                            <img src={thumbUrl} alt="" className="w-100 h-100 object-fit-cover" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Info Column */}
                    <div className="col-md-6 d-flex flex-column justify-content-between">
                        <div>
                            <div className="text-uppercase text-warning fw-bold text-xs mb-1">
                                {product.category?.name} {product.brand?.name && `• ${product.brand.name}`}
                            </div>

                            <h3 className="fw-extrabold fs-4 text-dark mb-1">{product.name}</h3>
                            <p className="text-muted font-mono text-xs mb-3">SKU: {product.sku || 'N/A'}</p>

                            <div className="d-flex align-items-baseline gap-3 mb-3">
                                <span className="fs-3 fw-extrabold text-dark">${effectivePrice.toFixed(2)}</span>
                                {hasDiscount && (
                                    <span className="text-muted text-decoration-line-through fs-6">${basePrice.toFixed(2)}</span>
                                )}
                                {hasDiscount && (
                                    <span className="badge bg-warning text-dark font-bold">SAVE ${(basePrice - salePrice).toFixed(2)}</span>
                                )}
                            </div>

                            <div className="mb-3">
                                {isOutOfStock ? (
                                    <span className="badge bg-danger">Out of Stock</span>
                                ) : (
                                    <span className="badge bg-success">In Stock ({product.stock_quantity} available)</span>
                                )}
                            </div>

                            {product.short_description && (
                                <p className="text-xs text-secondary bg-light p-3 rounded-3 border mb-4">
                                    {product.short_description}
                                </p>
                            )}
                        </div>

                        <div className="pt-3 border-top">
                            <Link
                                href={`/product/${product.slug}`}
                                className="btn btn-dark text-warning w-100 fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
                            >
                                <span>View Full Product Page & Options</span>
                                <i className="ri-arrow-right-line"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
