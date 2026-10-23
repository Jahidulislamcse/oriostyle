import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function Checkout({
    cart = { items: [] },
    shippingConfig = {},
    paymentConfig = {},
    customerProfile = null,
}) {
    const { settings = {} } = usePage().props;
    const currencySymbol = settings.default_currency_symbol || '৳';
    const siteName = settings.site_name || 'ORIO STYLE';

    // Shipping calculations
    const insideCharge = Number(shippingConfig.inside_charge || 70);
    const outsideCharge = Number(shippingConfig.outside_charge || 130);
    const freeThreshold = Number(shippingConfig.free_shipping_threshold || 2000);
    const cartSubtotal = Number(cart.subtotal || 0);
    const cartDiscount = Number(cart.discount_amount || 0);

    const isFreeShipping = cartSubtotal >= freeThreshold;

    const { data, setData, post, processing, errors } = useForm({
        customer_name: customerProfile?.name || '',
        customer_phone: customerProfile?.phone || '',
        customer_email: customerProfile?.email || '',
        delivery_zone: 'inside_dhaka',
        shipping_address: customerProfile?.shipping_address || '',
        city: customerProfile?.city || 'Dhaka',
        zone: '',
        postal_code: '',
        payment_method: 'cod',
        customer_notes: '',
    });

    const activeShippingCharge = isFreeShipping
        ? 0
        : (data.delivery_zone === 'inside_dhaka' ? insideCharge : outsideCharge);

    const grandTotal = Math.max(0, (cartSubtotal - cartDiscount) + activeShippingCharge);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/checkout');
    };

    return (
        <StorefrontLayout headerSolid={true}>
            <Head title={`Secure Checkout | ${siteName}`} />

            <div className="oubd-checkout-page py-4 py-lg-5" style={{ backgroundColor: '#F9FAFC', minHeight: '80vh' }}>
                <div className="container">
                    
                    {/* Breadcrumbs */}
                    <nav aria-label="breadcrumb" className="mb-4">
                        <ol className="breadcrumb font-size-13 text-muted mb-0">
                            <li className="breadcrumb-item">
                                <Link href="/" className="text-decoration-none text-muted">Home</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href="/shop" className="text-decoration-none text-muted">Shop</Link>
                            </li>
                            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
                                Checkout
                            </li>
                        </ol>
                    </nav>

                    <div className="row g-4 g-xl-5">
                        {/* Left Column: Checkout Delivery & Payment Form */}
                        <div className="col-lg-7">
                            <form onSubmit={handleSubmit} id="checkout-form">
                                
                                {/* 1. Contact & Customer Information */}
                                <div className="card border-0 shadow-xs rounded-4 p-4 p-md-4 mb-4 bg-white">
                                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                        <span className="badge rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                                            1
                                        </span>
                                        <h2 className="font-size-17 fw-bold text-dark mb-0">
                                            Recipient & Contact Information
                                        </h2>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label font-size-12 fw-bold text-uppercase text-muted">
                                                Full Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="customer_name"
                                                value={data.customer_name}
                                                onChange={(e) => setData('customer_name', e.target.value)}
                                                className={`form-control rounded-3 font-size-14 py-2.5 ${errors.customer_name ? 'is-invalid' : ''}`}
                                                placeholder="e.g. Jahidul Islam"
                                                required
                                            />
                                            {errors.customer_name && (
                                                <div className="invalid-feedback font-size-12">{errors.customer_name}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label font-size-12 fw-bold text-uppercase text-muted">
                                                Mobile Phone <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="customer_phone"
                                                value={data.customer_phone}
                                                onChange={(e) => setData('customer_phone', e.target.value)}
                                                className={`form-control rounded-3 font-size-14 py-2.5 ${errors.customer_phone ? 'is-invalid' : ''}`}
                                                placeholder="017XXXXXXXX"
                                                required
                                            />
                                            {errors.customer_phone && (
                                                <div className="invalid-feedback font-size-12">{errors.customer_phone}</div>
                                            )}
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label font-size-12 fw-bold text-uppercase text-muted">
                                                Email Address <span className="text-muted fw-normal font-size-11">(Optional - for digital invoice & tracking)</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="customer_email"
                                                value={data.customer_email}
                                                onChange={(e) => setData('customer_email', e.target.value)}
                                                className={`form-control rounded-3 font-size-14 py-2.5 ${errors.customer_email ? 'is-invalid' : ''}`}
                                                placeholder="you@domain.com"
                                            />
                                            {errors.customer_email && (
                                                <div className="invalid-feedback font-size-12">{errors.customer_email}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Shipping Delivery Address & Zone */}
                                <div className="card border-0 shadow-xs rounded-4 p-4 p-md-4 mb-4 bg-white">
                                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                        <span className="badge rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                                            2
                                        </span>
                                        <h2 className="font-size-17 fw-bold text-dark mb-0">
                                            Delivery Location & Address
                                        </h2>
                                    </div>

                                    {/* Zone Selection Cards */}
                                    <div className="mb-4">
                                        <label className="form-label font-size-12 fw-bold text-uppercase text-muted d-block mb-2">
                                            Choose Delivery Zone <span className="text-danger">*</span>
                                        </label>
                                        <div className="row g-3">
                                            <div className="col-sm-6">
                                                <div
                                                    onClick={() => setData('delivery_zone', 'inside_dhaka')}
                                                    className={`card h-100 p-3 rounded-4 cursor-pointer border transition-all ${
                                                        data.delivery_zone === 'inside_dhaka'
                                                            ? 'border-dark bg-light shadow-xs'
                                                            : 'border-slate-200 hover-border-dark'
                                                    }`}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="delivery_zone"
                                                                id="zone-inside"
                                                                checked={data.delivery_zone === 'inside_dhaka'}
                                                                onChange={() => setData('delivery_zone', 'inside_dhaka')}
                                                                className="form-check-input mt-0"
                                                            />
                                                            <label htmlFor="zone-inside" className="fw-bold font-size-14 text-dark mb-0 cursor-pointer">
                                                                Inside Dhaka
                                                            </label>
                                                        </div>
                                                        <span className="fw-bold font-size-14 text-dark font-mono">
                                                            {isFreeShipping ? (
                                                                <span className="badge bg-success-subtle text-success">FREE</span>
                                                            ) : (
                                                                `${currencySymbol}${insideCharge.toFixed(2)}`
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted font-size-11 d-block ms-4">
                                                        <i className="ri-time-line me-1" />
                                                        {shippingConfig.estimated_delivery_inside || '24 - 48 Hours'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-sm-6">
                                                <div
                                                    onClick={() => setData('delivery_zone', 'outside_dhaka')}
                                                    className={`card h-100 p-3 rounded-4 cursor-pointer border transition-all ${
                                                        data.delivery_zone === 'outside_dhaka'
                                                            ? 'border-dark bg-light shadow-xs'
                                                            : 'border-slate-200 hover-border-dark'
                                                    }`}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="delivery_zone"
                                                                id="zone-outside"
                                                                checked={data.delivery_zone === 'outside_dhaka'}
                                                                onChange={() => setData('delivery_zone', 'outside_dhaka')}
                                                                className="form-check-input mt-0"
                                                            />
                                                            <label htmlFor="zone-outside" className="fw-bold font-size-14 text-dark mb-0 cursor-pointer">
                                                                Outside Dhaka
                                                            </label>
                                                        </div>
                                                        <span className="fw-bold font-size-14 text-dark font-mono">
                                                            {isFreeShipping ? (
                                                                <span className="badge bg-success-subtle text-success">FREE</span>
                                                            ) : (
                                                                `${currencySymbol}${outsideCharge.toFixed(2)}`
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted font-size-11 d-block ms-4">
                                                        <i className="ri-truck-line me-1" />
                                                        {shippingConfig.estimated_delivery_outside || '3 - 5 Days'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label font-size-12 fw-bold text-uppercase text-muted">
                                                Complete Street Address <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                name="shipping_address"
                                                rows="3"
                                                value={data.shipping_address}
                                                onChange={(e) => setData('shipping_address', e.target.value)}
                                                className={`form-control rounded-3 font-size-14 ${errors.shipping_address ? 'is-invalid' : ''}`}
                                                placeholder="House/Apartment #, Road #, Sector/Area, Landmark..."
                                                required
                                            />
                                            {errors.shipping_address && (
                                                <div className="invalid-feedback font-size-12">{errors.shipping_address}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label font-size-12 fw-bold text-uppercase text-muted">
                                                City / District
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                className="form-control rounded-3 font-size-14 py-2.5"
                                                placeholder="e.g. Dhaka, Chittagong, Sylhet"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label font-size-12 fw-bold text-uppercase text-muted">
                                                Order Notes <span className="text-muted fw-normal font-size-11">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="customer_notes"
                                                value={data.customer_notes}
                                                onChange={(e) => setData('customer_notes', e.target.value)}
                                                className="form-control rounded-3 font-size-14 py-2.5"
                                                placeholder="Any special delivery instructions..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Payment Method Selector */}
                                <div className="card border-0 shadow-xs rounded-4 p-4 p-md-4 mb-4 bg-white">
                                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                        <span className="badge rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                                            3
                                        </span>
                                        <h2 className="font-size-17 fw-bold text-dark mb-0">
                                            Payment Method
                                        </h2>
                                    </div>

                                    <div className="d-flex flex-column gap-3">
                                        {/* Cash on Delivery */}
                                        <div
                                            onClick={() => setData('payment_method', 'cod')}
                                            className={`p-3 rounded-4 border transition-all ${
                                                data.payment_method === 'cod'
                                                    ? 'border-dark bg-light shadow-xs'
                                                    : 'border-slate-200'
                                            }`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        id="pay-cod"
                                                        checked={data.payment_method === 'cod'}
                                                        onChange={() => setData('payment_method', 'cod')}
                                                        className="form-check-input mt-0"
                                                    />
                                                    <label htmlFor="pay-cod" className="fw-bold font-size-14 text-dark mb-0 cursor-pointer">
                                                        Cash on Delivery (COD)
                                                    </label>
                                                </div>
                                                <i className="ri-hand-coin-line font-size-22 text-muted" />
                                            </div>
                                            <p className="font-size-12 text-muted mb-0 mt-2 ms-4">
                                                Pay comfortably with cash when your parcel is delivered to your address.
                                            </p>
                                        </div>

                                        {/* bKash Online */}
                                        <div
                                            onClick={() => setData('payment_method', 'bkash')}
                                            className={`p-3 rounded-4 border transition-all ${
                                                data.payment_method === 'bkash'
                                                    ? 'border-dark bg-light shadow-xs'
                                                    : 'border-slate-200'
                                            }`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        id="pay-bkash"
                                                        checked={data.payment_method === 'bkash'}
                                                        onChange={() => setData('payment_method', 'bkash')}
                                                        className="form-check-input mt-0"
                                                    />
                                                    <label htmlFor="pay-bkash" className="fw-bold font-size-14 text-dark mb-0 cursor-pointer">
                                                        bKash Payment
                                                    </label>
                                                </div>
                                                <span className="badge bg-danger-subtle text-danger fw-bold font-size-11">
                                                    bKash
                                                </span>
                                            </div>
                                            <p className="font-size-12 text-muted mb-0 mt-2 ms-4">
                                                Send money or make payment directly to our official merchant wallet.
                                            </p>
                                        </div>

                                        {/* Nagad */}
                                        <div
                                            onClick={() => setData('payment_method', 'nagad')}
                                            className={`p-3 rounded-4 border transition-all ${
                                                data.payment_method === 'nagad'
                                                    ? 'border-dark bg-light shadow-xs'
                                                    : 'border-slate-200'
                                            }`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        id="pay-nagad"
                                                        checked={data.payment_method === 'nagad'}
                                                        onChange={() => setData('payment_method', 'nagad')}
                                                        className="form-check-input mt-0"
                                                    />
                                                    <label htmlFor="pay-nagad" className="fw-bold font-size-14 text-dark mb-0 cursor-pointer">
                                                        Nagad Payment
                                                    </label>
                                                </div>
                                                <span className="badge bg-warning-subtle text-warning-emphasis fw-bold font-size-11">
                                                    Nagad
                                                </span>
                                            </div>
                                            <p className="font-size-12 text-muted mb-0 mt-2 ms-4">
                                                Pay securely with Nagad mobile financial service.
                                            </p>
                                        </div>

                                        {/* Direct Bank Transfer */}
                                        <div
                                            onClick={() => setData('payment_method', 'bank_transfer')}
                                            className={`p-3 rounded-4 border transition-all ${
                                                data.payment_method === 'bank_transfer'
                                                    ? 'border-dark bg-light shadow-xs'
                                                    : 'border-slate-200'
                                            }`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        id="pay-bank"
                                                        checked={data.payment_method === 'bank_transfer'}
                                                        onChange={() => setData('payment_method', 'bank_transfer')}
                                                        className="form-check-input mt-0"
                                                    />
                                                    <label htmlFor="pay-bank" className="fw-bold font-size-14 text-dark mb-0 cursor-pointer">
                                                        Direct Bank Transfer
                                                    </label>
                                                </div>
                                                <i className="ri-bank-line font-size-22 text-muted" />
                                            </div>
                                            <p className="font-size-12 text-muted mb-0 mt-2 ms-4">
                                                Transfer directly to our corporate bank account. Details provided upon checkout.
                                            </p>
                                        </div>
                                    </div>
                                    {errors.payment_method && (
                                        <div className="text-danger font-size-12 mt-2">{errors.payment_method}</div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Right Column: Order Summary (Sticky) */}
                        <div className="col-lg-5">
                            <div className="card border-0 shadow-xs rounded-4 p-4 p-md-4 bg-white" style={{ position: 'sticky', top: '90px' }}>
                                <h3 className="font-size-17 fw-bold text-dark pb-3 border-bottom mb-3 d-flex justify-content-between align-items-center">
                                    <span>Order Summary</span>
                                    <span className="badge bg-light text-dark border font-size-12 font-mono">
                                        {cart.count || 0} {cart.count === 1 ? 'item' : 'items'}
                                    </span>
                                </h3>

                                {/* Cart Line Items List */}
                                <div className="cart-items-preview mb-3 overflow-y-auto" style={{ maxHeight: '280px' }}>
                                    {cart.items && cart.items.map((item) => (
                                        <div key={item.id} className="d-flex align-items-center gap-3 py-2 border-bottom border-light">
                                            <div
                                                className="rounded-3 border overflow-hidden flex-shrink-0 bg-light d-flex align-items-center justify-content-center"
                                                style={{ width: '56px', height: '64px' }}
                                            >
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <i className="ri-image-line text-muted font-size-18" />
                                                )}
                                            </div>

                                            <div className="flex-grow-1 min-w-0">
                                                <h4 className="font-size-13 fw-bold text-dark mb-1 text-truncate">
                                                    {item.product_name}
                                                </h4>
                                                {item.variant_summary && (
                                                    <span className="font-size-11 text-muted d-block mb-1">
                                                        {item.variant_summary}
                                                    </span>
                                                )}
                                                <div className="font-size-12 text-muted font-mono">
                                                    Qty: {item.quantity} × {currencySymbol}{Number(item.unit_price).toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="text-end flex-shrink-0 font-mono fw-bold font-size-13 text-dark">
                                                {currencySymbol}{Number(item.line_total).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Calculation Breakdown */}
                                <div className="space-y-2 py-3 border-bottom">
                                    <div className="d-flex justify-content-between font-size-13 text-muted mb-2">
                                        <span>Subtotal</span>
                                        <span className="font-mono text-dark fw-semibold">
                                            {currencySymbol}{cartSubtotal.toFixed(2)}
                                        </span>
                                    </div>

                                    {cartDiscount > 0 && (
                                        <div className="d-flex justify-content-between font-size-13 text-success mb-2">
                                            <span>
                                                Coupon Discount {cart.coupon?.code ? `(${cart.coupon.code})` : ''}
                                            </span>
                                            <span className="font-mono fw-bold">
                                                -{currencySymbol}{cartDiscount.toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between font-size-13 text-muted mb-2">
                                        <span>
                                            Delivery Fee ({data.delivery_zone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                                        </span>
                                        <span className="font-mono text-dark fw-semibold">
                                            {activeShippingCharge === 0 ? (
                                                <span className="badge bg-success-subtle text-success">FREE</span>
                                            ) : (
                                                `${currencySymbol}${activeShippingCharge.toFixed(2)}`
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Total Amount */}
                                <div className="d-flex justify-content-between align-items-center py-3 mb-3">
                                    <span className="font-size-15 fw-bold text-dark text-uppercase">
                                        Total Amount
                                    </span>
                                    <span className="font-size-22 fw-black text-dark font-mono">
                                        {currencySymbol}{grandTotal.toFixed(2)}
                                    </span>
                                </div>

                                {/* Submit Order Button */}
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={processing}
                                    className="btn btn-dark w-100 py-3 text-uppercase fw-bold font-size-14 tracking-wider shadow-sm d-flex align-items-center justify-content-center gap-2 rounded-3"
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                            <span>Processing Order...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-shield-check-line font-size-18" />
                                            <span>Place Order Now</span>
                                        </>
                                    )}
                                </button>

                                {/* Trust Highlights */}
                                <div className="mt-4 pt-3 border-top">
                                    <div className="d-flex align-items-center gap-2 font-size-12 text-muted mb-2">
                                        <i className="ri-shield-star-line text-warning font-size-16" />
                                        <span>100% Authentic Quality Guaranteed</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 font-size-12 text-muted mb-2">
                                        <i className="ri-arrow-go-back-line text-primary font-size-16" />
                                        <span>7-Day Easy Exchange Policy</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 font-size-12 text-muted">
                                        <i className="ri-lock-line text-success font-size-16" />
                                        <span>Encrypted & Safe Checkout</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
