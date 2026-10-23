import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function OrderSuccess({
    order = {},
    estimatedDelivery = '24 - 48 Hours',
}) {
    const { settings = {} } = usePage().props;
    const currencySymbol = order.currency_symbol || settings.default_currency_symbol || '৳';
    const siteName = settings.site_name || 'ORIO STYLE';
    const supportPhone = settings.support_phone || '01XXXXXXXXX';

    return (
        <StorefrontLayout headerSolid={true}>
            <Head title={`Order Placed Successfully #${order.order_number} | ${siteName}`} />

            <div className="oubd-order-success py-5" style={{ backgroundColor: '#F9FAFC', minHeight: '80vh' }}>
                <div className="container" style={{ maxWidth: '850px' }}>
                    
                    {/* Header Card */}
                    <div className="card border-0 shadow-xs rounded-4 p-4 p-md-5 mb-4 text-center bg-white">
                        <div
                            className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                            style={{ width: '68px', height: '68px' }}
                        >
                            <i className="ri-check-line font-size-36" />
                        </div>

                        <span className="badge bg-success-subtle text-success font-size-12 px-3 py-1.5 rounded-pill mb-2 font-mono fw-bold">
                            ORDER CONFIRMED
                        </span>

                        <h1 className="font-size-26 fw-black text-dark mb-1 tracking-tight">
                            Thank You for Your Order!
                        </h1>

                        <p className="font-size-14 text-muted mb-3">
                            We've received your order and our dispatch team is preparing it for delivery.
                        </p>

                        <div className="d-inline-flex align-items-center justify-content-center gap-2 p-2 px-4 rounded-3 bg-light border font-mono">
                            <span className="text-muted font-size-13">Order Reference:</span>
                            <span className="fw-bold text-dark font-size-15">#{order.order_number}</span>
                        </div>
                    </div>

                    {/* Order Details & Summary Card */}
                    <div className="card border-0 shadow-xs rounded-4 p-4 p-md-5 mb-4 bg-white">
                        <div className="row g-4 mb-4 pb-4 border-bottom">
                            <div className="col-sm-6">
                                <h3 className="font-size-12 fw-bold text-uppercase text-muted mb-2">
                                    Delivery Address
                                </h3>
                                <p className="font-size-14 text-dark fw-bold mb-1">
                                    {order.customer_name}
                                </p>
                                <p className="font-size-13 text-muted mb-1">
                                    {order.customer_phone}
                                    {order.customer_email && ` • ${order.customer_email}`}
                                </p>
                                <p className="font-size-13 text-muted mb-0">
                                    {order.shipping_address}, {order.city}
                                </p>
                            </div>

                            <div className="col-sm-6">
                                <h3 className="font-size-12 fw-bold text-uppercase text-muted mb-2">
                                    Delivery & Payment Info
                                </h3>
                                <div className="d-flex justify-content-between font-size-13 mb-1">
                                    <span className="text-muted">Estimated Delivery:</span>
                                    <span className="fw-bold text-dark">{estimatedDelivery}</span>
                                </div>
                                <div className="d-flex justify-content-between font-size-13 mb-1">
                                    <span className="text-muted">Payment Method:</span>
                                    <span className="fw-bold text-dark">{order.payment_method_label}</span>
                                </div>
                                <div className="d-flex justify-content-between font-size-13">
                                    <span className="text-muted">Payment Status:</span>
                                    <span className="badge bg-warning-subtle text-warning-emphasis font-size-11 text-uppercase">
                                        {order.payment_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <h3 className="font-size-14 fw-bold text-uppercase text-dark mb-3">
                            Ordered Items ({order.items?.length || 0})
                        </h3>

                        <div className="table-responsive mb-4">
                            <table className="table table-borderless align-middle mb-0">
                                <thead className="border-bottom border-light text-muted font-size-11 text-uppercase">
                                    <tr>
                                        <th>Product</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-end">Price</th>
                                        <th className="text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items && order.items.map((item) => (
                                        <tr key={item.id} className="border-bottom border-light">
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="rounded-3 border overflow-hidden flex-shrink-0 bg-light d-flex align-items-center justify-content-center"
                                                        style={{ width: '48px', height: '54px' }}
                                                    >
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <i className="ri-image-line text-muted font-size-16" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-size-13 fw-bold text-dark mb-0">
                                                            {item.product_name}
                                                        </h4>
                                                        {item.product_sku && (
                                                            <span className="font-size-11 text-muted font-mono d-block">
                                                                SKU: {item.product_sku}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center font-mono font-size-13 text-muted">
                                                {item.quantity}
                                            </td>
                                            <td className="text-end font-mono font-size-13 text-muted">
                                                {currencySymbol}{Number(item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="text-end font-mono font-size-13 fw-bold text-dark">
                                                {currencySymbol}{Number(item.line_total).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Breakdown Totals */}
                        <div className="p-3 bg-light rounded-4 mb-4" style={{ maxWidth: '360px', marginLeft: 'auto' }}>
                            <div className="d-flex justify-content-between font-size-13 text-muted mb-1">
                                <span>Subtotal</span>
                                <span className="font-mono text-dark">{currencySymbol}{Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            {Number(order.discount_amount) > 0 && (
                                <div className="d-flex justify-content-between font-size-13 text-success mb-1">
                                    <span>Discount</span>
                                    <span className="font-mono fw-bold">-{currencySymbol}{Number(order.discount_amount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="d-flex justify-content-between font-size-13 text-muted mb-2 pb-2 border-bottom">
                                <span>Shipping Charge</span>
                                <span className="font-mono text-dark">
                                    {Number(order.shipping_charge) === 0 ? (
                                        <span className="badge bg-success-subtle text-success">FREE</span>
                                    ) : (
                                        `${currencySymbol}${Number(order.shipping_charge).toFixed(2)}`
                                    )}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between font-size-16 fw-bold text-dark">
                                <span>Total Payable</span>
                                <span className="font-mono font-size-18">{currencySymbol}{Number(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 pt-3 border-top">
                            <Link
                                href="/shop"
                                className="btn btn-dark px-4 py-2.5 rounded-3 font-size-13 fw-bold text-uppercase tracking-wider w-100 w-sm-auto shadow-xs"
                            >
                                <i className="ri-shopping-bag-line me-1" /> Continue Shopping
                            </Link>

                            <Link
                                href="/"
                                className="btn btn-outline-dark px-4 py-2.5 rounded-3 font-size-13 fw-bold text-uppercase tracking-wider w-100 w-sm-auto"
                            >
                                <i className="ri-home-line me-1" /> Return Home
                            </Link>
                        </div>
                    </div>

                    {/* Support Banner */}
                    <div className="text-center text-muted font-size-13">
                        Need assistance regarding your order? Call our support team at{' '}
                        <a href={`tel:${supportPhone}`} className="text-dark fw-bold text-decoration-none">
                            {supportPhone}
                        </a>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
