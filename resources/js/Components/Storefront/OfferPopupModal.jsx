import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function OfferPopupModal({ offerPopup = null, currencySymbol = '৳' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(true);

    useEffect(() => {
        if (!offerPopup || !offerPopup.enabled || !offerPopup.product) {
            return;
        }

        // Check if dismissed previously (only if show_once frequency limit is enabled)
        if (offerPopup.show_once) {
            try {
                const dismissedUntil = localStorage.getItem('orio_offer_popup_dismissed_until');
                if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
                    return;
                }
            } catch (e) {
                // LocalStorage might be disabled in private mode
            }
        }

        const delay = Math.max(1, (offerPopup.delay_seconds || 3)) * 1000;
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [offerPopup]);

    if (!isOpen || !offerPopup || !offerPopup.product) {
        return null;
    }

    const { product } = offerPopup;

    const handleClose = () => {
        setIsOpen(false);
        if (offerPopup.show_once && dontShowAgain) {
            try {
                // Dismiss for 24 hours
                localStorage.setItem('orio_offer_popup_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
            } catch (e) {}
        }
    };

    const handleCopyCoupon = () => {
        if (!offerPopup.coupon_code) return;
        navigator.clipboard.writeText(offerPopup.coupon_code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }).catch(() => {});
    };

    const effectivePrice = product.sale_price !== null && product.sale_price > 0 && product.sale_price < product.base_price
        ? product.sale_price
        : product.base_price;

    const hasDiscount = product.sale_price && product.sale_price < product.base_price;
    const discountPct = product.discount_percentage || (hasDiscount ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100) : 0);

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{
                backgroundColor: 'rgba(7, 19, 36, 0.75)',
                backdropFilter: 'blur(4px)',
                zIndex: 100000,
                animation: 'orioFadeIn 0.3s ease-out forwards',
            }}
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-4 shadow-2xl overflow-hidden position-relative w-100 border border-warning-subtle"
                style={{
                    maxWidth: '680px',
                    animation: 'orioSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="position-absolute top-3 end-3 btn btn-sm rounded-circle d-flex align-items-center justify-content-center text-dark bg-light shadow-xs border-0"
                    style={{ width: '34px', height: '34px', zIndex: 10 }}
                    aria-label="Close offer popup"
                >
                    <i className="ri-close-line fs-5" />
                </button>

                <div className="row g-0 align-items-stretch">
                    {/* Left: Product Image Column */}
                    <div className="col-md-5 bg-light position-relative d-flex align-items-center justify-content-center overflow-hidden" style={{ minHeight: '260px' }}>
                        <img
                            src={product.image_url || '/storefront/img/category/1.jpg'}
                            alt={product.name}
                            className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
                            onError={(e) => {
                                e.currentTarget.src = '/storefront/img/banner/1.jpg';
                            }}
                        />

                        {/* Top Discount Badge */}
                        {hasDiscount && discountPct > 0 && (
                            <span
                                className="position-absolute top-3 start-3 badge bg-danger text-white px-2.5 py-1.5 fw-bold font-size-12 rounded-pill shadow-xs"
                                style={{ letterSpacing: '0.5px' }}
                            >
                                -{discountPct}% OFF
                            </span>
                        )}

                        {/* Subtle gradient vignette */}
                        <div
                            className="position-absolute bottom-0 start-0 w-100 p-3 text-white"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}
                        >
                            <span className="font-size-11 fw-bold text-uppercase tracking-wider text-warning d-block">
                                {product.category_name || 'ORIO Exclusive'}
                            </span>
                        </div>
                    </div>

                    {/* Right: Content & CTA Column */}
                    <div className="col-md-7 p-4 p-sm-5 d-flex flex-column justify-content-between">
                        <div>
                            {/* Flash Badge */}
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="badge bg-warning text-dark px-2.5 py-1 text-uppercase fw-bold font-size-10 rounded-pill">
                                    <i className="ri-flashlight-fill me-1" />
                                    {offerPopup.badge_text || 'SPECIAL DEAL'}
                                </span>
                                {product.brand_name && (
                                    <span className="text-muted font-size-12 fw-semibold">
                                        by {product.brand_name}
                                    </span>
                                )}
                            </div>

                            {/* Headline */}
                            <h3 className="fw-black text-dark text-uppercase fs-4 mb-1 tracking-tight leading-tight">
                                {offerPopup.title || 'EXCLUSIVE SPECIAL OFFER'}
                            </h3>

                            <p className="text-secondary font-size-13 mb-3 leading-snug">
                                {offerPopup.subtitle || 'Limited-time promotion on our handcrafted signature piece.'}
                            </p>

                            {/* Product Title Card */}
                            <div className="p-3 bg-light rounded-3 border border-slate-100 mb-3">
                                <h5 className="fw-bold text-dark font-size-14 mb-1 text-truncate">
                                    {product.name}
                                </h5>

                                <div className="d-flex align-items-baseline gap-2">
                                    <span className="fw-black fs-4 text-danger">
                                        {currencySymbol}{Number(effectivePrice).toLocaleString()}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-muted text-decoration-line-through font-size-13">
                                            {currencySymbol}{Number(product.base_price).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Coupon Code Section */}
                            {offerPopup.coupon_code && (
                                <div className="mb-3 d-flex align-items-center justify-content-between p-2.5 rounded-2 bg-warning-subtle border border-warning-subtle">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="ri-coupon-3-line text-warning fs-5" />
                                        <div>
                                            <span className="font-size-10 text-muted text-uppercase fw-bold d-block">Coupon Code</span>
                                            <span className="fw-black font-size-13 text-dark font-monospace tracking-wider">
                                                {offerPopup.coupon_code}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopyCoupon}
                                        className={`btn btn-sm font-size-11 fw-bold px-2.5 py-1 rounded-1 transition ${
                                            copied ? 'btn-success' : 'btn-dark'
                                        }`}
                                    >
                                        {copied ? (
                                            <>
                                                <i className="ri-check-line me-1" /> Copied!
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-file-copy-line me-1" /> Copy Code
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                            <Link
                                href={product.url || `/shop/${product.slug}`}
                                onClick={handleClose}
                                className="btn btn-dark w-100 py-2.5 fw-bold text-uppercase font-size-13 rounded-1 shadow-sm d-flex align-items-center justify-content-center gap-2 hover:bg-warning hover:text-dark transition"
                            >
                                <span>{offerPopup.button_text || 'Claim Offer Now'}</span>
                                <i className="ri-arrow-right-line" />
                            </Link>

                            <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                                <label className="form-check-label text-muted font-size-11 d-flex align-items-center gap-1.5 cursor-pointer user-select-none">
                                    <input
                                        type="checkbox"
                                        className="form-check-input mt-0"
                                        checked={dontShowAgain}
                                        onChange={(e) => setDontShowAgain(e.target.checked)}
                                    />
                                    <span>Don't show this again today</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="btn btn-link text-muted font-size-11 p-0 text-decoration-none hover:text-dark"
                                >
                                    No thanks, I'll pass
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes orioFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes orioSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
