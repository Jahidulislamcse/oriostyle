import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
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
    const { settings = {}, auth = {}, navCategories: sharedNavCategories = [], cart = {} } = usePage().props;
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
    const [couponInput, setCouponInput] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponLocalError, setCouponLocalError] = useState(null);

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

        const handleOpenCart = () => setIsCartOpen(true);
        window.addEventListener('open-cart', handleOpenCart);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('open-cart', handleOpenCart);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleUpdateQuantity = (cartItemId, newQty) => {
        router.patch(
            route('cart.items.update', cartItemId),
            { quantity: newQty },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleRemoveItem = (cartItemId) => {
        router.delete(
            route('cart.items.destroy', cartItemId),
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleClearCart = () => {
        if (confirm('Are you sure you want to clear your shopping bag?')) {
            router.delete(
                route('cart.clear'),
                { preserveScroll: true, preserveState: true }
            );
        }
    };

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (!couponInput.trim() || isApplyingCoupon) return;

        setIsApplyingCoupon(true);
        setCouponLocalError(null);

        router.post(
            route('cart.coupon.apply'),
            { code: couponInput.trim() },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setCouponInput('');
                    setCouponLocalError(null);
                },
                onError: (errors) => {
                    setCouponLocalError(errors?.coupon || 'Failed to apply coupon.');
                },
                onFinish: () => {
                    setIsApplyingCoupon(false);
                },
            }
        );
    };

    const handleRemoveCoupon = () => {
        router.delete(
            route('cart.coupon.remove'),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setCouponLocalError(null);
                },
            }
        );
    };

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
                            <span className="oubd-cart-badge">{cart?.count || 0}</span>
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
                        <span className="oubd-cart-badge">{cart?.count || 0}</span>
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
                    width: '420px',
                    maxWidth: '92vw',
                    zIndex: 1160,
                    transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                }}
            >
                {/* Drawer Header */}
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
                    <div className="d-flex align-items-center gap-2">
                        <i className="ri-shopping-bag-3-line font-size-18 text-warning" />
                        <span className="fw-bold fs-6 text-uppercase text-dark tracking-wider">
                            Shopping Bag
                        </span>
                        <span className="badge bg-dark rounded-pill font-size-11 px-2 py-1">
                            {cart?.count || 0}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setIsCartOpen(false)}
                    />
                </div>

                {/* Free Shipping Progress Notification */}
                {(cart?.count || 0) > 0 && (
                    <div className="p-3 bg-light border-bottom">
                        {cart.is_free_shipping ? (
                            <div className="d-flex align-items-center gap-2 text-success font-size-12 fw-bold">
                                <i className="ri-truck-fill font-size-16" />
                                <span>🎉 Congratulations! You qualify for FREE Delivery!</span>
                            </div>
                        ) : (
                            <div>
                                <div className="d-flex justify-content-between align-items-center font-size-12 mb-1">
                                    <span className="text-muted">
                                        Add <strong className="text-dark">{currencySymbol}{Number(cart.amount_for_free_shipping || 0).toLocaleString()}</strong> more for Free Delivery
                                    </span>
                                    <span className="fw-bold text-dark">{cart.free_shipping_progress || 0}%</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{ width: `${cart.free_shipping_progress || 0}%` }}
                                        aria-valuenow={cart.free_shipping_progress || 0}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Drawer Content / Items List */}
                <div className="flex-grow-1 overflow-y-auto p-3">
                    {cart?.items && cart.items.length > 0 ? (
                        <div className="d-flex flex-column gap-3">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="d-flex gap-3 pb-3 border-bottom position-relative align-items-start"
                                >
                                    {/* Thumbnail */}
                                    <Link
                                        href={`/products/${item.product_slug}`}
                                        className="flex-shrink-0 border rounded overflow-hidden bg-light"
                                        style={{ width: '70px', height: '85px' }}
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.product_name}
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                                <i className="ri-image-line font-size-20" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-grow-1 min-width-0">
                                        <Link
                                            href={`/products/${item.product_slug}`}
                                            className="text-dark fw-bold font-size-13 text-decoration-none text-truncate d-block mb-1 hover-text-warning"
                                            onClick={() => setIsCartOpen(false)}
                                        >
                                            {item.product_name}
                                        </Link>

                                        {item.variant_summary && (
                                            <span className="badge bg-light text-muted border font-size-11 mb-1.5 d-inline-block">
                                                {item.variant_summary}
                                            </span>
                                        )}

                                        <div className="d-flex align-items-center justify-content-between mt-2">
                                            {/* Quantity Switcher */}
                                            <div className="d-flex align-items-center border rounded bg-white">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link text-dark p-0 d-flex align-items-center justify-content-center text-decoration-none"
                                                    style={{ width: '28px', height: '28px' }}
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    title="Decrease quantity"
                                                >
                                                    <i className="ri-subtract-line font-size-12" />
                                                </button>
                                                <span className="px-2 font-size-12 fw-bold font-mono">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link text-dark p-0 d-flex align-items-center justify-content-center text-decoration-none"
                                                    style={{ width: '28px', height: '28px' }}
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.available_stock}
                                                    title={item.quantity >= item.available_stock ? 'Max available stock reached' : 'Increase quantity'}
                                                >
                                                    <i className="ri-add-line font-size-12" />
                                                </button>
                                            </div>

                                            {/* Line Total */}
                                            <div className="text-end">
                                                <span className="fw-bold font-size-13 text-dark font-mono">
                                                    {currencySymbol}{Number(item.line_total).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        type="button"
                                        className="btn btn-sm text-muted p-1 hover-text-danger border-0"
                                        onClick={() => handleRemoveItem(item.id)}
                                        title="Remove item"
                                    >
                                        <i className="ri-delete-bin-line font-size-15" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center text-muted p-4">
                            <div className="w-16 h-16 rounded-circle bg-light d-flex align-items-center justify-content-center mb-3 text-muted">
                                <i className="ri-shopping-bag-3-line display-5 opacity-50" />
                            </div>
                            <h5 className="fw-bold text-dark font-size-16 mb-1">Your Shopping Bag is Empty</h5>
                            <p className="font-size-13 text-muted mb-4" style={{ maxWidth: '240px' }}>
                                Looks like you haven't added anything to your cart yet.
                            </p>
                            <Link
                                href="/shop"
                                className="btn btn-dark text-uppercase fw-bold font-size-12 px-4 py-2"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Explore Collections
                            </Link>
                        </div>
                    )}
                </div>

                {/* Drawer Footer */}
                {cart?.items && cart.items.length > 0 && (
                    <div className="p-3 border-top bg-light">
                        {/* Promotional Coupon Box */}
                        <div className="mb-3 pb-3 border-bottom">
                            {cart.coupon ? (
                                <div className="d-flex align-items-center justify-content-between p-2 rounded bg-white border border-success border-opacity-50">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="ri-coupon-3-fill text-success font-size-16" />
                                        <div>
                                            <span className="fw-bold text-success font-size-12 tracking-wider">
                                                {cart.coupon.code}
                                            </span>
                                            <span className="text-muted font-size-11 d-block">
                                                Saved {currencySymbol}{Number(cart.discount_amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                                        title="Remove coupon"
                                    >
                                        <i className="ri-close-line font-size-18" />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleApplyCoupon} className="d-flex flex-column gap-1">
                                    <div className="input-group input-group-sm">
                                        <input
                                            type="text"
                                            className="form-control text-uppercase font-size-12"
                                            placeholder="PROMO CODE (e.g. SAVE15)"
                                            value={couponInput}
                                            onChange={(e) => {
                                                setCouponInput(e.target.value.toUpperCase());
                                                setCouponLocalError(null);
                                            }}
                                            disabled={isApplyingCoupon}
                                            style={{ letterSpacing: '0.5px' }}
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-dark fw-bold font-size-11 text-uppercase px-3"
                                            disabled={isApplyingCoupon || !couponInput.trim()}
                                        >
                                            {isApplyingCoupon ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                            ) : (
                                                'Apply'
                                            )}
                                        </button>
                                    </div>
                                    {(couponLocalError || cart.coupon_error) && (
                                        <span className="text-danger font-size-11 mt-1 d-block">
                                            {couponLocalError || cart.coupon_error}
                                        </span>
                                    )}
                                </form>
                            )}
                        </div>

                        {/* Order Subtotal Breakdown */}
                        <div className="d-flex justify-content-between font-size-13 text-muted mb-1">
                            <span>Subtotal</span>
                            <span className="font-mono text-dark">
                                {currencySymbol}{Number(cart.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {Number(cart.discount_amount || 0) > 0 && (
                            <div className="d-flex justify-content-between font-size-13 text-success mb-1">
                                <span>Coupon Savings</span>
                                <span className="font-mono">
                                    -{currencySymbol}{Number(cart.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}

                        <div className="d-flex justify-content-between font-size-15 fw-bold mb-1 pt-2 border-top">
                            <span className="text-uppercase text-dark font-size-12">Estimated Total</span>
                            <span className="font-mono text-dark font-size-16">
                                {currencySymbol}{Number(cart.grand_total || cart.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        <p className="font-size-11 text-muted mb-3">
                            Taxes and shipping calculated at checkout.
                        </p>

                        <div className="d-flex flex-column gap-2">
                            <Link
                                href="/shop"
                                className="btn btn-dark w-100 py-3 text-uppercase fw-bold font-size-13 tracking-wider d-flex align-items-center justify-content-center gap-2 shadow-xs"
                                onClick={() => setIsCartOpen(false)}
                            >
                                <span>Proceed to Checkout</span>
                                <i className="ri-arrow-right-line" />
                            </Link>

                            <div className="d-flex justify-content-between align-items-center pt-2">
                                <button
                                    type="button"
                                    onClick={handleClearCart}
                                    className="btn btn-sm btn-link text-muted font-size-12 text-decoration-none p-0 hover-text-danger"
                                >
                                    Clear Bag
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCartOpen(false)}
                                    className="btn btn-sm btn-link text-dark font-size-12 text-decoration-none p-0 fw-semibold"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 pt-2 border-top text-center text-muted font-size-11 d-flex align-items-center justify-content-center gap-1">
                            <i className="ri-shield-check-line text-warning font-size-14" />
                            <span>100% Genuine • Fast Delivery in Bangladesh</span>
                        </div>
                    </div>
                )}
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
                    <span className="oubd-cart-badge">{cart?.count || 0}</span>
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
