import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function Navbar({ categoriesTree = [] }) {
    const { settings, auth, appName } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/shop', { search: searchQuery.trim() });
        }
    };

    return (
        <header className="mn-header sticky-top bg-white border-bottom shadow-sm">
            {/* Top Micro Info Bar */}
            <div className="bg-dark text-white py-1.5 px-3 text-xs border-bottom border-secondary">
                <div className="container-fluid max-w-7xl mx-auto d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-3 text-slate-300">
                        {settings?.contact_phone && (
                            <span className="d-flex align-items-center gap-1">
                                <i className="ri-phone-line text-warning"></i> {settings.contact_phone}
                            </span>
                        )}
                        {settings?.contact_email && (
                            <span className="d-flex align-items-center gap-1">
                                <i className="ri-mail-line text-warning"></i> {settings.contact_email}
                            </span>
                        )}
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-warning font-semibold d-flex align-items-center gap-1">
                            <i className="ri-sparkling-fill"></i>
                            {settings?.storefront_tagline || 'Exclusive Antu Luxury Collection'}
                        </span>
                        {auth?.user && (auth.user.role === 'super_admin' || auth.user.role === 'admin') && (
                            <Link
                                href="/admin/dashboard"
                                className="badge bg-warning text-dark text-decoration-none px-2.5 py-1 rounded font-bold"
                            >
                                <i className="ri-dashboard-line me-1"></i> Admin Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header Container */}
            <div className="container-fluid max-w-7xl mx-auto py-3 px-3">
                <div className="d-flex align-items-center justify-content-between gap-3">
                    {/* Brand Logo */}
                    <Link href="/" className="d-flex align-items-center text-decoration-none gap-2">
                        {siteLogo ? (
                            <img src={siteLogo} alt={siteName} style={{ maxHeight: '42px', objectFit: 'contain' }} />
                        ) : (
                            <div className="bg-dark text-warning p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '42px', height: '42px' }}>
                                <i className="ri-shopping-bag-3-fill fs-4"></i>
                            </div>
                        )}
                        <div className="d-flex flex-column">
                            <span className="fw-bold fs-5 text-dark tracking-tight leading-tight">{siteName}</span>
                            <span className="text-muted text-uppercase font-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                                Antu Storefront Engine
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="d-none d-md-flex flex-grow-1 mx-4 max-w-md position-relative">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control rounded-pill-left ps-4 text-sm"
                                placeholder="Search products, brands, categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="btn btn-warning rounded-pill-right px-4 text-dark font-bold">
                                <i className="ri-search-line"></i>
                            </button>
                        </div>
                    </form>

                    {/* Main Nav Links & Auth */}
                    <div className="d-none d-lg-flex align-items-center gap-4 fw-semibold text-sm">
                        <Link href="/" className="text-dark text-decoration-none hover-warning">
                            Home
                        </Link>

                        <Link href="/shop" className="text-dark text-decoration-none hover-warning d-flex align-items-center gap-1">
                            <i className="ri-store-2-line text-warning fs-5"></i>
                            <span>Shop Catalog</span>
                        </Link>

                        {/* Categories Dropdown */}
                        {categoriesTree.length > 0 && (
                            <div
                                className="position-relative py-2"
                                onMouseEnter={() => setCategoriesDropdownOpen(true)}
                                onMouseLeave={() => setCategoriesDropdownOpen(false)}
                            >
                                <span className="text-dark cursor-pointer d-flex align-items-center gap-1">
                                    Categories <i className="ri-arrow-down-s-line"></i>
                                </span>

                                {categoriesDropdownOpen && (
                                    <div
                                        className="position-absolute top-100 start-0 bg-white shadow-lg border rounded-3 py-2 z-3"
                                        style={{ minWidth: '220px' }}
                                    >
                                        <div className="px-3 py-1 text-uppercase text-muted fw-bold border-bottom" style={{ fontSize: '10px' }}>
                                            Browse Categories
                                        </div>
                                        <div className="max-h-60 overflow-auto">
                                            {categoriesTree.map((cat) => (
                                                <Link
                                                    key={cat.id}
                                                    href={`/shop?category=${cat.slug}`}
                                                    className="d-flex align-items-center justify-content-between px-3 py-2 text-dark text-decoration-none hover-bg-light text-xs"
                                                >
                                                    <span>{cat.name}</span>
                                                    {cat.products_count !== undefined && (
                                                        <span className="badge bg-light text-dark rounded-pill">
                                                            {cat.products_count}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Auth Status */}
                        {auth?.user ? (
                            <div className="d-flex align-items-center gap-2 ps-3 border-start">
                                <span className="text-xs text-secondary">
                                    Hi, <strong className="text-dark">{auth.user.name}</strong>
                                </span>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="btn btn-sm btn-outline-danger rounded-circle p-1.5 ms-1"
                                    title="Sign Out"
                                >
                                    <i className="ri-logout-box-r-line"></i>
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="btn btn-sm btn-dark text-warning rounded-pill px-3 py-1.5 fw-bold ms-2"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="d-lg-none btn btn-outline-dark rounded-3 p-2"
                    >
                        <i className={mobileMenuOpen ? 'ri-close-line fs-4' : 'ri-menu-line fs-4'}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="d-lg-none bg-light border-top p-3 space-y-3 animate-in slide-in-from-top duration-200">
                    <form onSubmit={handleSearchSubmit} className="mb-3">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control text-sm"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="btn btn-warning text-dark font-bold">
                                <i className="ri-search-line"></i>
                            </button>
                        </div>
                    </form>

                    <div className="d-flex flex-column gap-2 font-semibold">
                        <Link href="/" className="text-dark text-decoration-none py-1 border-bottom">
                            Home
                        </Link>
                        <Link href="/shop" className="text-dark text-decoration-none py-1 border-bottom d-flex align-items-center gap-2">
                            <i className="ri-store-2-line text-warning"></i>
                            <span>Shop Catalog</span>
                        </Link>
                        {categoriesTree.length > 0 && (
                            <div className="pt-2">
                                <span className="text-muted uppercase font-bold text-xs d-block mb-2">Categories</span>
                                <div className="row g-2">
                                    {categoriesTree.map((cat) => (
                                        <div key={cat.id} className="col-6">
                                            <Link
                                                href={`/shop?category=${cat.slug}`}
                                                className="btn btn-sm btn-white border w-100 text-start text-xs truncate"
                                            >
                                                {cat.name}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                        {auth?.user ? (
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <span className="text-xs">Signed in as <strong>{auth.user.name}</strong></span>
                                <Link href="/logout" method="post" as="button" className="btn btn-xs btn-outline-danger">
                                    Logout
                                </Link>
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-dark text-warning w-100 font-bold text-xs py-2">
                                Sign In / Register
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
