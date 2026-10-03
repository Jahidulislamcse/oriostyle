import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function StorefrontLayout({ children, navCategories = [] }) {
    const { settings = {}, auth = {} } = usePage().props;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 992 : false
    );
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openSubMenus, setOpenSubMenus] = useState({});

    const siteName = settings.site_name || 'ORIO STYLE';
    const siteLogo = settings.site_logo || '/storefront/img/logo/logo.png';
    const currencySymbol = settings.currency_symbol || '৳';

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 992) {
                setSidebarCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSubMenu = (id) => {
        setOpenSubMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearchOpen(false);
        router.get('/', { search: searchQuery.trim() });
    };

    // Fallback category items if dynamic categories not yet loaded
    const fallbackCategories = [
        { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: '/storefront/img/icons/clothes-2.svg', activeChildren: [
            { id: 'clothes', name: 'Clothes', slug: 'clothes' },
            { id: 'shoes', name: 'Shoes', slug: 'shoes' },
            { id: 'glasses', name: 'Glasses', slug: 'glasses' },
            { id: 'bags', name: 'Bags', slug: 'bags' },
        ]},
        { id: 'lifestyle', name: 'Lifestyle', slug: 'lifestyle', icon: '/storefront/img/icons/makeup.svg', activeChildren: [
            { id: 'cosmetics', name: 'Cosmetics', slug: 'cosmetics' },
            { id: 'makeup', name: 'Makeup', slug: 'makeup' },
            { id: 'watches', name: 'Watches', slug: 'watches' },
        ]},
        { id: 'bakery', name: 'Bakery', slug: 'bakery', icon: '/storefront/img/icons/cake.svg', activeChildren: [
            { id: 'cake', name: 'Cake', slug: 'cake' },
            { id: 'bread', name: 'Bread', slug: 'bread' },
        ]},
    ];

    const displayCategories = (navCategories && navCategories.length > 0) ? navCategories : fallbackCategories;

    return (
        <div className="wrapper sb-default">
            {/* Sidebar Overlay (Mobile & Tablet) */}
            {!sidebarCollapsed && (
                <div
                    className="mn-sidebar-overlay"
                    style={{ display: 'block' }}
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}

            {/* Left Category Sidebar */}
            <div className={`mn-sidebar ${sidebarCollapsed ? 'sidebar-hide' : ''}`}>
                <div className="mn-sidebar-body">
                    <button
                        type="button"
                        className="side-close"
                        title="Close Sidebar"
                        onClick={() => setSidebarCollapsed(true)}
                    />
                    <ul className="mn-sb-list">
                        <li className="mn-sb-title condense">
                            <span>CATEGORIES</span>
                        </li>
                        {displayCategories.map((cat) => {
                            const hasChildren = cat.activeChildren && cat.activeChildren.length > 0;
                            const isSubOpen = Boolean(openSubMenus[cat.id]);
                            const iconSrc = cat.icon || '/storefront/img/icons/clothes-2.svg';

                            if (!hasChildren) {
                                return (
                                    <li key={cat.id} className="mn-sb-item sb-drop-item">
                                        <Link href={`/?category=${cat.slug}`} className="mn-drop-toggle" onClick={() => window.innerWidth < 992 && setSidebarCollapsed(true)}>
                                            <img src={iconSrc} alt={cat.name} onError={(e) => { e.target.src = '/storefront/img/icons/clothes-2.svg'; }} />
                                            <span className="condense">{cat.name}</span>
                                        </Link>
                                    </li>
                                );
                            }

                            return (
                                <li key={cat.id} className="mn-sb-item sb-drop-item">
                                    <a
                                        href="javascript:void(0)"
                                        className={`mn-drop-toggle ${isSubOpen ? 'active-nav' : ''}`}
                                        onClick={() => toggleSubMenu(cat.id)}
                                    >
                                        <img src={iconSrc} alt={cat.name} onError={(e) => { e.target.src = '/storefront/img/icons/clothes-2.svg'; }} />
                                        <span className="condense">
                                            {cat.name}
                                            <i className={`drop-arrow ri-arrow-${isSubOpen ? 'up' : 'down'}-s-line`} />
                                        </span>
                                    </a>
                                    <ul className="mn-sb-drop" style={{ display: isSubOpen ? 'block' : 'none' }}>
                                        {cat.activeChildren.map((sub) => (
                                            <li key={sub.id} className="list">
                                                <Link
                                                    href={`/?category=${sub.slug}`}
                                                    className="mn-page-link drop"
                                                    onClick={() => window.innerWidth < 992 && setSidebarCollapsed(true)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Header */}
            <header className={sidebarCollapsed ? 'sb-hide' : ''}>
                <div className="mn-header">
                    <div className="mn-header-items">
                        <div className="left-header d-flex align-items-center">
                            <a
                                href="javascript:void(0)"
                                className={`mn-toggle-sidebar ${sidebarCollapsed ? 'active-toggle' : ''}`}
                                title="Toggle Sidebar"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            >
                                <span className="outer-ring">
                                    <span className="inner-ring" />
                                </span>
                            </a>
                            <Link href="/" className="logo ms-2">
                                <img src={siteLogo} alt={siteName} />
                            </Link>
                            <a
                                href="javascript:void(0)"
                                className="mn-toggle-menu d-lg-none ms-2"
                                onClick={() => setIsMobileMenuOpen(true)}
                                title="Open Menu"
                            >
                                <div className="header-icon">
                                    <i className="ri-menu-3-fill" />
                                </div>
                            </a>
                        </div>

                        <div className="right-header">
                            {/* Main Desktop Menu */}
                            <div id="mn-main-menu-desk" className="d-none d-lg-block sticky-nav">
                                <div className="nav-desk">
                                    <div className="row">
                                        <div className="col-md-12 align-self-center">
                                            <div className="mn-main-menu">
                                                <ul>
                                                    <li className="non-drop">
                                                        <Link href="/">Home</Link>
                                                    </li>
                                                    <li className="dropdown drop-list">
                                                        <a href="javascript:void(0)" className="dropdown-arrow">
                                                            Categories<i className="ri-arrow-down-s-line ms-1" />
                                                        </a>
                                                        <ul className="mega-menu d-block">
                                                            <li className="d-flex">
                                                                <span className="bg" />
                                                                {displayCategories.slice(0, 4).map((root) => (
                                                                    <ul key={root.id} className="d-block mega-block">
                                                                        <li className="menu_title">
                                                                            <Link href={`/?category=${root.slug}`}>{root.name}</Link>
                                                                        </li>
                                                                        {root.activeChildren && root.activeChildren.slice(0, 5).map((child) => (
                                                                            <li key={child.id}>
                                                                                <Link href={`/?category=${child.slug}`}>{child.name}</Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ))}
                                                            </li>
                                                        </ul>
                                                    </li>
                                                    <li className="dropdown drop-list">
                                                        <a href="javascript:void(0)" className="dropdown-arrow">
                                                            Products<i className="ri-arrow-down-s-line ms-1" />
                                                        </a>
                                                        <ul className="sub-menu">
                                                            <li><a href="#featured-products">Featured Products</a></li>
                                                            <li><a href="#new-arrivals">New Arrivals</a></li>
                                                        </ul>
                                                    </li>
                                                    <li className="dropdown drop-list">
                                                        <a href="javascript:void(0)" className="dropdown-arrow">
                                                            Account<i className="ri-arrow-down-s-line ms-1" />
                                                        </a>
                                                        <ul className="sub-menu">
                                                            {auth?.user ? (
                                                                <>
                                                                    {auth.user.role === 'admin' || auth.user.role === 'staff' ? (
                                                                        <li><Link href="/admin/dashboard">Admin Dashboard</Link></li>
                                                                    ) : null}
                                                                    <li>
                                                                        <Link href="/logout" method="post" as="button" className="w-100 text-start border-0 bg-transparent py-1">
                                                                            Logout ({auth.user.name})
                                                                        </Link>
                                                                    </li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li><Link href="/login">Login</Link></li>
                                                                    <li><Link href="/register">Register</Link></li>
                                                                </>
                                                            )}
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Menu Tool Icons */}
                            <div className="mn-tool-icons">
                                <div className="mn-tool-search">
                                    <a
                                        href="javascript:void(0)"
                                        className="mn-main-search mn-search-toggle"
                                        title="Search Products"
                                        onClick={() => setIsSearchOpen(true)}
                                    >
                                        <i className="ri-search-line" style={{ fontSize: '20px' }} />
                                    </a>
                                </div>
                                <div className="mn-tool-user d-none d-sm-block">
                                    <a href="javascript:void(0)" className="mn-main-user" title="Account">
                                        <i className="ri-user-3-line" style={{ fontSize: '20px' }} />
                                    </a>
                                    <ul className="sub-menu">
                                        {auth?.user ? (
                                            <>
                                                {auth.user.role === 'admin' || auth.user.role === 'staff' ? (
                                                    <li><Link href="/admin/dashboard">Admin Dashboard</Link></li>
                                                ) : null}
                                                <li>
                                                    <Link href="/logout" method="post" as="button" className="w-100 text-start border-0 bg-transparent">
                                                        Logout
                                                    </Link>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li><Link href="/login">Login</Link></li>
                                                <li><Link href="/register">Register</Link></li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                                <div className="mn-tool-wish">
                                    <a
                                        href="javascript:void(0)"
                                        className="mn-main-wishlist mn-wishlist-toggle"
                                        title="Wishlist"
                                        onClick={() => setIsWishlistOpen(true)}
                                    >
                                        <span className="label lbl-1">0</span>
                                        <i className="ri-heart-line" style={{ fontSize: '20px' }} />
                                    </a>
                                </div>
                                <div className="mn-tool-cart">
                                    <a
                                        href="javascript:void(0)"
                                        className="mn-main-cart mn-cart-toggle"
                                        title="Cart"
                                        onClick={() => setIsCartOpen(true)}
                                    >
                                        <span className="label lbl-2">0</span>
                                        <i className="ri-shopping-cart-line" style={{ fontSize: '20px' }} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Slide-Out Drawer */}
            {isMobileMenuOpen && (
                <div
                    className="mn-mobile-menu-overlay"
                    style={{ display: 'block' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <div className={`mn-mobile-menu ${isMobileMenuOpen ? 'mn-menu-open' : ''}`}>
                <div className="mn-menu-title d-flex justify-content-between align-items-center px-3 py-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <img src={siteLogo} alt={siteName} style={{ maxHeight: '28px' }} />
                        <span className="menu_title fw-bold text-dark">{siteName}</span>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                </div>
                <div className="mn-menu-inner p-3">
                    {/* User Profile Card */}
                    <div className="bg-light p-3 rounded-3 mb-3 border">
                        {auth?.user ? (
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 34, height: 34 }}>
                                        {auth.user.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: 180 }}>{auth.user.name}</div>
                                        <div className="text-muted small">{auth.user.email}</div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-2">
                                    {auth.user.role === 'admin' || auth.user.role === 'staff' ? (
                                        <Link href="/admin/dashboard" className="btn btn-sm btn-outline-primary flex-fill">
                                            Admin
                                        </Link>
                                    ) : null}
                                    <Link href="/logout" method="post" as="button" className="btn btn-sm btn-outline-danger flex-fill">
                                        Logout
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link href="/login" className="btn btn-sm btn-primary flex-fill" onClick={() => setIsMobileMenuOpen(false)}>
                                    Sign In
                                </Link>
                                <Link href="/register" className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => setIsMobileMenuOpen(false)}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <div className="mn-menu-content">
                        <ul className="list-unstyled mb-4">
                            <li className="mb-2">
                                <Link href="/" className="text-dark fw-semibold text-decoration-none d-block py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    <i className="ri-home-4-line me-2 text-primary" /> Home
                                </Link>
                            </li>
                            <li className="mb-2">
                                <a href="#featured-products" className="text-dark fw-semibold text-decoration-none d-block py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    <i className="ri-star-line me-2 text-warning" /> Featured Products
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="#new-arrivals" className="text-dark fw-semibold text-decoration-none d-block py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    <i className="ri-sparkling-line me-2 text-info" /> New Arrivals
                                </a>
                            </li>
                        </ul>

                        {/* Mobile Categories Accordion */}
                        <div className="fw-bold text-uppercase small text-muted mb-2">Shop by Category</div>
                        <ul className="list-unstyled">
                            {displayCategories.map((cat) => (
                                <li key={cat.id} className="border-bottom py-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Link
                                            href={`/?category=${cat.slug}`}
                                            className="text-dark text-decoration-none fw-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                        {cat.activeChildren && cat.activeChildren.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm p-0 text-muted"
                                                onClick={() => toggleSubMenu(`mobile-${cat.id}`)}
                                            >
                                                <i className={`ri-arrow-${openSubMenus[`mobile-${cat.id}`] ? 'up' : 'down'}-s-line fs-5`} />
                                            </button>
                                        )}
                                    </div>
                                    {cat.activeChildren && cat.activeChildren.length > 0 && openSubMenus[`mobile-${cat.id}`] && (
                                        <ul className="list-unstyled ps-3 pt-2 text-muted small">
                                            {cat.activeChildren.map((sub) => (
                                                <li key={sub.id} className="py-1">
                                                    <Link
                                                        href={`/?category=${sub.slug}`}
                                                        className="text-muted text-decoration-none"
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
                        </ul>
                    </div>
                </div>
            </div>

            {/* Interactive Search Overlay Modal */}
            {isSearchOpen && (
                <div className="mn-search-modal-overlay" onClick={() => setIsSearchOpen(false)}>
                    <div className="mn-search-modal-box" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleSearchSubmit} className="p-3">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        <i className="ri-search-line text-muted" />
                                    </span>
                                    <input
                                        type="search"
                                        className="form-control bg-light border-0 shadow-none"
                                        placeholder="Search clothes, shoes, cosmetics, watches..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary px-3">
                                    Search
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-light rounded-circle"
                                    onClick={() => setIsSearchOpen(false)}
                                    style={{ width: 38, height: 38 }}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="d-flex flex-wrap gap-1.5 align-items-center">
                                <span className="small text-muted me-1">Popular:</span>
                                {['Clothes', 'Shoes', 'Watches', 'Bags', 'Cosmetics'].map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-pill small"
                                        style={{ fontSize: '11px' }}
                                        onClick={() => {
                                            setIsSearchOpen(false);
                                            router.get('/', { search: term });
                                        }}
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className={`mn-main-content ${sidebarCollapsed ? 'sb-hide' : ''}`}>
                {children}
            </main>

            {/* Footer */}
            <footer className={sidebarCollapsed ? 'sb-hide' : ''}>
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
                                        {displayCategories && displayCategories.slice(0, 5).map((cat) => (
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
                                        <li><span>Inside City Shipping: {currencySymbol}{parseFloat(settings.shipping_charge_inside || 70).toFixed(2)}</span></li>
                                        <li><span>Outside City Shipping: {currencySymbol}{parseFloat(settings.shipping_charge_outside || 130).toFixed(2)}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="row pt-4 border-top">
                            <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
                                <p className="mb-0 text-muted small">{settings.copyright_text || '© 2026 ORIO STYLE LTD. All rights reserved.'}</p>
                            </div>
                            <div className="col-md-6 text-center text-md-end">
                                <img src="/storefront/img/banner/payment.png" alt="Payment Methods" style={{ maxHeight: '26px' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Sticky Mobile Bottom Navigation Bar */}
            <div className="mn-bottom-nav d-flex d-lg-none">
                <Link href="/" className="mn-bottom-nav-item active">
                    <i className="ri-home-4-line" />
                    <span>Home</span>
                </Link>
                <button
                    type="button"
                    className="mn-bottom-nav-item"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    <i className="ri-grid-fill" />
                    <span>Categories</span>
                </button>
                <button
                    type="button"
                    className="mn-bottom-nav-item"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <i className="ri-search-line" />
                    <span>Search</span>
                </button>
                <button
                    type="button"
                    className="mn-bottom-nav-item"
                    onClick={() => setIsWishlistOpen(true)}
                >
                    <span className="nav-badge">0</span>
                    <i className="ri-heart-line" />
                    <span>Wishlist</span>
                </button>
                <button
                    type="button"
                    className="mn-bottom-nav-item"
                    onClick={() => setIsCartOpen(true)}
                >
                    <span className="nav-badge">0</span>
                    <i className="ri-shopping-cart-line" />
                    <span>Cart</span>
                </button>
            </div>

            {/* Cart Slide-over Drawer */}
            {isCartOpen && <div className="mn-side-cart-overlay active" style={{ display: 'block' }} onClick={() => setIsCartOpen(false)} />}
            <div id="mn-side-cart" className={`mn-side-cart ${isCartOpen ? 'mn-open-cart' : ''}`}>
                <div className="mn-cart-inner">
                    <div className="mn-cart-top">
                        <div className="mn-cart-title">
                            <span className="cart_title">My Cart</span>
                            <a href="javascript:void(0)" className="mn-cart-close" onClick={() => setIsCartOpen(false)}>
                                <i className="ri-close-line" />
                            </a>
                        </div>
                        <ul className="mn-cart-pro-items">
                            <li className="cart-sidebar-list text-center text-muted py-5">
                                <i className="ri-shopping-cart-2-line display-4 text-muted mb-2 d-block opacity-50" />
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
                            <a href="javascript:void(0)" className="mn-btn-1 w-100 text-center" onClick={() => setIsCartOpen(false)}>
                                <span>Continue Shopping<i className="ri-arrow-right-s-line" /></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wishlist Slide-over Drawer */}
            {isWishlistOpen && <div className="mn-side-wishlist-overlay active" style={{ display: 'block' }} onClick={() => setIsWishlistOpen(false)} />}
            <div id="mn-side-wishlist" className={`mn-side-wishlist ${isWishlistOpen ? 'mn-open-wishlist' : ''}`}>
                <div className="mn-wishlist-inner">
                    <div className="mn-wishlist-top">
                        <div className="mn-wishlist-title">
                            <span className="wishlist_title">My Wishlist</span>
                            <a href="javascript:void(0)" className="mn-wishlist-close" onClick={() => setIsWishlistOpen(false)}>
                                <i className="ri-close-line" />
                            </a>
                        </div>
                        <ul className="mn-wishlist-pro-items">
                            <li className="wishlist-sidebar-list text-center text-muted py-5">
                                <i className="ri-heart-3-line display-4 text-muted mb-2 d-block opacity-50" />
                                <p className="mb-0">Your wishlist is currently empty.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="mn-wishlist-bottom">
                        <div className="wishlist_btn">
                            <a href="javascript:void(0)" className="mn-btn-1 w-100 text-center" onClick={() => setIsWishlistOpen(false)}>
                                <span>Explore Shop<i className="ri-arrow-right-s-line" /></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
