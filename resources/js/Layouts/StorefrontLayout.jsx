import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function StorefrontLayout({ children, navCategories = [] }) {
    const { settings = {}, auth = {} } = usePage().props;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState({});

    const siteName = settings.site_name || 'ORIO STYLE';
    const siteLogo = settings.site_logo || '/storefront/img/logo/logo.png';
    const currencySymbol = settings.currency_symbol || '৳';

    const toggleSubMenu = (id) => {
        setOpenSubMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="wrapper sb-default">
            {/* Sidebar Overlay */}
            {sidebarCollapsed && (
                <div
                    className="mn-sidebar-overlay"
                    style={{ display: 'block' }}
                    onClick={() => setSidebarCollapsed(false)}
                />
            )}

            {/* Left Category Sidebar */}
            <div className={`mn-sidebar ${sidebarCollapsed ? 'sidebar-hide' : ''}`}>
                <div className="mn-sidebar-body">
                    <button
                        type="button"
                        className="side-close"
                        title="Close"
                        onClick={() => setSidebarCollapsed(true)}
                    />
                    <ul className="mn-sb-list">
                        <li className="mn-sb-title condense">
                            <span>FASHION</span>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <a
                                href="javascript:void(0)"
                                className={`mn-drop-toggle ${openSubMenus['clothes'] ? 'active-nav' : ''}`}
                                onClick={() => toggleSubMenu('clothes')}
                            >
                                <img src="/storefront/img/icons/clothes-2.svg" alt="Clothes" />
                                <span className="condense">
                                    Clothes
                                    <i className={`drop-arrow ri-arrow-${openSubMenus['clothes'] ? 'up' : 'down'}-s-line`} />
                                </span>
                            </a>
                            <ul className="mn-sb-drop" style={{ display: openSubMenus['clothes'] ? 'block' : 'none' }}>
                                <li className="list">
                                    <Link href="/?category=t-shirts" className="mn-page-link drop">T-shirts</Link>
                                </li>
                                <li className="list">
                                    <Link href="/?category=shirts" className="mn-page-link drop">Shirts</Link>
                                </li>
                                <li className="list">
                                    <Link href="/?category=dresses" className="mn-page-link drop">Dresses</Link>
                                </li>
                                <li className="list">
                                    <Link href="/?category=jeans" className="mn-page-link drop">Jeans</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <Link href="/?category=shoes" className="mn-drop-toggle">
                                <img src="/storefront/img/icons/shoes.svg" alt="Shoes" />
                                <span className="condense">Shoes</span>
                            </Link>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <Link href="/?category=glasses" className="mn-drop-toggle">
                                <img src="/storefront/img/icons/glasses.svg" alt="Glasses" />
                                <span className="condense">Glasses</span>
                            </Link>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <a
                                href="javascript:void(0)"
                                className={`mn-drop-toggle ${openSubMenus['bags'] ? 'active-nav' : ''}`}
                                onClick={() => toggleSubMenu('bags')}
                            >
                                <img src="/storefront/img/icons/bag.svg" alt="Bags" />
                                <span className="condense">
                                    Bags
                                    <i className={`drop-arrow ri-arrow-${openSubMenus['bags'] ? 'up' : 'down'}-s-line`} />
                                </span>
                            </a>
                            <ul className="mn-sb-drop" style={{ display: openSubMenus['bags'] ? 'block' : 'none' }}>
                                <li className="list"><Link href="/?category=handbags" className="mn-page-link drop">Handbags</Link></li>
                                <li className="list"><Link href="/?category=backpacks" className="mn-page-link drop">Backpacks</Link></li>
                                <li className="list"><Link href="/?category=wallets" className="mn-page-link drop">Wallets</Link></li>
                            </ul>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <Link href="/?category=hat" className="mn-drop-toggle">
                                <img src="/storefront/img/icons/hat.svg" alt="Hat" />
                                <span className="condense">Hat</span>
                            </Link>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <a
                                href="javascript:void(0)"
                                className={`mn-drop-toggle ${openSubMenus['makeup'] ? 'active-nav' : ''}`}
                                onClick={() => toggleSubMenu('makeup')}
                            >
                                <img src="/storefront/img/icons/makeup.svg" alt="Makeup" />
                                <span className="condense">
                                    Makeup
                                    <i className={`drop-arrow ri-arrow-${openSubMenus['makeup'] ? 'up' : 'down'}-s-line`} />
                                </span>
                            </a>
                            <ul className="mn-sb-drop" style={{ display: openSubMenus['makeup'] ? 'block' : 'none' }}>
                                <li className="list"><Link href="/?category=lipstick" className="mn-page-link drop">Lipstick</Link></li>
                                <li className="list"><Link href="/?category=eyeliner" className="mn-page-link drop">Eye Liner</Link></li>
                            </ul>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <a
                                href="javascript:void(0)"
                                className={`mn-drop-toggle ${openSubMenus['cosmetics'] ? 'active-nav' : ''}`}
                                onClick={() => toggleSubMenu('cosmetics')}
                            >
                                <img src="/storefront/img/icons/cosmetics.svg" alt="Cosmetics" />
                                <span className="condense">
                                    Cosmetics
                                    <i className={`drop-arrow ri-arrow-${openSubMenus['cosmetics'] ? 'up' : 'down'}-s-line`} />
                                </span>
                            </a>
                            <ul className="mn-sb-drop" style={{ display: openSubMenus['cosmetics'] ? 'block' : 'none' }}>
                                <li className="list"><Link href="/?category=shampoo" className="mn-page-link drop">Shampoo</Link></li>
                                <li className="list"><Link href="/?category=skincare" className="mn-page-link drop">Skin Care</Link></li>
                            </ul>
                        </li>

                        <li className="mn-sb-title condense">
                            <span>BAKERY</span>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <a
                                href="javascript:void(0)"
                                className={`mn-drop-toggle ${openSubMenus['cake'] ? 'active-nav' : ''}`}
                                onClick={() => toggleSubMenu('cake')}
                            >
                                <img src="/storefront/img/icons/cake.svg" alt="Cake" />
                                <span className="condense">
                                    Cake
                                    <i className={`drop-arrow ri-arrow-${openSubMenus['cake'] ? 'up' : 'down'}-s-line`} />
                                </span>
                            </a>
                            <ul className="mn-sb-drop" style={{ display: openSubMenus['cake'] ? 'block' : 'none' }}>
                                <li className="list"><Link href="/?category=cupcake" className="mn-page-link drop">Cup Cake</Link></li>
                                <li className="list"><Link href="/?category=pastry" className="mn-page-link drop">Pastry</Link></li>
                            </ul>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <Link href="/?category=bread" className="mn-drop-toggle">
                                <img src="/storefront/img/icons/bread.svg" alt="Bread" />
                                <span className="condense">Bread</span>
                            </Link>
                        </li>

                        <li className="mn-sb-title condense">
                            <span>VEGETABLES</span>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <a
                                href="javascript:void(0)"
                                className={`mn-drop-toggle ${openSubMenus['tuber'] ? 'active-nav' : ''}`}
                                onClick={() => toggleSubMenu('tuber')}
                            >
                                <img src="/storefront/img/icons/tuber.svg" alt="Tuber Root" />
                                <span className="condense">
                                    Tuber Root
                                    <i className={`drop-arrow ri-arrow-${openSubMenus['tuber'] ? 'up' : 'down'}-s-line`} />
                                </span>
                            </a>
                            <ul className="mn-sb-drop" style={{ display: openSubMenus['tuber'] ? 'block' : 'none' }}>
                                <li className="list"><Link href="/?category=potato" className="mn-page-link drop">Sweet Potato</Link></li>
                                <li className="list"><Link href="/?category=ginger" className="mn-page-link drop">Ginger</Link></li>
                            </ul>
                        </li>
                        <li className="mn-sb-item sb-drop-item">
                            <Link href="/?category=tomato" className="mn-drop-toggle">
                                <img src="/storefront/img/icons/tomato.svg" alt="Tomato" />
                                <span className="condense">Tomato</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Header */}
            <header className={sidebarCollapsed ? 'sb-hide' : ''}>
                <div className="mn-header">
                    <div className="mn-header-items">
                        <div className="left-header">
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
                            <Link href="/" className="logo">
                                <img src={siteLogo} alt={siteName} />
                            </Link>
                            <a
                                href="javascript:void(0)"
                                className="mn-toggle-menu"
                                onClick={() => setIsMobileMenuOpen(true)}
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
                                                            Categories<i className="ri-arrow-down-s-line" />
                                                        </a>
                                                        <ul className="mega-menu d-block">
                                                            <li className="d-flex">
                                                                <span className="bg" />
                                                                <ul className="d-block mega-block">
                                                                    <li className="menu_title">
                                                                        <a href="javascript:void(0)">Fashion</a>
                                                                    </li>
                                                                    <li><Link href="/?category=clothes">Clothes</Link></li>
                                                                    <li><Link href="/?category=shoes">Shoes</Link></li>
                                                                    <li><Link href="/?category=glasses">Glasses</Link></li>
                                                                    <li><Link href="/?category=bags">Bags</Link></li>
                                                                </ul>
                                                                <ul className="d-block mega-block">
                                                                    <li className="menu_title">
                                                                        <a href="javascript:void(0)">Lifestyle</a>
                                                                    </li>
                                                                    <li><Link href="/?category=cosmetics">Cosmetics</Link></li>
                                                                    <li><Link href="/?category=makeup">Makeup</Link></li>
                                                                    <li><Link href="/?category=bakery">Bakery</Link></li>
                                                                    <li><Link href="/?category=vegetables">Vegetables</Link></li>
                                                                </ul>
                                                            </li>
                                                        </ul>
                                                    </li>
                                                    <li className="dropdown drop-list">
                                                        <a href="javascript:void(0)" className="dropdown-arrow">
                                                            Products<i className="ri-arrow-down-s-line" />
                                                        </a>
                                                        <ul className="sub-menu">
                                                            <li><a href="#featured-products">Featured Products</a></li>
                                                            <li><a href="#new-arrivals">New Arrivals</a></li>
                                                        </ul>
                                                    </li>
                                                    <li className="dropdown drop-list">
                                                        <a href="javascript:void(0)" className="dropdown-arrow">
                                                            Pages<i className="ri-arrow-down-s-line" />
                                                        </a>
                                                        <ul className="sub-menu">
                                                            <li><Link href="/login">Login</Link></li>
                                                            <li><Link href="/register">Register</Link></li>
                                                            {auth?.user && (auth.user.role === 'admin' || auth.user.role === 'staff') && (
                                                                <li><Link href="/admin/dashboard">Admin Dashboard</Link></li>
                                                            )}
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Menu Overlay */}
                            <div
                                className="mn-mobile-menu-overlay"
                                style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <div className={`mn-mobile-menu ${isMobileMenuOpen ? 'mn-menu-open' : ''}`}>
                                <div className="mn-menu-title">
                                    <span className="menu_title">My Menu</span>
                                    <button
                                        type="button"
                                        className="mn-close-menu"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="mn-menu-inner">
                                    <div className="mn-menu-content">
                                        <ul>
                                            <li><Link href="/">Home</Link></li>
                                            <li><a href="#featured-products">Featured</a></li>
                                            <li><a href="#new-arrivals">New Arrivals</a></li>
                                            <li><Link href="/login">Login</Link></li>
                                            <li><Link href="/register">Register</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Main Menu Tool Icons */}
                            <div className="mn-tool-icons">
                                <div className="mn-tool-search">
                                    <a href="javascript:void(0)" className="mn-main-search mn-search-toggle" title="Search">
                                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 612.01 612.01" style={{ enableBackground: 'new 0 0 512 512' }} xmlSpace="preserve">
                                            <g>
                                                <path d="M606.209 578.714 448.198 423.228C489.576 378.272 515 318.817 515 253.393 514.98 113.439 399.704 0 257.493 0S.006 113.439.006 253.393s115.276 253.393 257.487 253.393c61.445 0 117.801-21.253 162.068-56.586l158.624 156.099c7.729 7.614 20.277 7.614 28.006 0a19.291 19.291 0 0 0 .018-27.585zM257.493 467.8c-120.326 0-217.869-95.993-217.869-214.407S137.167 38.986 257.493 38.986c120.327 0 217.869 95.993 217.869 214.407S377.82 467.8 257.493 467.8z" fill="#000000" opacity="1" data-original="#000000" />
                                            </g>
                                        </svg>
                                    </a>
                                </div>
                                <div className="mn-tool-user">
                                    <a href="javascript:void(0)" className="mn-main-user" title="Account">
                                        <svg className="svg-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M512.476 648.247c-170.169 0-308.118-136.411-308.118-304.681 0-168.271 137.949-304.681 308.118-304.681 170.169 0 308.119 136.411 308.119 304.681C820.594 511.837 682.645 648.247 512.476 648.247L512.476 648.247zM512.476 100.186c-135.713 0-246.12 109.178-246.12 243.381 0 134.202 110.407 243.381 246.12 243.381 135.719 0 246.126-109.179 246.126-243.381C758.602 209.364 648.195 100.186 512.476 100.186L512.476 100.186zM935.867 985.115l-26.164 0c-9.648 0-17.779-6.941-19.384-16.35-2.646-15.426-6.277-30.52-11.142-44.95-24.769-87.686-81.337-164.13-159.104-214.266-63.232 35.203-134.235 53.64-207.597 53.64-73.555 0-144.73-18.537-208.084-53.922-78 50.131-134.75 126.68-159.564 214.549 0 0-4.893 18.172-11.795 46.4-2.136 8.723-10.035 14.9-19.112 14.9L88.133 985.116c-9.415 0-16.693-8.214-15.47-17.452C91.698 824.084 181.099 702.474 305.51 637.615c58.682 40.472 129.996 64.267 206.966 64.267 76.799 0 147.968-23.684 206.584-63.991 124.123 64.932 213.281 186.403 232.277 329.772C952.56 976.901 945.287 985.115 935.867 985.115L935.867 985.115z" />
                                        </svg>
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
                                        <span className="label lbl-1">3</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 512 512" style={{ enableBackground: 'new 0 0 512 512' }} xmlSpace="preserve">
                                            <g>
                                                <path d="M474.644 74.27C449.391 45.616 414.358 29.836 376 29.836c-53.948 0-88.103 32.22-107.255 59.25-4.969 7.014-9.196 14.047-12.745 20.665-3.549-6.618-7.775-13.651-12.745-20.665-19.152-27.03-53.307-59.25-107.255-59.25-38.358 0-73.391 15.781-98.645 44.435C13.267 101.605 0 138.213 0 177.351c0 42.603 16.633 82.228 52.345 124.7 31.917 37.96 77.834 77.088 131.005 122.397 19.813 16.884 40.302 34.344 62.115 53.429l.655.574c2.828 2.476 6.354 3.713 9.88 3.713s7.052-1.238 9.88-3.713l.655-.574c21.813-19.085 42.302-36.544 62.118-53.431 53.168-45.306 99.085-84.434 131.002-122.395C495.367 259.578 512 219.954 512 177.351c0-39.138-13.267-75.746-37.356-103.081zM309.193 401.614c-17.08 14.554-34.658 29.533-53.193 45.646-18.534-16.111-36.113-31.091-53.196-45.648C98.745 312.939 30 254.358 30 177.351c0-31.83 10.605-61.394 29.862-83.245C79.34 72.007 106.379 59.836 136 59.836c41.129 0 67.716 25.338 82.776 46.594 13.509 19.064 20.558 38.282 22.962 45.659a15 15 0 0 0 28.524 0c2.404-7.377 9.453-26.595 22.962-45.66 15.06-21.255 41.647-46.593 82.776-46.593 29.621 0 56.66 12.171 76.137 34.27C471.395 115.957 482 145.521 482 177.351c0 77.007-68.745 135.588-172.807 224.263z" fill="#000000" opacity="1" data-original="#000000" />
                                            </g>
                                        </svg>
                                    </a>
                                </div>
                                <div className="mn-tool-cart">
                                    <a
                                        href="javascript:void(0)"
                                        className="mn-main-cart mn-cart-toggle"
                                        title="Cart"
                                        onClick={() => setIsCartOpen(true)}
                                    >
                                        <span className="label lbl-2">4</span>
                                        <svg className="svg-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M351.552 831.424c-35.328 0-63.968 28.64-63.968 63.968 0 35.328 28.64 63.968 63.968 63.968 35.328 0 63.968-28.64 63.968-63.968C415.52 860.064 386.88 831.424 351.552 831.424L351.552 831.424 351.552 831.424zM799.296 831.424c-35.328 0-63.968 28.64-63.968 63.968 0 35.328 28.64 63.968 63.968 63.968 35.328 0 63.968-28.64 63.968-63.968C863.264 860.064 834.624 831.424 799.296 831.424L799.296 831.424 799.296 831.424zM862.752 799.456 343.264 799.456c-46.08 0-86.592-36.448-92.224-83.008L196.8 334.592 165.92 156.128c-1.92-15.584-16.128-28.288-29.984-28.288L95.2 127.84c-17.664 0-32-14.336-32-31.968 0-17.664 14.336-32 32-32l40.736 0c46.656 0 87.616 36.448 93.28 83.008l30.784 177.792 54.464 383.488c1.792 14.848 15.232 27.36 28.768 27.36l519.488 0c17.696 0 32 14.304 32 31.968S880.416 799.456 862.752 799.456L862.752 799.456zM383.232 671.52c-16.608 0-30.624-12.8-31.872-29.632-1.312-17.632 11.936-32.928 29.504-34.208l433.856-31.968c15.936-0.096 29.344-12.608 31.104-26.816l50.368-288.224c1.28-10.752-1.696-22.528-8.128-29.792-4.128-4.672-9.312-7.04-15.36-7.04L319.04 223.84c-17.664 0-32-14.336-32-31.968 0-17.664 14.336-31.968 32-31.968l553.728 0c24.448 0 46.88 10.144 63.232 28.608 18.688 21.088 27.264 50.784 23.52 81.568l-50.4 288.256c-5.44 44.832-45.92 81.28-92 81.28L385.6 671.424C384.8 671.488 384 671.52 383.232 671.52L383.232 671.52zM383.232 671.52" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

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
                                        <li><span>Inside City Shipping: {currencySymbol}{parseFloat(settings.shipping_charge_inside || 70).toFixed(2)}</span></li>
                                        <li><span>Outside City Shipping: {currencySymbol}{parseFloat(settings.shipping_charge_outside || 130).toFixed(2)}</span></li>
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
                            <li className="wishlist-sidebar-list text-center text-muted py-4">
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
