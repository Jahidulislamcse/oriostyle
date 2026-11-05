import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { sanitizeImageUrl } from '@/Utils/image';

export default function FrequentlyBoughtTogether({
    mainProduct,
    bundles = [],
    currencySymbol = '৳',
}) {
    if (!mainProduct || !bundles || bundles.length === 0) {
        return null;
    }

    // Take top 2 bundle pairings max
    const bundleItems = useMemo(() => {
        return bundles.slice(0, 2).map((b, idx) => {
            const product = b.paired_product || b.pairedProduct;
            return {
                bundleId: b.id || idx,
                product: product,
                discountPercentage: parseFloat(b.discount_percentage || 5.00),
                badgeLabel: b.badge_label || 'Curated Companion',
            };
        }).filter(b => b.product && b.product.id !== mainProduct.id);
    }, [bundles, mainProduct]);

    if (bundleItems.length === 0) {
        return null;
    }

    // Checked state for items (main product is always index 0, companion items are indices 1..N)
    const [selectedMap, setSelectedMap] = useState(() => {
        const initial = { main: true };
        bundleItems.forEach((b) => {
            initial[b.product.id] = true;
        });
        return initial;
    });

    // Selected variants state
    const [selectedVariants, setSelectedVariants] = useState(() => {
        const initial = {};
        // Companion products variants
        bundleItems.forEach((b) => {
            const vars = b.product.variants || [];
            const inStock = vars.find(v => v.stock_quantity > 0) || vars[0];
            if (inStock) initial[b.product.id] = inStock.id;
        });
        return initial;
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);

    const toggleItem = (key) => {
        // At least main item or one item must remain selectable
        setSelectedMap(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Calculation
    const mainPrice = parseFloat(mainProduct.effective_price || mainProduct.base_price || 0);

    const { totalOriginal, totalDiscounted, totalSavings, checkedCount } = useMemo(() => {
        let original = 0;
        let count = 0;

        if (selectedMap.main) {
            original += mainPrice;
            count++;
        }

        bundleItems.forEach((b) => {
            if (selectedMap[b.product.id]) {
                const itemPrice = parseFloat(b.product.effective_price || b.product.base_price || 0);
                original += itemPrice;
                count++;
            }
        });

        // Apply 5% bundle discount when at least 2 items are selected
        const discountRate = count >= 2 ? 0.05 : 0.0;
        const savings = original * discountRate;
        const discounted = original - savings;

        return {
            totalOriginal: original,
            totalDiscounted: discounted,
            totalSavings: savings,
            checkedCount: count,
        };
    }, [selectedMap, bundleItems, mainPrice]);

    // Handle 1-click bundle purchase
    const handleAddBundleToCart = () => {
        if (checkedCount === 0) return;

        setIsSubmitting(true);
        setFeedbackMessage(null);

        const itemsToAdd = [];

        if (selectedMap.main) {
            itemsToAdd.push({
                product_id: mainProduct.id,
                variant_id: null,
                quantity: 1,
            });
        }

        bundleItems.forEach((b) => {
            if (selectedMap[b.product.id]) {
                itemsToAdd.push({
                    product_id: b.product.id,
                    variant_id: selectedVariants[b.product.id] || null,
                    quantity: 1,
                });
            }
        });

        router.post('/bundles/add-to-cart', {
            items: itemsToAdd,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setFeedbackMessage('Entire styled look has been added to your cart!');
                setTimeout(() => setFeedbackMessage(null), 4000);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const getImage = (prod) => {
        const raw = prod?.primary_image_url
            || prod?.primary_image?.image_url
            || prod?.primary_image?.image_path
            || prod?.image
            || '/storefront/img/product/1.jpg';
        return sanitizeImageUrl(raw, '/storefront/img/product/1.jpg');
    };

    return (
        <section className="oubd-bundle-section my-5 p-4 p-md-5 rounded-3 bg-white border shadow-xs">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-3 mb-4 border-bottom gap-2">
                <div>
                    <span className="badge bg-gold-400 text-dark fw-bold font-size-10 text-uppercase tracking-wider px-2 py-1 mb-1">
                        AI Curated Look
                    </span>
                    <h3 className="fw-bold fs-4 text-dark mb-0 text-uppercase tracking-wide">
                        Frequently Bought Together
                    </h3>
                </div>
                <div className="text-muted font-size-13">
                    Buy together and save an extra <span className="text-success fw-bold">5% bundle discount</span>!
                </div>
            </div>

            {feedbackMessage && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 font-size-13 mb-4 shadow-xs" role="alert">
                    <i className="ri-checkbox-circle-fill font-size-16" />
                    <span>{feedbackMessage}</span>
                </div>
            )}

            <div className="row g-4 align-items-center">
                {/* Visual Image Flow with '+' operators */}
                <div className="col-12 col-lg-7">
                    <div className="d-flex align-items-center justify-content-center justify-content-lg-start flex-wrap gap-2 gap-md-3">
                        {/* Main Product Image Card */}
                        <div className={`oubd-bundle-card ${selectedMap.main ? 'active' : 'opacity-40'}`}>
                            <div className="oubd-bundle-img-wrap">
                                <img src={getImage(mainProduct)} alt={mainProduct.name} loading="lazy" />
                            </div>
                            <div className="font-size-11 fw-semibold text-center mt-1 text-truncate" style={{ maxWidth: '100px' }}>
                                This Item
                            </div>
                        </div>

                        {/* Plus operators and companions */}
                        {bundleItems.map((b) => (
                            <React.Fragment key={b.product.id}>
                                <div className="oubd-bundle-plus fs-5 text-muted fw-bold">
                                    +
                                </div>
                                <div className={`oubd-bundle-card ${selectedMap[b.product.id] ? 'active' : 'opacity-40'}`}>
                                    <div className="oubd-bundle-img-wrap">
                                        <img src={getImage(b.product)} alt={b.product.name} loading="lazy" />
                                    </div>
                                    <div className="font-size-11 fw-semibold text-center mt-1 text-truncate" style={{ maxWidth: '100px' }}>
                                        {b.product.name}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Interactive Item Checklist */}
                    <div className="mt-4 pt-3 border-top">
                        {/* Main item check */}
                        <div className="form-check d-flex align-items-center gap-2 mb-2 font-size-13">
                            <input
                                className="form-check-input mt-0 cursor-pointer"
                                type="checkbox"
                                id="bundle-main-check"
                                checked={!!selectedMap.main}
                                onChange={() => toggleItem('main')}
                            />
                            <label className="form-check-label cursor-pointer d-flex align-items-center flex-wrap gap-1" htmlFor="bundle-main-check">
                                <span className="fw-bold text-dark">This item:</span>
                                <span>{mainProduct.name}</span>
                                <span className="fw-bold text-dark">({currencySymbol}{Number(mainPrice).toLocaleString()})</span>
                            </label>
                        </div>

                        {/* Companion items check */}
                        {bundleItems.map((b) => {
                            const compPrice = parseFloat(b.product.effective_price || b.product.base_price || 0);
                            const variants = b.product.variants || [];

                            return (
                                <div key={b.product.id} className="form-check d-flex align-items-center gap-2 mb-2 font-size-13">
                                    <input
                                        className="form-check-input mt-0 cursor-pointer"
                                        type="checkbox"
                                        id={`bundle-check-${b.product.id}`}
                                        checked={!!selectedMap[b.product.id]}
                                        onChange={() => toggleItem(b.product.id)}
                                    />
                                    <label className="form-check-label cursor-pointer d-flex align-items-center flex-wrap gap-2" htmlFor={`bundle-check-${b.product.id}`}>
                                        <span className="fw-bold text-dark">{b.badgeLabel}:</span>
                                        <span>{b.product.name}</span>
                                        <span className="fw-bold text-dark">({currencySymbol}{Number(compPrice).toLocaleString()})</span>

                                        {/* Variant selection dropdown if available */}
                                        {variants.length > 0 && selectedMap[b.product.id] && (
                                            <select
                                                className="form-select form-select-sm py-0 px-2 font-size-11 d-inline-block w-auto border-secondary-subtle"
                                                value={selectedVariants[b.product.id] || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSelectedVariants(prev => ({ ...prev, [b.product.id]: val }));
                                                }}
                                            >
                                                {variants.map(v => (
                                                    <option key={v.id} value={v.id} disabled={v.stock_quantity <= 0}>
                                                        {v.title || v.name || `${v.size || ''} ${v.color || ''}`.trim()} {v.stock_quantity <= 0 ? '(Sold Out)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Price summary & 1-click CTA */}
                <div className="col-12 col-lg-5">
                    <div className="p-4 rounded-3 bg-light border shadow-xs">
                        <div className="d-flex align-items-baseline justify-content-between mb-2">
                            <span className="text-muted font-size-13">Total Regular Price:</span>
                            <span className={totalSavings > 0 ? "text-decoration-line-through text-muted font-size-14" : "fw-bold font-size-16 text-dark"}>
                                {currencySymbol}{Math.round(totalOriginal).toLocaleString()}
                            </span>
                        </div>

                        {totalSavings > 0 && (
                            <div className="d-flex align-items-baseline justify-content-between mb-2 text-success">
                                <span className="font-size-13 fw-semibold">Bundle Savings (5% Off):</span>
                                <span className="fw-bold font-size-14">
                                    -{currencySymbol}{Math.round(totalSavings).toLocaleString()}
                                </span>
                            </div>
                        )}

                        <div className="d-flex align-items-baseline justify-content-between pt-2 mb-3 border-top">
                            <span className="fw-bold font-size-15 text-dark">Bundle Price:</span>
                            <span className="fw-bold font-size-22 text-dark">
                                {currencySymbol}{Math.round(totalDiscounted).toLocaleString()}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddBundleToCart}
                            disabled={isSubmitting || checkedCount === 0}
                            className="btn btn-dark w-100 py-3 text-uppercase fw-bold font-size-12 tracking-wider shadow-sm d-flex align-items-center justify-content-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner-border spinner-border-sm text-warning" role="status" />
                                    <span>Adding Look...</span>
                                </>
                            ) : (
                                <>
                                    <i className="ri-shopping-bag-3-line font-size-16" />
                                    <span>Add Entire Look to Bag ({checkedCount} items)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
