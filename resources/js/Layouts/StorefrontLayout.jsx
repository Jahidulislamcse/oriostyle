import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

function getValidImageUrl(c) {
    const raw = c?.image_url || (c?.images && c?.images[0]?.image_url) || null;
    if (raw && typeof raw === 'string') {
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/') || /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(raw)) {
            return raw;
        }
    }
    return null;
}

function getCategoryIconClass(c, isSub = false) {
    if (c?.icon && typeof c.icon === 'string') {
        if (c.icon.startsWith('ri-')) return c.icon;
        const iconLower = c.icon.toLowerCase();
        if (iconLower === 'shirt') return 'ri-t-shirt-line';
        if (iconLower === 'sparkles') return 'ri-sparkling-line';
        if (iconLower === 'footprints') return 'ri-footprint-line';
        if (iconLower === 'watch') return 'ri-time-line';
        if (iconLower === 'bag' || iconLower === 'handbag') return 'ri-handbag-line';
        if (iconLower === 'home') return 'ri-home-4-line';
        if (iconLower === 'phone' || iconLower === 'smartphone') return 'ri-smartphone-line';
    }

    const nameLower = (c?.name || c?.slug || '').toLowerCase();
    if (nameLower.includes('shirt') || nameLower.includes('polo') || nameLower.includes('pant') || nameLower.includes('trouser') || nameLower.includes('fashion') || nameLower.includes('men') || nameLower.includes('clothing') || nameLower.includes('denim')) {
        return 'ri-t-shirt-line';
    }
    if (nameLower.includes('women') || nameLower.includes('saree') || nameLower.includes('kurti') || nameLower.includes('dress') || nameLower.includes('beauty') || nameLower.includes('cosmetic') || nameLower.includes('jewel')) {
        return 'ri-sparkling-line';
    }
    if (nameLower.includes('shoe') || nameLower.includes('sneaker') || nameLower.includes('foot') || nameLower.includes('sandal') || nameLower.includes('boot')) {
        return 'ri-footprint-line';
    }
    if (nameLower.includes('watch') || nameLower.includes('clock') || nameLower.includes('time') || nameLower.includes('accessory') || nameLower.includes('belt') || nameLower.includes('wallet')) {
        return 'ri-time-line';
    }
    if (nameLower.includes('bag') || nameLower.includes('backpack') || nameLower.includes('luggage')) {
        return 'ri-handbag-line';
    }
    if (nameLower.includes('tech') || nameLower.includes('electronic') || nameLower.includes('phone') || nameLower.includes('gadget') || nameLower.includes('headphone')) {
        return 'ri-smartphone-line';
    }
    if (nameLower.includes('home') || nameLower.includes('living') || nameLower.includes('kitchen') || nameLower.includes('decor')) {
        return 'ri-home-4-line';
    }

    return isSub ? 'ri-price-tag-3-line' : 'ri-folder-3-line';
}

export default function StorefrontLayout({ children, navCategories: directNavCategories }) {
    const { settings = {}, auth = {}, navCategories: sharedNavCategories = [] } = usePage().props;
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);

    const categories = (directNavCategories && directNavCategories.length > 0)
        ? directNavCategories
        : (sharedNavCategories || []);

    const siteName = settings.site_name || 'OUBD';
    const siteLogo = settings.site_logo || null;
    const currencySymbol = settings.currency_symbol || '৳';

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsCartOpen(false);
                setIsWishlistOpen(false);
                setIsMobileMenuOpen(false);
                setIsSearchOpen(false);
            }
        };
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <div className="oubd-wrapper" style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* --- Desktop Main Header --- */}
            <header className="oubd-header">
                <div className="oubd-header-inner">
                    {/* Left Brand Logo */}
                    <Link href="/" className="oubd-brand-logo">
                        {siteLogo ? (
                            <img src={siteLogo} alt={siteName} />
                        ) : (
                            <span className="brand-text">{siteName}</span>
                        )}
                    </Link>

                    {/* Center Navigation Menu */}
                    <nav>
                        <ul className="oubd-nav-menu">
                            <li className="active">
                                <Link href="/">HOME</Link>
                            </li>

                            {categories && categories.slice(0, 4).map((cat) => {
                                const hasChildren = cat.children && cat.children.length > 0;
                                return (
                                    <li key={cat.id}>
                                        <Link href={`/?category=${cat.slug}`}>
                                            {cat.name}
                                            {hasChildren && <i className="ri-arrow-down-s-line" />}
                                        </Link>

                                        {hasChildren && (
                                            <ul className="oubd-dropdown">
                                                <li>
                                                    <Link href={`/?category=${cat.slug}`}>All {cat.name}</Link>
                                                </li>
                                                {cat.children.map((sub) => (
                                                    <li key={sub.id}>
                                                        <Link href={`/?category=${sub.slug}`}>{sub.name}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}

                            <li>
                                <Link href="/#featured-products">ALL PRODUCTS</Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Right Utility Icons */}
                    <div className="oubd-header-actions">
                        <button
                            type="button"
                            className="oubd-action-btn"
                            title="Search"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <i className="ri-search-line" />
                        </button>

                        <div className="position-relative dropdown">
                            <a
                                href="javascript:void(0)"
                                className="oubd-action-btn"
                                title="Account"
                                data-bs-toggle="dropdown"
                            >
                                <i className="ri-user-line" />
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 py-2" style={{ minWidth: '180px' }}>
                                {auth?.user ? (
                                    <>
                                        <li className="px-3 py-1 fw-bold text-muted font-size-12">
                                            {auth.user.name}
                                        </li>
                                        {auth.user.role === 'admin' || auth.user.role === 'staff' ? (
                                            <li>
                                                <Link href="/admin/dashboard" className="dropdown-item py-2">Admin Dashboard</Link>
                                            </li>
                                        ) : null}
                                        <li>
                                            <Link href="/logout" method="post" as="button" className="dropdown-item py-2 text-danger">Logout</Link>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link href="/login" className="dropdown-item py-2">Login</Link></li>
                                        <li><Link href="/register" className="dropdown-item py-2">Register</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <button
                            type="button"
                            className="oubd-action-btn"
                            title="Cart"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <i className="ri-shopping-bag-line" />
                            <span className="oubd-cart-badge">0</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- Mobile Header --- */}
            <div className="oubd-mobile-header">
                <button
                    type="button"
                    className="oubd-mobile-toggle"
                    aria-label="Open Menu"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <i className="ri-menu-line" />
                </button>

                <Link href="/" className="oubd-brand-logo">
                    {siteLogo ? (
                        <img src={siteLogo} alt={siteName} style={{ maxHeight: '32px' }} />
                    ) : (
                        <span className="brand-text" style={{ fontSize: '20px' }}>{siteName}</span>
                    )}
                </Link>

                <div className="d-flex align-items-center gap-3">
                    <button
                        type="button"
                        className="oubd-action-btn"
                        onClick={() => setIsSearchOpen(true)}
                        aria-label="Search"
                    >
                        <i className="ri-search-line" />
                    </button>
                    <button
                        type="button"
                        className="oubd-action-btn position-relative"
                        onClick={() => setIsCartOpen(true)}
                        aria-label="Cart"
                    >
                        <i className="ri-shopping-bag-line" />
                        <span className="oubd-cart-badge">0</span>
                    </button>
                </div>
            </div>

            {/* --- Mobile Drawer Menu --- */}
            {isMobileMenuOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1100 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <div
                className={`position-fixed top-0 start-0 h-100 bg-white shadow-lg d-flex flex-column`}
                style={{
                    width: '300px',
                    maxWidth: '85vw',
                    zIndex: 1110,
                    transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out',
                }}
            >
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    <span className="fw-bold fs-6 text-uppercase letter-spacing-1">{siteName}</span>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                </div>
                <div className="overflow-y-auto p-3 flex-grow-1">
                    <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                            <Link href="/" className="d-block py-2 fw-bold text-dark text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>
                                HOME
                            </Link>
                        </li>
                        {categories && categories.map((cat) => (
                            <li key={cat.id} className="mb-2">
                                <Link
                                    href={`/?category=${cat.slug}`}
                                    className="d-block py-2 fw-bold text-dark text-decoration-none text-uppercase"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {cat.name}
                                </Link>
                                {cat.children && cat.children.length > 0 && (
                                    <ul className="list-unstyled ps-3 mt-1">
                                        {cat.children.map((sub) => (
                                            <li key={sub.id} className="mb-1">
                                                <Link
                                                    href={`/?category=${sub.slug}`}
                                                    className="d-block py-1 text-muted text-decoration-none text-uppercase font-size-13"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                        <li className="mt-3 pt-3 border-top">
                            <Link href="/#featured-products" className="d-block py-2 fw-bold text-dark text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>
                                ALL PRODUCTS
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* --- Search Overlay Modal --- */}
            {isSearchOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center p-3"
                    style={{ zIndex: 1200 }}
                    onClick={() => setIsSearchOpen(false)}
                >
                    <div
                        className="bg-white p-4 shadow-lg w-100 position-relative"
                        style={{ maxWidth: '600px', borderRadius: '4px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-3"
                            onClick={() => setIsSearchOpen(false)}
                        />
                        <h4 className="fw-bold mb-3 text-uppercase font-size-16">Search Products</h4>
                        <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by product name, category, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="btn btn-dark px-4 text-uppercase fw-bold font-size-13">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Main Body Content --- */}
            <main className="flex-grow-1" style={{ width: '100%' }}>
                {children}
            </main>

            {/* --- Modern Footer --- */}
            <footer style={{ backgroundColor: '#111111', color: '#aaaaaa', padding: '50px 0 20px 0', marginTop: 'auto' }}>
                <div className="container-fluid" style={{ maxWidth: '1600px' }}>
                    <div className="row g-4 mb-5">
                        <div className="col-lg-4 col-md-6">
                            <h4 className="text-white fw-bold mb-3 text-uppercase font-size-16">{siteName}</h4>
                            <p className="font-size-14 line-height-24 text-muted mb-4">
                                {settings.site_tagline || 'Purpose & Style with Premium Quality Collections.'}
                            </p>
                            <ul className="list-unstyled font-size-13 text-muted">
                                {settings.store_address && (
                                    <li className="mb-2"><i className="ri-map-pin-line me-2 text-white" />{settings.store_address}</li>
                                )}
                                {settings.support_phone && (
                                    <li className="mb-2"><i className="ri-phone-line me-2 text-white" /><a href={`tel:${settings.support_phone}`} className="text-muted text-decoration-none">{settings.support_phone}</a></li>
                                )}
                                {settings.support_email && (
                                    <li><i className="ri-mail-line me-2 text-white" /><a href={`mailto:${settings.support_email}`} className="text-muted text-decoration-none">{settings.support_email}</a></li>
                                )}
                            </ul>
                        </div>

                        <div className="col-lg-2 col-md-6 col-6">
                            <h5 className="text-white fw-bold mb-3 text-uppercase font-size-14">Quick Links</h5>
                            <ul className="list-unstyled font-size-13">
                                <li className="mb-2"><Link href="/" className="text-muted text-decoration-none">Home</Link></li>
                                <li className="mb-2"><a href="#new-arrivals" className="text-muted text-decoration-none">New Arrivals</a></li>
                                <li className="mb-2"><a href="#featured-products" className="text-muted text-decoration-none">Featured</a></li>
                                <li><Link href="/login" className="text-muted text-decoration-none">My Account</Link></li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6 col-6">
                            <h5 className="text-white fw-bold mb-3 text-uppercase font-size-14">Collections</h5>
                            <ul className="list-unstyled font-size-13">
                                {categories && categories.slice(0, 6).map((cat) => (
                                    <li key={cat.id} className="mb-2">
                                        <Link href={`/?category=${cat.slug}`} className="text-muted text-decoration-none text-capitalize">
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <h5 className="text-white fw-bold mb-3 text-uppercase font-size-14">Customer Support</h5>
                            <ul className="list-unstyled font-size-13 text-muted">
                                <li className="mb-2">Hours: {settings.business_hours || 'Sat - Thu: 9:00 AM - 9:00 PM'}</li>
                                <li className="mb-2">Inside City Delivery: {currencySymbol}{parseFloat(settings.shipping_charge_inside || 70).toFixed(2)}</li>
                                <li>Outside City Delivery: {currencySymbol}{parseFloat(settings.shipping_charge_outside || 130).toFixed(2)}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-top border-secondary pt-3 d-flex flex-wrap justify-content-between align-items-center font-size-12 text-muted">
                        <p className="mb-0">{settings.copyright_text || '© 2026 ORIO STYLE LTD. All rights reserved.'}</p>
                        <p className="mb-0">Secure Shopping & Fast Delivery</p>
                    </div>
                </div>
            </footer>

            {/* --- Cart Slide-over Drawer --- */}
            {isCartOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1150 }}
                    onClick={() => setIsCartOpen(false)}
                />
            )}
            <div
                className="position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column"
                style={{
                    width: '360px',
                    maxWidth: '90vw',
                    zIndex: 1160,
                    transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                }}
            >
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    <span className="fw-bold fs-6 text-uppercase">Shopping Cart</span>
                    <button type="button" className="btn-close" onClick={() => setIsCartOpen(false)} />
                </div>
                <div className="flex-grow-1 p-4 d-flex flex-column align-items-center justify-content-center text-center text-muted">
                    <i className="ri-shopping-bag-line display-4 text-muted mb-2" />
                    <p className="mb-0 font-size-14">Your shopping cart is currently empty.</p>
                </div>
                <div className="p-3 border-top bg-light">
                    <div className="d-flex justify-content-between font-size-14 fw-bold mb-3">
                        <span>Subtotal:</span>
                        <span>{currencySymbol}0.00</span>
                    </div>
                    <button
                        type="button"
                        className="btn btn-dark w-100 py-2 text-uppercase fw-bold font-size-13"
                        onClick={() => setIsCartOpen(false)}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>

            {/* --- Floating Back to Top Button --- */}
            {showBackToTop && (
                <button
                    type="button"
                    className="oubd-back-to-top"
                    onClick={scrollToTop}
                    title="Back to Top"
                    aria-label="Back to Top"
                >
                    <i className="ri-arrow-up-s-line" />
                </button>
            )}
        </div>
    );
}
