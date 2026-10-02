import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function StorefrontLayout({ children, navCategories = [] }) {
    const { settings = {}, auth = {} } = usePage().props;
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const siteName = settings.site_name || 'ORIO STYLE';
    const siteLogo = settings.site_logo || '/storefront/img/logo/logo.png';
    const currencySymbol = settings.currency_symbol || '৳';

    return (
        <div className="wrapper sb-default">
            {/* Mobile Sidebar Category Overlay */}
            {isSidebarOpen && (
                <div className="mn-sidebar-overlay active" onClick={() => setIsSidebarOpen(false)} />
            )}
            <div className={`mn-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="mn-sidebar-body">
                    <button
                        type="button"
                        className="side-close"
                        title="Close"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <ul className="mn-sb-list">
                        <li className="mn-sb-title condense">
                            <span>Categories</span>
                        </li>
                        {navCategories && navCategories.length > 0 ? (
                            navCategories.map((cat) => (
                                <li key={cat.id} className="mn-sb-item sb-drop-item">
                                    <Link
                                        href={`/?category=${cat.slug}`}
                                        className="mn-drop-toggle"
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <img
                                            src={cat.icon || '/storefront/img/icons/clothes-2.svg'}
                                            alt={cat.name}
                                        />
                                        <span className="condense">{cat.name}</span>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="mn-sb-item sb-drop-item">
                                <Link href="/" className="mn-drop-toggle">
                                    <span className="condense">All Products</span>
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Main Storefront Header */}
            <header>
                <div className="mn-header">
                    <div className="mn-header-items">
                        <div className="left-header">
                            <button
                                type="button"
                                className="mn-toggle-sidebar border-0 bg-transparent"
                                title="Open Categories"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <span className="outer-ring">
                                    <span className="inner-ring" />
                                </span>
                            </button>
                            <Link href="/" className="logo">
                                <img src={siteLogo} alt={siteName} style={{ maxHeight: '40px' }} />
                            </Link>
                            <button
                                type="button"
                                className="mn-toggle-menu border-0 bg-transparent"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <div className="header-icon">
                                    <i className="ri-menu-3-fill" />
                                </div>
                            </button>
                        </div>

                        <div className="right-header">
                            {/* Desktop Menu */}
                            <div id="mn-main-menu-desk" className="d-none d-lg-block sticky-nav">
                                <div className="nav-desk">
                                    <div className="row">
                                        <div className="col-md-12 align-self-center">
                                            <div className="mn-main-menu">
                                                <ul>
                                                    <li className="non-drop">
                                                        <Link href="/">Home</Link>
                                                    </li>
                                                    <li className="non-drop">
                                                        <a href="#featured-products">Featured</a>
                                                    </li>
                                                    <li className="non-drop">
                                                        <a href="#new-arrivals">New Arrivals</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Icons Tool Header */}
                            <div className="mn-tool-icons">
                                <div className="mn-tool-user">
                                    <a href="#" className="mn-main-user" title="Account">
                                        <svg className="svg-icon" viewBox="0 0 1024 1024" version="1.1">
                                            <path d="M512.476 648.247c-170.169 0-308.118-136.411-308.118-304.681 0-168.271 137.949-304.681 308.118-304.681 170.169 0 308.119 136.411 308.119 304.681C820.594 511.837 682.645 648.247 512.476 648.247L512.476 648.247zM512.476 100.186c-135.713 0-246.12 109.178-246.12 243.381 0 134.202 110.407 243.381 246.12 243.381 135.719 0 246.126-109.179 246.126-243.381C758.602 209.364 648.195 100.186 512.476 100.186L512.476 100.186zM935.867 985.115l-26.164 0c-9.648 0-17.779-6.941-19.384-16.35-2.646-15.426-6.277-30.52-11.142-44.95-24.769-87.686-81.337-164.13-159.104-214.266-63.232 35.203-134.235 53.64-207.597 53.64-73.555 0-144.73-18.537-208.084-53.922-78 50.131-134.75 126.68-159.564 214.549 0 0-4.893 18.172-11.795 46.4-2.136 8.723-10.035 14.9-19.112 14.9L88.133 985.116c-9.415 0-16.693-8.214-15.47-17.452C91.698 824.084 181.099 702.474 305.51 637.615c58.682 40.472 129.996 64.267 206.966 64.267 76.799 0 147.968-23.684 206.584-63.991 124.123 64.932 213.281 186.403 232.277 329.772C952.56 976.901 945.287 985.115 935.867 985.115L935.867 985.115z" />
                                        </svg>
                                    </a>
                                    <ul className="sub-menu">
                                        {auth?.user ? (
                                            <>
                                                {auth.user.role === 'admin' || auth.user.role === 'staff' ? (
                                                    <li>
                                                        <Link href="/admin/dashboard">Admin Dashboard</Link>
                                                    </li>
                                                ) : null}
                                                <li>
                                                    <Link href="/logout" method="post" as="button" className="w-100 text-start border-0 bg-transparent">
                                                        Logout
                                                    </Link>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li>
                                                    <Link href="/login">Login</Link>
                                                </li>
                                                <li>
                                                    <Link href="/register">Register</Link>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                                <div className="mn-tool-wish">
                                    <button
                                        type="button"
                                        className="mn-main-wishlist border-0 bg-transparent p-0"
                                        title="Wishlist"
                                        onClick={() => setIsWishlistOpen(true)}
                                    >
                                        <span className="label lbl-1">0</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                                            <path d="M474.644 74.27C449.391 45.616 414.358 29.836 376 29.836c-53.948 0-88.103 32.22-107.255 59.25-4.969 7.014-9.196 14.047-12.745 20.665-3.549-6.618-7.775-13.651-12.745-20.665-19.152-27.03-53.307-59.25-107.255-59.25-38.358 0-73.391 15.781-98.645 44.435C13.267 101.605 0 138.213 0 177.351c0 42.603 16.633 82.228 52.345 124.7 31.917 37.96 77.834 77.088 131.005 122.397 19.813 16.884 40.302 34.344 62.115 53.429l.655.574c2.828 2.476 6.354 3.713 9.88 3.713s7.052-1.238 9.88-3.713l.655-.574c21.813-19.085 42.302-36.544 62.118-53.431 53.168-45.306 99.085-84.434 131.002-122.395C495.367 259.578 512 219.954 512 177.351c0-39.138-13.267-75.746-37.356-103.081z" fill="#000000" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mn-tool-cart">
                                    <button
                                        type="button"
                                        className="mn-main-cart border-0 bg-transparent p-0"
                                        title="Cart"
                                        onClick={() => setIsCartOpen(true)}
                                    >
                                        <span className="label lbl-2">0</span>
                                        <svg className="svg-icon" viewBox="0 0 1024 1024" version="1.1">
                                            <path d="M351.552 831.424c-35.328 0-63.968 28.64-63.968 63.968 0 35.328 28.64 63.968 63.968 63.968 35.328 0 63.968-28.64 63.968-63.968C415.52 860.064 386.88 831.424 351.552 831.424L351.552 831.424 351.552 831.424zM799.296 831.424c-35.328 0-63.968 28.64-63.968 63.968 0 35.328 28.64 63.968 63.968 63.968 35.328 0 63.968-28.64 63.968-63.968C863.264 860.064 834.624 831.424 799.296 831.424L799.296 831.424 799.296 831.424zM862.752 799.456 343.264 799.456c-46.08 0-86.592-36.448-92.224-83.008L196.8 334.592 165.92 156.128c-1.92-15.584-16.128-28.288-29.984-28.288L95.2 127.84c-17.664 0-32-14.336-32-31.968 0-17.664 14.336-32 32-32l40.736 0c46.656 0 87.616 36.448 93.28 83.008l30.784 177.792 54.464 383.488c1.792 14.848 15.232 27.36 28.768 27.36l519.488 0c17.696 0 32 14.304 32 31.968S880.416 799.456 862.752 799.456L862.752 799.456z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Body */}
            <main>{children}</main>

            {/* Storefront Footer */}
            <footer>
                <div className="mn-footer">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-3 col-sm-6 m-b-30">
                                <div className="mn-footer-widget">
                                    <h4 className="mn-footer-heading">About Us</h4>
                                    <p className="mn-footer-text">
                                        {settings.site_tagline || 'Enterprise Single-Vendor E-Commerce Platform'}
                                    </p>
                                    <ul className="mn-footer-links">
                                        {settings.store_address && (
                                            <li><i className="ri-map-pin-line me-2" />{settings.store_address}</li>
                                        )}
                                        {settings.support_phone && (
                                            <li><i className="ri-phone-line me-2" /><a href={`tel:${settings.support_phone}`}>{settings.support_phone}</a></li>
                                        )}
                                        {settings.support_email && (
                                            <li><i className="ri-mail-line me-2" /><a href={`mailto:${settings.support_email}`}>{settings.support_email}</a></li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-3 col-sm-6 m-b-30">
                                <div className="mn-footer-widget">
                                    <h4 className="mn-footer-heading">Quick Links</h4>
                                    <ul className="mn-footer-links">
                                        <li><Link href="/">Home</Link></li>
                                        <li><a href="#featured-products">Featured Products</a></li>
                                        <li><a href="#new-arrivals">New Arrivals</a></li>
                                        <li><Link href="/login">My Account</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-3 col-sm-6 m-b-30">
                                <div className="mn-footer-widget">
                                    <h4 className="mn-footer-heading">Categories</h4>
                                    <ul className="mn-footer-links">
                                        {navCategories && navCategories.slice(0, 5).map((cat) => (
                                            <li key={cat.id}>
                                                <Link href={`/?category=${cat.slug}`}>{cat.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-3 col-sm-6 m-b-30">
                                <div className="mn-footer-widget">
                                    <h4 className="mn-footer-heading">Customer Care</h4>
                                    <ul className="mn-footer-links">
                                        <li><span>Hours: {settings.business_hours || 'Sat - Thu: 9:00 AM - 9:00 PM'}</span></li>
                                        <li><span>Shipping Inside: {currencySymbol}{parseFloat(settings.shipping_charge_inside || 70).toFixed(2)}</span></li>
                                        <li><span>Shipping Outside: {currencySymbol}{parseFloat(settings.shipping_charge_outside || 130).toFixed(2)}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="row pt-4 border-top">
                            <div className="col-md-6">
                                <p className="mb-0 text-muted">{settings.copyright_text || '© 2026 ORIO STYLE LTD. All rights reserved.'}</p>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <img src="/storefront/img/banner/payment.png" alt="Payment Methods" style={{ maxHeight: '30px' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Cart Slide-over Drawer */}
            {isCartOpen && <div className="mn-side-cart-overlay active" onClick={() => setIsCartOpen(false)} />}
            <div id="mn-side-cart" className={`mn-side-cart ${isCartOpen ? 'open' : ''}`}>
                <div className="mn-cart-inner">
                    <div className="mn-cart-top">
                        <div className="mn-cart-title">
                            <span className="cart_title">My Cart</span>
                            <button type="button" className="mn-cart-close border-0 bg-transparent" onClick={() => setIsCartOpen(false)}>
                                <i className="ri-close-line" />
                            </button>
                        </div>
                        <ul className="mn-cart-pro-items">
                            <li className="cart-sidebar-list text-center text-muted py-4">
                                <p className="mb-0">Your shopping cart is currently empty.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="mn-cart-bottom">
                        <div className="cart-sub-total d-flex justify-content-between my-3">
                            <span className="text-muted">Subtotal:</span>
                            <span className="cart-sub-total-amount fw-bold">{currencySymbol}0.00</span>
                        </div>
                        <div className="cart_btn">
                            <button type="button" className="mn-btn-1 w-100 border-0" onClick={() => setIsCartOpen(false)}>
                                <span>Continue Shopping<i className="ri-arrow-right-s-line" /></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wishlist Slide-over Drawer */}
            {isWishlistOpen && <div className="mn-side-wishlist-overlay active" onClick={() => setIsWishlistOpen(false)} />}
            <div id="mn-side-wishlist" className={`mn-side-wishlist ${isWishlistOpen ? 'open' : ''}`}>
                <div className="mn-wishlist-inner">
                    <div className="mn-wishlist-top">
                        <div className="mn-wishlist-title">
                            <span className="wishlist_title">My Wishlist</span>
                            <button type="button" className="mn-wishlist-close border-0 bg-transparent" onClick={() => setIsWishlistOpen(false)}>
                                <i className="ri-close-line" />
                            </button>
                        </div>
                        <ul className="mn-wishlist-pro-items">
                            <li className="wishlist-sidebar-list text-center text-muted py-4">
                                <p className="mb-0">Your wishlist is currently empty.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="mn-wishlist-bottom">
                        <div className="wishlist_btn">
                            <button type="button" className="mn-btn-1 w-100 border-0" onClick={() => setIsWishlistOpen(false)}>
                                <span>Explore Shop<i className="ri-arrow-right-s-line" /></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
