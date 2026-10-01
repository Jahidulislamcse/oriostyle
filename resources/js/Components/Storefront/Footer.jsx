import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Footer() {
    const { settings, appName } = usePage().props;
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;

    return (
        <footer className="mn-footer bg-dark text-white pt-5 pb-4 border-top border-warning">
            <div className="container-fluid max-w-7xl mx-auto px-3">
                {/* Value Highlights */}
                <div className="row g-4 mb-5 p-4 rounded-4 bg-secondary bg-opacity-10 border border-secondary">
                    <div className="col-md-4 d-flex align-items-center gap-3">
                        <div className="bg-warning text-dark p-3 rounded-3 shrink-0">
                            <i className="ri-shield-check-line fs-3"></i>
                        </div>
                        <div>
                            <h5 className="fs-6 fw-bold mb-1">100% Authentic Quality</h5>
                            <p className="text-muted text-xs mb-0">Every product verified & quality tested</p>
                        </div>
                    </div>
                    <div className="col-md-4 d-flex align-items-center gap-3">
                        <div className="bg-warning text-dark p-3 rounded-3 shrink-0">
                            <i className="ri-truck-line fs-3"></i>
                        </div>
                        <div>
                            <h5 className="fs-6 fw-bold mb-1">Express Shipping</h5>
                            <p className="text-muted text-xs mb-0">Fast, safe & tracked nationwide delivery</p>
                        </div>
                    </div>
                    <div className="col-md-4 d-flex align-items-center gap-3">
                        <div className="bg-warning text-dark p-3 rounded-3 shrink-0">
                            <i className="ri-customer-service-2-line fs-3"></i>
                        </div>
                        <div>
                            <h5 className="fs-6 fw-bold mb-1">24/7 Dedicated Support</h5>
                            <p className="text-muted text-xs mb-0">Instant assistance for all orders & queries</p>
                        </div>
                    </div>
                </div>

                {/* Main Footer Links */}
                <div className="row g-4 mb-5">
                    {/* Brand Info */}
                    <div className="col-lg-4">
                        <Link href="/" className="d-flex align-items-center text-decoration-none mb-3">
                            {siteLogo ? (
                                <img src={siteLogo} alt={siteName} style={{ maxHeight: '45px' }} />
                            ) : (
                                <span className="fs-4 fw-bold text-white">{siteName}</span>
                            )}
                        </Link>
                        <p className="text-muted text-xs leading-relaxed mb-3">
                            {settings?.storefront_description || 'Your premier luxury ecommerce destination. Experience authentic craft, verified catalog, and seamless shopping powered by Antu Storefront Engine.'}
                        </p>
                        <div className="text-warning text-xs font-semibold d-flex align-items-center gap-1">
                            <i className="ri-sparkling-fill"></i>
                            <span>{settings?.storefront_tagline || 'Excellence in Fashion & Commerce'}</span>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div className="col-6 col-lg-2">
                        <h6 className="text-warning font-bold uppercase tracking-wider text-xs mb-3">Quick Navigation</h6>
                        <ul className="list-unstyled text-xs space-y-2 text-muted">
                            <li><Link href="/" className="text-slate-300 text-decoration-none hover-warning">Home</Link></li>
                            <li><Link href="/shop" className="text-slate-300 text-decoration-none hover-warning">Shop Catalog</Link></li>
                            <li><Link href="/shop?on_sale=1" className="text-slate-300 text-decoration-none hover-warning">Special Offers</Link></li>
                            <li><Link href="/login" className="text-slate-300 text-decoration-none hover-warning">Account Login</Link></li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div className="col-6 col-lg-3">
                        <h6 className="text-warning font-bold uppercase tracking-wider text-xs mb-3">Customer Support</h6>
                        <ul className="list-unstyled text-xs space-y-2 text-muted">
                            <li><span>Shipping & Delivery Policy</span></li>
                            <li><span>Return & Refund Guarantee</span></li>
                            <li><span>Terms & Conditions</span></li>
                            <li><span>Privacy Policy</span></li>
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div className="col-lg-3">
                        <h6 className="text-warning font-bold uppercase tracking-wider text-xs mb-3">Contact Information</h6>
                        <ul className="list-unstyled text-xs space-y-2 text-muted">
                            {settings?.contact_address && (
                                <li className="d-flex items-start gap-2">
                                    <i className="ri-map-pin-line text-warning"></i>
                                    <span>{settings.contact_address}</span>
                                </li>
                            )}
                            {settings?.contact_phone && (
                                <li className="d-flex items-center gap-2">
                                    <i className="ri-phone-line text-warning"></i>
                                    <span>{settings.contact_phone}</span>
                                </li>
                            )}
                            {settings?.contact_email && (
                                <li className="d-flex items-center gap-2">
                                    <i className="ri-mail-line text-warning"></i>
                                    <span>{settings.contact_email}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 border-top border-secondary border-opacity-50 d-flex flex-wrap justify-content-between align-items-center text-xs text-muted">
                    <p className="mb-0">{settings?.copyright_text || `${siteName} © ${new Date().getFullYear()}. All rights reserved.`}</p>
                    <div className="d-flex align-items-center gap-3">
                        <span>Antu Ecommerce Template</span>
                        <span>•</span>
                        <span>ORIO Engine v1.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
