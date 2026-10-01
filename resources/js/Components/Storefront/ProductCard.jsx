import React from 'react';
import { Link } from '@inertiajs/react';
import { Eye, ShoppingBag, Star, Tag } from 'lucide-react';

export default function ProductCard({ product, onQuickView }) {
    if (!product) return null;

    const basePrice = parseFloat(product.base_price || 0);
    const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
    const hasDiscount = salePrice !== null && salePrice < basePrice;
    const discountPercent = hasDiscount ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;
    const effectivePrice = hasDiscount ? salePrice : basePrice;

    // Get primary image or fallback image
    const primaryImgObj = product.primary_image || (product.images && product.images.length > 0 ? product.images[0] : null);
    const imageUrl = primaryImgObj?.image_path 
        ? (primaryImgObj.image_path.startsWith('http') ? primaryImgObj.image_path : `/storage/${primaryImgObj.image_path}`)
        : null;

    const isOutOfStock = (product.stock_quantity ?? 0) <= 0;

    return (
        <div className="group relative bg-[#0E2038] rounded-2xl border border-slate-800 hover:border-[#D4AF37]/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#D4AF37]/10 flex flex-col justify-between overflow-hidden">
            {/* Image & Quick Actions Container */}
            <div className="relative aspect-square w-full bg-[#071324] overflow-hidden flex items-center justify-center p-4">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-[#0B1A2E]/60">
                        <ShoppingBag className="w-12 h-12 stroke-1" />
                        <span className="text-[11px] mt-2 font-medium">No Image</span>
                    </div>
                )}

                {/* Status Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isOutOfStock ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/90 text-white shadow">
                            Out of Stock
                        </span>
                    ) : hasDiscount ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#071324] shadow flex items-center gap-1">
                            <Tag className="w-3 h-3" /> -{discountPercent}% OFF
                        </span>
                    ) : product.is_new_arrival ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow">
                            NEW
                        </span>
                    ) : null}
                </div>

                {/* Floating Action Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    {onQuickView && (
                        <button
                            type="button"
                            onClick={() => onQuickView(product)}
                            className="p-3 rounded-full bg-[#0E2038] text-[#EBD495] border border-[#D4AF37]/50 hover:bg-[#D4AF37] hover:text-[#071324] transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl cursor-pointer"
                            title="Quick View"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                    <Link
                        href={`/product/${product.slug}`}
                        className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#071324] font-bold text-xs hover:brightness-110 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl flex items-center gap-1.5"
                    >
                        <span>View Details</span>
                    </Link>
                </div>
            </div>

            {/* Product Details Section */}
            <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                    {/* Category & Brand taxonomy header */}
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#D4AF37] mb-1.5">
                        <span className="truncate">{product.category?.name || 'Uncategorized'}</span>
                        {product.brand?.name && (
                            <span className="text-slate-400 font-normal truncate max-w-[100px]">
                                {product.brand.name}
                            </span>
                        )}
                    </div>

                    {/* Product Name */}
                    <Link href={`/product/${product.slug}`} className="block group-hover:text-[#EBD495] transition">
                        <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* Pricing & Stock Status */}
                <div className="pt-2 border-t border-slate-800/80 flex items-end justify-between">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through font-medium">
                                ${basePrice.toFixed(2)}
                            </span>
                        )}
                        <span className="text-base sm:text-lg font-extrabold text-[#EBD495]">
                            ${effectivePrice.toFixed(2)}
                        </span>
                    </div>

                    <Link
                        href={`/product/${product.slug}`}
                        className="text-xs font-semibold text-[#D4AF37] hover:text-[#EBD495] underline underline-offset-4 transition"
                    >
                        Explore →
                    </Link>
                </div>
            </div>
        </div>
    );
}
