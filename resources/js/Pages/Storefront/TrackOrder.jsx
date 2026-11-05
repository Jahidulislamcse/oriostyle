import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { sanitizeImageUrl } from '@/Utils/image';

export default function TrackOrder({
    trackedOrder = null,
    searchedOrderNumber = '',
    searchedPhone = '',
    errorMessage = null,
    userRecentOrders = [],
    currencySymbol = '৳',
    supportPhone = '01XXXXXXXXX',
    supportEmail = 'support@oriostyle.com',
}) {
    const { auth = {}, settings = {} } = usePage().props;
    const siteName = settings.site_name || 'ORIO STYLE';

    const [orderNumber, setOrderNumber] = useState(searchedOrderNumber || '');
    const [phone, setPhone] = useState(searchedPhone || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSearch = (e) => {
        e?.preventDefault();
        const trimmedNumber = orderNumber.trim();
        const trimmedPhone = phone.trim();

        if (!trimmedNumber) return;

        setIsSubmitting(true);
        router.get(
            '/track-order',
            { order_number: trimmedNumber, phone: trimmedPhone },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleQuickTrack = (num) => {
        setOrderNumber(num);
        setIsSubmitting(true);
        router.get(
            '/track-order',
            { order_number: num },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleCopy = (text) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'delivered':
                return { label: 'Delivered', class: 'bg-success text-white', icon: 'ri-checkbox-circle-fill' };
            case 'shipped':
                return { label: 'In Transit / Shipped', class: 'bg-primary text-white', icon: 'ri-truck-fill' };
            case 'processing':
                return { label: 'Packed & Processing', class: 'bg-info text-dark', icon: 'ri-box-3-fill' };
            case 'confirmed':
                return { label: 'Order Confirmed', class: 'bg-primary text-white', icon: 'ri-check-double-fill' };
            case 'cancelled':
                return { label: 'Order Cancelled', class: 'bg-danger text-white', icon: 'ri-close-circle-fill' };
            case 'returned':
                return { label: 'Returned', class: 'bg-secondary text-white', icon: 'ri-arrow-go-back-fill' };
            case 'pending':
            default:
                return { label: 'Pending Confirmation', class: 'bg-warning text-dark', icon: 'ri-time-fill' };
        }
    };

    return (
        <StorefrontLayout headerSolid={true}>
            <Head title={`Track Order Status | ${siteName}`} />

            <div className="oubd-order-tracking py-5" style={{ backgroundColor: '#F8FAFC', minHeight: '85vh' }}>
                <div className="container" style={{ maxWidth: '1000px' }}>
                    
                    {/* Page Header */}
                    <div className="text-center mb-5">
                        <span className="badge bg-dark text-white px-3 py-1.5 rounded-pill font-mono font-size-11 text-uppercase tracking-widest mb-2">
                            Real-Time Logistics
                        </span>
                        <h1 className="fw-black text-dark font-size-30 font-size-md-36 tracking-tight mb-2">
                            Track Your Order Status
                        </h1>
                        <p className="text-muted font-size-14 mx-auto mb-0" style={{ maxWidth: '580px' }}>
                            Stay updated with live delivery progress from our dispatch center directly to your doorstep.
                        </p>
                    </div>

                    {/* Tracking Lookup Box */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-5 bg-white">
                        <form onSubmit={handleSearch}>
                            <div className="row g-3 align-items-end">
                                <div className="col-md-5">
                                    <label className="form-label font-size-12 fw-bold text-uppercase text-muted mb-1">
                                        Order Reference # <span className="text-danger">*</span>
                                    </label>
                                    <div className="position-relative">
                                        <i className="ri-hashtag position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                        <input
                                            type="text"
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value)}
                                            placeholder="e.g. ORD-20261101-1001"
                                            required
                                            className="form-control rounded-3 font-mono font-size-14 ps-5 py-2.5"
                                            style={{ borderColor: '#E2E8F0' }}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label font-size-12 fw-bold text-uppercase text-muted mb-1">
                                        Phone Number or Email {auth?.user ? '(Optional for your orders)' : <span className="text-danger">*</span>}
                                    </label>
                                    <div className="position-relative">
                                        <i className="ri-phone-line position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="e.g. 017XXXXXXXX or email"
                                            className="form-control rounded-3 font-size-14 ps-5 py-2.5"
                                            style={{ borderColor: '#E2E8F0' }}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !orderNumber.trim()}
                                        className="btn btn-dark w-100 py-2.5 rounded-3 fw-bold font-size-13 text-uppercase tracking-wider d-flex align-items-center justify-content-center gap-2 shadow-xs"
                                        style={{ height: '44px' }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                                <span>Tracing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-map-pin-2-line font-size-16" />
                                                <span>Trace Order</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Recent Orders for Authenticated User */}
                        {auth?.user && userRecentOrders && userRecentOrders.length > 0 && !trackedOrder && (
                            <div className="mt-4 pt-4 border-top">
                                <span className="font-size-12 fw-bold text-uppercase text-muted d-block mb-2">
                                    Your Recent Orders:
                                </span>
                                <div className="d-flex flex-wrap gap-2">
                                    {userRecentOrders.map((ord) => (
                                        <button
                                            key={ord.order_number}
                                            type="button"
                                            onClick={() => handleQuickTrack(ord.order_number)}
                                            className="btn btn-sm btn-outline-secondary rounded-pill font-mono font-size-12 px-3 py-1 d-inline-flex align-items-center gap-1.5"
                                        >
                                            <i className="ri-time-line text-warning" />
                                            <span>#{ord.order_number}</span>
                                            <span className="badge bg-light text-dark border font-sans font-size-10 ms-1">
                                                {ord.order_status_label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Notification Alert */}
                    {errorMessage && (
                        <div className="alert alert-warning border-0 shadow-xs rounded-4 p-4 mb-4 d-flex align-items-start gap-3 bg-warning-subtle text-warning-emphasis">
                            <i className="ri-error-warning-fill font-size-24 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="font-size-15 fw-bold mb-1">Order Lookup Notice</h5>
                                <p className="font-size-13 mb-0 line-height-20">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Traced Order Result */}
                    {trackedOrder && (
                        <div className="oubd-order-result">
                            {/* Summary Header Card */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-4 border-bottom">
                                    <div>
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
                                            <span className="font-size-13 text-muted">Order Reference:</span>
                                            <span className="font-mono fw-black font-size-20 text-dark">
                                                #{trackedOrder.order_number}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(trackedOrder.order_number)}
                                                className="btn btn-sm btn-light p-1 px-2 rounded-2 font-size-11 text-muted"
                                                title="Copy Order Number"
                                            >
                                                <i className={copied ? 'ri-check-line text-success' : 'ri-file-copy-line'} />
                                                <span className="ms-1">{copied ? 'Copied' : 'Copy'}</span>
                                            </button>
                                        </div>

                                        <p className="font-size-13 text-muted mb-0">
                                            Placed on <strong className="text-dark">{trackedOrder.created_at}</strong>
                                            {' • '}
                                            Expected Delivery: <strong className="text-dark">{trackedOrder.estimated_delivery}</strong>
                                        </p>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        {(() => {
                                            const badge = getStatusBadge(trackedOrder.order_status);
                                            return (
                                                <span className={`badge ${badge.class} font-size-13 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1.5 shadow-xs`}>
                                                    <i className={badge.icon} />
                                                    <span>{badge.label}</span>
                                                </span>
                                            );
                                        })()}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOrderNumber('');
                                                setPhone('');
                                                router.get('/track-order', {}, { preserveState: false });
                                            }}
                                            className="btn btn-sm btn-outline-dark rounded-3 font-size-12 px-2.5 py-1.5"
                                            title="Track Another Order"
                                        >
                                            <i className="ri-refresh-line me-1" />
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                {/* Order Cancelled / Returned Callout Alert */}
                                {trackedOrder.timeline.is_cancelled && (
                                    <div className="alert alert-danger border-0 rounded-3 mt-4 mb-0 d-flex align-items-center gap-2 p-3 font-size-13">
                                        <i className="ri-close-circle-fill font-size-20 shrink-0" />
                                        <div>
                                            <strong>Order Cancelled:</strong> This order was cancelled on {trackedOrder.cancelled_at || 'record'}. If you have questions or require a refund, please contact customer support.
                                        </div>
                                    </div>
                                )}

                                {trackedOrder.timeline.is_returned && (
                                    <div className="alert alert-secondary border-0 rounded-3 mt-4 mb-0 d-flex align-items-center gap-2 p-3 font-size-13">
                                        <i className="ri-arrow-go-back-fill font-size-20 shrink-0" />
                                        <div>
                                            <strong>Order Returned:</strong> This order has been processed as returned to warehouse.
                                        </div>
                                    </div>
                                )}

                                {/* Interactive Visual Stepper Timeline */}
                                {!trackedOrder.timeline.is_cancelled && (
                                    <div className="py-4 my-2">
                                        <div className="position-relative">
                                            {/* Step Items Grid */}
                                            <div className="row g-3 text-center position-relative" style={{ zIndex: 2 }}>
                                                {trackedOrder.timeline.steps.map((st, idx) => {
                                                    const isDone = st.completed;
                                                    const isCurrent = st.current;

                                                    let circleBg = '#E2E8F0';
                                                    let circleColor = '#64748B';
                                                    let circleBorder = '2px solid transparent';

                                                    if (isDone) {
                                                        circleBg = '#10B981';
                                                        circleColor = '#ffffff';
                                                    }
                                                    if (isCurrent) {
                                                        circleBg = '#0E2038';
                                                        circleColor = '#D4AF37';
                                                        circleBorder = '3px solid #D4AF37';
                                                    }

                                                    return (
                                                        <div key={st.step} className="col">
                                                            <div
                                                                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-xs transition"
                                                                style={{
                                                                    width: isCurrent ? '48px' : '42px',
                                                                    height: isCurrent ? '48px' : '42px',
                                                                    backgroundColor: circleBg,
                                                                    color: circleColor,
                                                                    border: circleBorder,
                                                                }}
                                                            >
                                                                <i className={`${st.icon} font-size-18`} />
                                                            </div>

                                                            <h4 className={`font-size-13 mb-1 ${isCurrent ? 'fw-black text-dark' : isDone ? 'fw-bold text-dark' : 'text-muted'}`}>
                                                                {st.name}
                                                            </h4>

                                                            <p className="font-size-11 text-muted d-none d-md-block mb-1 line-height-14">
                                                                {st.desc}
                                                            </p>

                                                            {st.date && (
                                                                <span className="badge bg-light text-muted border font-size-10 font-mono">
                                                                    {st.date.split(' at ')[0]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Details 2-Column Grid */}
                            <div className="row g-4 mb-4">
                                {/* Left Column: Shipping & Customer Info */}
                                <div className="col-lg-6">
                                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                                        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                            <i className="ri-map-pin-user-line font-size-18 text-warning" />
                                            <h3 className="font-size-14 fw-bold text-uppercase text-dark mb-0">
                                                Delivery & Recipient
                                            </h3>
                                        </div>

                                        <div className="mb-3">
                                            <span className="font-size-11 fw-bold text-muted text-uppercase d-block mb-1">
                                                Customer Name
                                            </span>
                                            <span className="font-size-14 fw-bold text-dark">
                                                {trackedOrder.customer_name}
                                            </span>
                                        </div>

                                        <div className="row g-2 mb-3">
                                            <div className="col-sm-6">
                                                <span className="font-size-11 fw-bold text-muted text-uppercase d-block mb-1">
                                                    Contact Phone
                                                </span>
                                                <span className="font-size-13 font-mono text-dark">
                                                    {trackedOrder.customer_phone}
                                                </span>
                                            </div>
                                            {trackedOrder.customer_email && (
                                                <div className="col-sm-6">
                                                    <span className="font-size-11 fw-bold text-muted text-uppercase d-block mb-1">
                                                        Email
                                                    </span>
                                                    <span className="font-size-13 text-dark">
                                                        {trackedOrder.customer_email}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <span className="font-size-11 fw-bold text-muted text-uppercase d-block mb-1">
                                                Shipping Address
                                            </span>
                                            <p className="font-size-13 text-muted mb-0 line-height-20">
                                                {trackedOrder.shipping_address}, {trackedOrder.city}
                                                {trackedOrder.zone && ` (${trackedOrder.zone})`}
                                                {trackedOrder.postal_code && ` - ${trackedOrder.postal_code}`}
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-3 bg-light border mt-auto">
                                            <div className="d-flex justify-content-between align-items-center font-size-12">
                                                <span className="text-muted">Delivery Speed:</span>
                                                <span className="fw-bold text-dark">{trackedOrder.estimated_delivery}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Payment & Financial Summary */}
                                <div className="col-lg-6">
                                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                                        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                            <i className="ri-secure-payment-line font-size-18 text-warning" />
                                            <h3 className="font-size-14 fw-bold text-uppercase text-dark mb-0">
                                                Payment & Charges
                                            </h3>
                                        </div>

                                        <div className="row g-2 mb-3">
                                            <div className="col-sm-6">
                                                <span className="font-size-11 fw-bold text-muted text-uppercase d-block mb-1">
                                                    Payment Method
                                                </span>
                                                <span className="badge bg-light text-dark border font-size-12 px-2.5 py-1">
                                                    {trackedOrder.payment_method_label}
                                                </span>
                                            </div>
                                            <div className="col-sm-6">
                                                <span className="font-size-11 fw-bold text-muted text-uppercase d-block mb-1">
                                                    Payment Status
                                                </span>
                                                <span className={`badge ${trackedOrder.payment_status === 'paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'} font-size-12 px-2.5 py-1 text-uppercase`}>
                                                    {trackedOrder.payment_status_label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-3 font-size-13">
                                            <div className="d-flex justify-content-between text-muted mb-1">
                                                <span>Subtotal</span>
                                                <span className="font-mono text-dark">{currencySymbol}{trackedOrder.subtotal.toFixed(2)}</span>
                                            </div>

                                            {trackedOrder.discount_amount > 0 && (
                                                <div className="d-flex justify-content-between text-success mb-1">
                                                    <span>Coupon Discount</span>
                                                    <span className="font-mono fw-bold">-{currencySymbol}{trackedOrder.discount_amount.toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div className="d-flex justify-content-between text-muted mb-2 pb-2 border-bottom">
                                                <span>Shipping Charge</span>
                                                <span className="font-mono text-dark">
                                                    {trackedOrder.shipping_charge === 0 ? (
                                                        <span className="badge bg-success-subtle text-success">FREE</span>
                                                    ) : (
                                                        `${currencySymbol}${trackedOrder.shipping_charge.toFixed(2)}`
                                                    )}
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between font-size-16 fw-bold text-dark pt-1">
                                                <span>Total Payable</span>
                                                <span className="font-mono font-size-18 text-dark">
                                                    {currencySymbol}{trackedOrder.total_amount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-3 bg-light border text-center font-size-11 text-muted mt-auto">
                                            Prices inclusive of all applicable VAT & local delivery logistics.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ordered Items Table Card */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
                                <h3 className="font-size-15 fw-bold text-uppercase text-dark mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
                                    <span>Items in this Order ({trackedOrder.items.length})</span>
                                    <span className="font-size-12 text-muted fw-normal font-sans">
                                        Package Ref: #{trackedOrder.order_number}
                                    </span>
                                </h3>

                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle mb-0">
                                        <thead className="border-bottom text-muted font-size-11 text-uppercase">
                                            <tr>
                                                <th>Product</th>
                                                <th className="text-center">Qty</th>
                                                <th className="text-end">Price</th>
                                                <th className="text-end">Line Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trackedOrder.items.map((item) => (
                                                <tr key={item.id} className="border-bottom border-light">
                                                    <td className="py-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={sanitizeImageUrl(item.image_url)}
                                                                    alt={item.product_name}
                                                                    className="rounded-3 border object-fit-cover"
                                                                    style={{ width: '48px', height: '48px' }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="rounded-3 bg-light border d-flex align-items-center justify-content-center text-muted"
                                                                    style={{ width: '48px', height: '48px' }}
                                                                >
                                                                    <i className="ri-image-line font-size-20" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className="font-size-14 fw-bold text-dark mb-0.5">
                                                                    {item.product_name}
                                                                </h4>
                                                                {item.variant_attributes && (
                                                                    <div className="font-size-11 text-muted">
                                                                        {Object.entries(item.variant_attributes).map(([k, v]) => (
                                                                            <span key={k} className="me-2 text-capitalize">
                                                                                {k}: <strong className="text-dark">{v}</strong>
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {item.product_sku && (
                                                                    <span className="font-mono font-size-10 text-muted">
                                                                        SKU: {item.product_sku}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center font-mono font-size-14 fw-bold">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="text-end font-mono font-size-13 text-muted">
                                                        {currencySymbol}{item.unit_price.toFixed(2)}
                                                    </td>
                                                    <td className="text-end font-mono font-size-14 fw-bold text-dark">
                                                        {currencySymbol}{item.line_total.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Fulfillment History Timeline / Status Logs */}
                            {trackedOrder.status_histories && trackedOrder.status_histories.length > 0 && (
                                <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
                                    <h3 className="font-size-14 fw-bold text-uppercase text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                        <i className="ri-history-line text-warning" />
                                        <span>Status History & Dispatch Log</span>
                                    </h3>

                                    <div className="space-y-3">
                                        {trackedOrder.status_histories.map((hist, idx) => (
                                            <div key={hist.id} className="d-flex align-items-start gap-3 pb-3 border-bottom border-light">
                                                <div
                                                    className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-dark shrink-0 mt-0.5"
                                                    style={{ width: '32px', height: '32px' }}
                                                >
                                                    <i className="ri-checkbox-circle-line font-size-16 text-success" />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                                        <span className="font-size-13 fw-bold text-dark">
                                                            {hist.to_status}
                                                            {hist.from_status && (
                                                                <span className="font-size-12 text-muted fw-normal">
                                                                    {' '}(from {hist.from_status})
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="font-mono font-size-11 text-muted">
                                                            {hist.created_at}
                                                        </span>
                                                    </div>
                                                    {hist.comment && (
                                                        <p className="font-size-12 text-muted mb-0">
                                                            {hist.comment}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Help & Support Footer Card */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-4 bg-white text-center">
                                <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                                    <div className="text-sm-start">
                                        <h4 className="font-size-14 fw-bold text-dark mb-1">
                                            Questions regarding your delivery?
                                        </h4>
                                        <p className="font-size-13 text-muted mb-0">
                                            Our customer care team is available from 9 AM to 10 PM.
                                        </p>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2">
                                        <a
                                            href={`tel:${supportPhone}`}
                                            className="btn btn-dark rounded-3 px-3 py-2 font-size-13 fw-bold d-inline-flex align-items-center gap-1.5"
                                        >
                                            <i className="ri-phone-fill text-warning" />
                                            <span>Call Support: {supportPhone}</span>
                                        </a>

                                        <Link
                                            href="/shop"
                                            className="btn btn-outline-secondary rounded-3 px-3 py-2 font-size-13 fw-bold"
                                        >
                                            Continue Shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StorefrontLayout>
    );
}
