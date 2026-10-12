import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';

function getValidImageUrl(c) {
    const raw = c?.image_url || (c?.images && c?.images[0]?.image_url) || c?.image || (c?.images && c?.images[0]?.image_path) || null;
    if (raw && typeof raw === 'string') {
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
            return raw;
        }
        if (/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(raw)) {
            return `/storage/${raw}`;
        }
    }
    return null;
}

export default function StorefrontLayout({ children, navCategories: directNavCategories, headerSolid = false }) {
    const { settings = {}, auth = {}, navCategories: sharedNavCategories = [] } = usePage().props;
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Mobile Footer Accordion States
    const [mobileFooterOpen, setMobileFooterOpen] = useState({});

    const toggleFooterSection = (key) => {
        setMobileFooterOpen((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const categories = (directNavCategories && directNavCategories.length > 0)
        ? directNavCategories
        : (sharedNavCategories || []);

    const siteName = settings.site_name || 'ORIO STYLE';
    const siteLogo = settings.site_logo || null;
    const currencySymbol = settings.currency_symbol || '৳';

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsCartOpen(false);
                setIsMobileMenuOpen(false);
                setIsSearchOpen(false);
            }
        };
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
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

    // Live search autocomplete debounced effect
    useEffect(() => {
        if (!isSearchOpen || searchQuery.trim().length < 2) {
            setSearchResults({ products: [], categories: [] });
            return;
        }

        const timer = setTimeout(() => {
            setIsSearching(true);
            axios.get(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
                .then(res => {
                    setSearchResults(res.data || { products: [], categories: [] });
                })
                .catch(() => {
                    setSearchResults({ products: [], categories: [] });
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery, isSearchOpen]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <div className="oubd-wrapper" style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* --- Desktop Main Header --- */}
            <header className={`oubd-header ${isScrolled || headerSolid ? 'scrolled' : ''}`}>
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
                    <nav className="oubd-nav-wrap">
                        <ul className="oubd-nav-menu">
                            <li>
                                <Link href="/">HOME</Link>
                            </li>

                            <li>
                                <Link href="/shop">SHOP</Link>
                            </li>

                            {categories && categories.slice(0, 4).map((cat) => {
                                const hasChildren = cat.children && cat.children.length > 0;
                                return (
                                    <li key={cat.id}>
                                        <Link href={`/shop?category=${cat.slug}`}>
                                            {cat.name}
                                            {hasChildren && <i className="ri-arrow-down-s-line" />}
                                        </Link>

                                        {hasChildren && (
                                            <ul className="oubd-dropdown">
                                                <li>
                                                    <Link href={`/shop?category=${cat.slug}`}>All {cat.name}</Link>
                                                </li>
                                                {cat.children.map((sub) => (
                                                    <li key={sub.id}>
                                                        <Link href={`/shop?category=${sub.slug}`}>{sub.name}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}

                            <li>
                                <Link href="/shop">ALL PRODUCTS</Link>
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

            {/* --- Mobile Header (Matching Mobile Reference Screenshot) --- */}
            <div className={`oubd-mobile-header ${isScrolled ? 'scrolled' : ''}`}>
                <button
                    type="button"
                    className="oubd-mobile-toggle p-0"
                    aria-label="Open Menu"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <i className="ri-menu-line" />
                </button>

                <Link href="/" className="oubd-brand-logo mx-auto">
                    {siteLogo ? (
                        <img src={siteLogo} alt={siteName} style={{ maxHeight: '30px' }} />
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
                        <li className="mb-2">
                            <Link href="/shop" className="d-block py-2 fw-bold text-dark text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>
                                SHOP
                            </Link>
                        </li>
                        {categories && categories.map((cat) => (
                            <li key={cat.id} className="mb-2">
                                <Link
                                    href={`/shop?category=${cat.slug}`}
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
                                                    href={`/shop?category=${sub.slug}`}
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
                            <Link href="/shop" className="d-block py-2 fw-bold text-dark text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>
                                ALL PRODUCTS
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* --- Live Search Overlay Modal --- */}
            {isSearchOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center p-3"
                    style={{ zIndex: 1200 }}
                    onClick={() => setIsSearchOpen(false)}
                >
                    <div
                        className="bg-white p-4 shadow-lg w-100 position-relative"
                        style={{ maxWidth: '650px', borderRadius: '8px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-3"
                            onClick={() => setIsSearchOpen(false)}
                        />
                        <h4 className="fw-bold mb-3 text-uppercase font-size-15 tracking-wider text-dark d-flex align-items-center gap-2">
                            <i className="ri-search-line text-warning" /> Search Catalog
                        </h4>
                        <form onSubmit={handleSearchSubmit} className="d-flex gap-2 mb-3">
                            <div className="position-relative flex-grow-1">
                                <input
                                    type="text"
                                    className="form-control form-control-lg font-size-14"
                                    placeholder="Search by product name, SKU, or brand..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    style={{ paddingRight: isSearching ? '40px' : '15px' }}
                                />
                                {isSearching && (
                                    <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                        <div className="spinner-border spinner-border-sm text-warning" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn btn-dark px-4 text-uppercase fw-bold font-size-13 tracking-wider">
                                Search
                            </button>
                        </form>

                        {/* Live Results Autocomplete Container */}
                        {searchQuery.trim().length >= 2 && (
                            <div className="search-autocomplete-panel border-top pt-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {/* Category Suggestions */}
                                {searchResults.categories && searchResults.categories.length > 0 && (
                                    <div className="mb-3">
                                        <span className="font-size-11 fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                            Suggested Categories
                                        </span>
                                        <div className="d-flex flex-wrap gap-1">
                                            {searchResults.categories.map((sc) => (
                                                <Link
                                                    key={sc.id}
                                                    href={`/shop?category=${sc.slug}`}
                                                    className="badge bg-light text-dark text-decoration-none px-2 py-1 font-size-12 hover-bg-warning transition-all border"
                                                    onClick={() => setIsSearchOpen(false)}
                                                >
                                                    {sc.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Product Suggestions */}
                                {searchResults.products && searchResults.products.length > 0 ? (
                                    <div>
                                        <span className="font-size-11 fw-bold text-muted text-uppercase tracking-wider d-block mb-2">
                                            Matching Products ({searchResults.products.length})
                                        </span>
                                        <div className="d-flex flex-column gap-2 mb-3">
                                            {searchResults.products.map((sp) => (
                                                <Link
                                                    key={sp.id}
                                                    href={`/shop?search=${encodeURIComponent(sp.name)}`}
                                                    className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none text-dark hover-bg-light transition-all border-bottom"
                                                    onClick={() => setIsSearchOpen(false)}
                                                >
                                                    <img
                                                        src={sp.image_url}
                                                        alt={sp.name}
                                                        className="rounded"
                                                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                                    />
                                                    <div className="flex-grow-1 min-width-0">
                                                        <h6 className="font-size-13 fw-semibold text-truncate mb-0">
                                                            {sp.name}
                                                        </h6>
                                                        <span className="font-size-11 text-muted">
                                                            {sp.category_name} {sp.brand_name ? `• ${sp.brand_name}` : ''}
                                                        </span>
                                                    </div>
                                                    <div className="text-end text-nowrap">
                                                        <span className="fw-bold font-size-13 text-dark">
                                                            {currencySymbol}{Number(sp.effective_price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        <Link
                                            href={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                                            className="btn btn-outline-dark btn-sm w-100 text-uppercase fw-bold font-size-12 py-2"
                                            onClick={() => setIsSearchOpen(false)}
                                        >
                                            View All Results in Shop →
                                        </Link>
                                    </div>
                                ) : (
                                    !isSearching && (
                                        <p className="text-muted font-size-13 text-center my-3">
                                            No products found matching "{searchQuery}".
                                        </p>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- Main Body Content --- */}
            <main className="flex-grow-1" style={{ width: '100%', paddingTop: headerSolid ? '75px' : '0' }}>
                {children}
            </main>

            {/* --- Modern Footer matching Screenshots --- */}
            <footer style={{ backgroundColor: '#ffffff', color: '#111111', borderTop: '1px solid #eeeeee', padding: '50px 0 24px 0', marginTop: 'auto' }}>
                <div className="container-fluid" style={{ maxWidth: '1600px' }}>
                    <div className="row g-4">
                        {/* Column 1: Logo, Investment Blurb, Social Media */}
                        <div className="col-lg-4 col-md-12 mb-3">
                            <Link href="/" className="oubd-brand-logo mb-3">
                                {siteLogo ? (
                                    <img src={siteLogo} alt={siteName} style={{ maxHeight: '38px' }} />
                                ) : (
                                    <span className="brand-text" style={{ fontSize: '26px' }}>{siteName}</span>
                                )}
                            </Link>
                            <p className="font-size-13 text-muted line-height-22 mb-2" style={{ maxWidth: '380px' }}>
                                Experience premium lifestyle and contemporary fashion curated by ORIO STYLE. Uncompromising craftsmanship, refined aesthetics, and everyday luxury.
                            </p>
                            <div className="mb-3">
                                <a href="javascript:void(0)" className="text-dark fw-bold font-size-13 text-decoration-underline">
                                    Discover Our Brand Story ↗
                                </a>
                            </div>

                            {/* Circular Social Icons */}
                            <div className="oubd-social-links">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="oubd-social-icon text-dark" style={{ borderColor: '#222' }}>
                                    <i className="ri-facebook-fill" />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="oubd-social-icon text-dark" style={{ borderColor: '#222' }}>
                                    <i className="ri-instagram-line" />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="oubd-social-icon text-dark" style={{ borderColor: '#222' }}>
                                    <i className="ri-youtube-fill" />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="oubd-social-icon text-dark" style={{ borderColor: '#222' }}>
                                    <i className="ri-linkedin-fill" />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="col-lg-2 col-md-4 col-12">
                            <div className="d-flex justify-content-between align-items-center mb-2 d-md-block">
                                <h5 className="fw-bold font-size-14 text-uppercase mb-0 mb-md-3">Quick Links</h5>
                                <button
                                    type="button"
                                    className="d-md-none btn btn-sm border-0 p-0 text-dark fs-5"
                                    onClick={() => toggleFooterSection('quickLinks')}
                                >
                                    {mobileFooterOpen.quickLinks ? '−' : '+'}
                                </button>
                            </div>
                            <div className={`d-md-block ${mobileFooterOpen.quickLinks ? 'd-block' : 'd-none'}`}>
                                <ul className="list-unstyled font-size-13">
                                    <li className="mb-2"><Link href="/" className="text-muted text-decoration-none">Store Locator</Link></li>
                                    <li className="mb-2"><Link href="/" className="text-muted text-decoration-none">About ORIO STYLE</Link></li>
                                    <li className="mb-2"><Link href="/" className="text-muted text-decoration-none">Blogs & Editorial</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Column 3: Terms of Use */}
                        <div className="col-lg-2 col-md-4 col-12">
                            <div className="d-flex justify-content-between align-items-center mb-2 d-md-block">
                                <h5 className="fw-bold font-size-14 text-uppercase mb-0 mb-md-3">Terms of Use</h5>
                                <button
                                    type="button"
                                    className="d-md-none btn btn-sm border-0 p-0 text-dark fs-5"
                                    onClick={() => toggleFooterSection('terms')}
                                >
                                    {mobileFooterOpen.terms ? '−' : '+'}
                                </button>
                            </div>
                            <div className={`d-md-block ${mobileFooterOpen.terms ? 'd-block' : 'd-none'}`}>
                                <ul className="list-unstyled font-size-13">
                                    <li className="mb-2"><Link href="/" className="text-muted text-decoration-none">Terms of Service</Link></li>
                                    <li className="mb-2"><Link href="/" className="text-muted text-decoration-none">Privacy Policy</Link></li>
                                    <li className="mb-2"><Link href="/" className="text-muted text-decoration-none">Refund Policy</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Column 4: Sign Up for Email */}
                        <div className="col-lg-4 col-md-4 col-12">
                            <div className="d-flex justify-content-between align-items-center mb-2 d-md-block">
                                <h5 className="fw-bold font-size-14 text-uppercase mb-0 mb-md-3">Sign Up for Email</h5>
                                <button
                                    type="button"
                                    className="d-md-none btn btn-sm border-0 p-0 text-dark fs-5"
                                    onClick={() => toggleFooterSection('email')}
                                >
                                    {mobileFooterOpen.email ? '−' : '+'}
                                </button>
                            </div>
                            <div className={`d-md-block ${mobileFooterOpen.email ? 'd-block' : 'd-none'}`}>
                                <p className="font-size-13 text-muted mb-3">
                                    Sign up to get first dibs on new arrivals, sales, exclusive content, events and more!
                                </p>
                                <form onSubmit={(e) => e.preventDefault()} className="d-flex">
                                    <input
                                        type="email"
                                        className="form-control rounded-0 font-size-13"
                                        placeholder="Enter email add..."
                                        style={{ borderColor: '#111' }}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-dark rounded-0 px-4 fw-bold font-size-12 text-uppercase"
                                        style={{ backgroundColor: '#111111' }}
                                    >
                                        Subscribe
                                    </button>
                                </form>
                            </div>
                        </div>
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

            {/* --- Mobile Fixed Bottom Navigation Bar --- */}
            <div className="oubd-bottom-nav">
                <a
                    href="https://wa.me/8801700000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="oubd-bottom-nav-item"
                    title="WhatsApp"
                >
                    <i className="ri-whatsapp-line" style={{ color: '#25D366' }} />
                </a>

                <button
                    type="button"
                    className="oubd-bottom-nav-item bg-transparent border-0"
                    onClick={() => setIsCartOpen(true)}
                    title="Cart"
                >
                    <i className="ri-shopping-bag-line" />
                    <span className="oubd-cart-badge">0</span>
                </button>

                <Link
                    href="/"
                    className="oubd-bottom-nav-item"
                    title="Store Locator"
                >
                    <i className="ri-map-pin-line" />
                </Link>

                <Link
                    href="/login"
                    className="oubd-bottom-nav-item"
                    title="Account"
                >
                    <i className="ri-user-line" />
                </Link>
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
