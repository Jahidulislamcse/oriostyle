import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { X, ShoppingBag, CheckCircle, AlertCircle, ArrowRight, Tag } from 'lucide-react';
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
        : null;

    const isOutOfStock = (product.stock_quantity ?? 0) <= 0;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="3xl">
            <div className="bg-[#0E2038] text-slate-100 rounded-3xl border border-[#D4AF37]/30 p-6 relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-[#071324] text-slate-400 hover:text-white hover:bg-rose-500/20 transition z-20 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Image Preview & Thumbnail Selector */}
                    <div className="space-y-4">
                        <div className="relative aspect-square w-full rounded-2xl bg-[#071324] border border-slate-800 flex items-center justify-center p-4 overflow-hidden">
                            {mainImageUrl ? (
                                <img
                                    src={mainImageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-600">
                                    <ShoppingBag className="w-16 h-16 stroke-1" />
                                    <span className="text-xs mt-2">No Image</span>
                                </div>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {allImages.map((img, idx) => {
                                    const thumbUrl = img.image_path?.startsWith('http')
                                        ? img.image_path
                                        : `/storage/${img.image_path}`;
                                    return (
                                        <button
                                            key={img.id || idx}
                                            onClick={() => setSelectedImgIndex(idx)}
                                            className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition cursor-pointer ${
                                                selectedImgIndex === idx
                                                    ? 'border-[#D4AF37] scale-105'
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

                    {/* Product Specs & Info */}
                    <div className="space-y-5 flex flex-col justify-between h-full">
                        <div>
                            {/* Taxonomy Header */}
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
                                <span>{product.category?.name || 'Category'}</span>
                                {product.brand?.name && (
                                    <>
                                        <span>•</span>
                                        <span className="text-slate-400">{product.brand.name}</span>
                                    </>
                                )}
                            </div>

                            {/* Product Title */}
                            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                                {product.name}
                            </h2>

                            {/* SKU */}
                            <p className="text-xs text-slate-500 font-mono mt-1">
                                SKU: {product.sku || 'N/A'}
                            </p>

                            {/* Pricing */}
                            <div className="mt-4 flex items-baseline gap-3">
                                <span className="text-2xl font-extrabold text-[#EBD495]">
                                    ${effectivePrice.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-slate-400 line-through">
                                        ${basePrice.toFixed(2)}
                                    </span>
                                )}
                                {hasDiscount && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#EBD495] border border-[#D4AF37]/40">
                                        SAVE ${ (basePrice - salePrice).toFixed(2) }
                                    </span>
                                )}
                            </div>

                            {/* Stock Availability */}
                            <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                                {isOutOfStock ? (
                                    <span className="flex items-center gap-1.5 text-rose-400">
                                        <AlertCircle className="w-4 h-4" /> Out of Stock
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-emerald-400">
                                        <CheckCircle className="w-4 h-4" /> In Stock ({product.stock_quantity} available)
                                    </span>
                                )}
                            </div>

                            {/* Short Description */}
                            {product.short_description && (
                                <p className="mt-4 text-xs text-slate-300 leading-relaxed bg-[#071324]/50 p-3 rounded-xl border border-slate-800">
                                    {product.short_description}
                                </p>
                            )}
                        </div>

                        {/* CTA Link */}
                        <div className="pt-4 border-t border-slate-800">
                            <Link
                                href={`/product/${product.slug}`}
                                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#926F18] text-[#071324] font-extrabold text-sm hover:brightness-110 transition shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
                            >
                                <span>View Full Product Page & Options</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
