import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function StoreLayout({ children, categoriesTree = [] }) {
    const { settings, auth, appName } = usePage().props;
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;

    const [sidebarHide, setSidebarHide] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropCat, setActiveDropCat] = useState(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/shop', { search: searchQuery.trim() });
        }
    };

    const toggleSidebar = () => {
        setSidebarHide(!sidebarHide);
    };

    return (
        <div className="wrapper sb-default">
            {/* Sidebar Overlay */}
            <div 
                className="mn-sidebar-overlay" 
                style={{ display: sidebarHide ? 'block' : 'none' }}
                onClick={() => setSidebarHide(false)}
            ></div>

            {/* Left Fixed Dark Sidebar Menu (Exact Mantu Template Markup) */}
            <div className={`mn-sidebar ${sidebarHide ? 'sidebar-hide' : ''}`}>
                <div className="mn-sidebar-body">
                    <button 
                        type="button" 
                        className="side-close" 
                        title="Close"
                        onClick={() => setSidebarHide(false)}
                    ></button>

                    <ul className="mn-sb-list">
                        <li className="mn-sb-title condense">
                            <span>Categories & Taxonomies</span>
                        </li>

                        {categoriesTree && categoriesTree.length > 0 ? (
                            categoriesTree.map((cat) => (
                                <li key={cat.id} className="mn-sb-item sb-drop-item">
                                    <a 
                                        href="javascript:void(0)" 
                                        className={`mn-drop-toggle ${activeDropCat === cat.id ? 'active-nav' : ''}`}
                                        onClick={() => setActiveDropCat(activeDropCat === cat.id ? null : cat.id)}
                                    >
                                        <img 
                                            src={cat.icon ? `/storage/${cat.icon}` : '/assets/img/icons/clothes-2.svg'} 
                                            alt={cat.name} 
                                            onError={(e) => { e.target.src = '/assets/img/icons/clothes-2.svg'; }}
                                        />
                                        <span className="condense">
                                            {cat.name}
                                            {cat.children && cat.children.length > 0 && (
                                                <i className="drop-arrow ri-arrow-down-s-line"></i>
                                            )}
                                        </span>
                                    </a>

                                    {cat.children && cat.children.length > 0 && (
                                        <ul 
                                            className="mn-sb-drop" 
                                            style={{ display: activeDropCat === cat.id ? 'block' : 'none' }}
                                        >
                                            {cat.children.map((sub) => (
                                                <li key={sub.id} className="list">
                                                    <Link href={`/shop?category=${sub.slug}`} className="mn-page-link drop">
                                                        {sub.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))
                        ) : (
                            <>
                                <li className="mn-sb-title condense"><span>Fashion</span></li>
                                <li className="mn-sb-item sb-drop-item">
                                    <Link href="/shop?category=clothes" className="mn-drop-toggle">
                                        <img src="/assets/img/icons/clothes-2.svg" alt="clothes" />
                                        <span className="condense">Clothes</span>
                                    </Link>
                                </li>
                                <li className="mn-sb-item sb-drop-item">
                                    <Link href="/shop?category=shoes" className="mn-drop-toggle">
                                        <img src="/assets/img/icons/shoes.svg" alt="shoes" />
                                        <span className="condense">Shoes</span>
                                    </Link>
                                </li>
                                <li className="mn-sb-item sb-drop-item">
                                    <Link href="/shop?category=glasses" className="mn-drop-toggle">
                                        <img src="/assets/img/icons/glasses.svg" alt="glasses" />
                                        <span className="condense">Glasses</span>
                                    </Link>
                                </li>
                                <li className="mn-sb-item sb-drop-item">
                                    <Link href="/shop?category=bags" className="mn-drop-toggle">
                                        <img src="/assets/img/icons/bag.svg" alt="bags" />
                                        <span className="condense">Bags</span>
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            {/* Main Header (Exact Mantu Template Markup) */}
            <header className={sidebarHide ? 'sb-hide' : ''}>
                <div className="mn-header">
                    <div className="mn-header-items">
                        <div className="left-header">
                            <a 
                                href="javascript:void(0)" 
                                className={`mn-toggle-sidebar ${sidebarHide ? 'active-toggle' : ''}`}
                                onClick={toggleSidebar}
                            >
                                <span className="outer-ring">
                                    <span className="inner-ring"></span>
                                </span>
                            </a>

                            <Link href="/" className="logo">
                                {siteLogo ? (
                                    <img src={siteLogo} alt={siteName} style={{ maxHeight: '40px' }} />
                                ) : (
                                    <img src="/assets/img/logo/logo.png" alt="Mantu" />
                                )}
                            </Link>

                            <a 
                                href="javascript:void(0)" 
                                className="mn-toggle-menu"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <div className="header-icon">
                                    <i className="ri-menu-3-fill"></i>
                                </div>
                            </a>
                        </div>

                        <div className="right-header">
                            {/* Main Menu Navigation Links */}
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
                                                        <Link href="/shop" className="dropdown-arrow">
                                                            Categories<i className="ri-arrow-down-s-line"></i>
                                                        </Link>
                                                        <ul className="sub-menu">
                                                            {categoriesTree && categoriesTree.slice(0, 8).map((cat) => (
                                                                <li key={cat.id}>
                                                                    <Link href={`/shop?category=${cat.slug}`}>{cat.name}</Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                    <li className="dropdown drop-list">
                                                        <Link href="/shop" className="dropdown-arrow">
                                                            Products<i className="ri-arrow-down-s-line"></i>
                                                        </Link>
                                                        <ul className="sub-menu">
                                                            <li><Link href="/shop">Shop Full Width</Link></li>
                                                            <li><Link href="/shop?on_sale=1">Discount Products</Link></li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Header Tool Icons (Search, User, Wishlist, Cart) */}
                            <div className="mn-tool-icons">
                                <div className="mn-tool-search">
                                    <form onSubmit={handleSearchSubmit} className="d-none d-md-flex align-items-center me-2">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm rounded-pill px-3"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: '160px' }}
                                        />
                                    </form>
                                </div>

                                <div className="mn-tool-user position-relative">
                                    <Link href={auth?.user ? "/admin/dashboard" : "/login"} className="mn-main-user">
                                        <svg className="svg-icon" viewBox="0 0 1024 1024">
                                            <path d="M512.476 648.247c-170.169 0-308.118-136.411-308.118-304.681 0-168.271 137.949-304.681 308.118-304.681 170.169 0 308.119 136.411 308.119 304.681C820.594 511.837 682.645 648.247 512.476 648.247L512.476 648.247zM512.476 100.186c-135.713 0-246.12 109.178-246.12 243.381 0 134.202 110.407 243.381 246.12 243.381 135.719 0 246.126-109.179 246.126-243.381C758.602 209.364 648.195 100.186 512.476 100.186L512.476 100.186zM935.867 985.115l-26.164 0c-9.648 0-17.779-6.941-19.384-16.35-2.646-15.426-6.277-30.52-11.142-44.95-24.769-87.686-81.337-164.13-159.104-214.266-63.232 35.203-134.235 53.64-207.597 53.64-73.555 0-144.73-18.537-208.084-53.922-78 50.131-134.75 126.68-159.564 214.549 0 0-4.893 18.172-11.795 46.4-2.136 8.723-10.035 14.9-19.112 14.9L88.133 985.116c-9.415 0-16.693-8.214-15.47-17.452C91.698 824.084 181.099 702.474 305.51 637.615c58.682 40.472 129.996 64.267 206.966 64.267 76.799 0 147.968-23.684 206.584-63.991 124.123 64.932 213.281 186.403 232.277 329.772C952.56 976.901 945.287 985.115 935.867 985.115L935.867 985.115z"></path>
                                        </svg>
                                    </Link>
                                </div>

                                <div className="mn-tool-wish">
                                    <Link href="/shop" className="mn-main-wishlist">
                                        <span className="label lbl-1">3</span>
                                        <svg viewBox="0 0 512 512">
                                            <path d="M474.644 74.27C449.391 45.616 414.358 29.836 376 29.836c-53.948 0-88.103 32.22-107.255 59.25-4.969 7.014-9.196 14.047-12.745 20.665-3.549-6.618-7.775-13.651-12.745-20.665-19.152-27.03-53.307-59.25-107.255-59.25-38.358 0-73.391 15.781-98.645 44.435C13.267 101.605 0 138.213 0 177.351c0 42.603 16.633 82.228 52.345 124.7 31.917 37.96 77.834 77.088 131.005 122.397 19.813 16.884 40.302 34.344 62.115 53.429l.655.574c2.828 2.476 6.354 3.713 9.88 3.713s7.052-1.238 9.88-3.713l.655-.574c21.813-19.085 42.302-36.544 62.118-53.431 53.168-45.306 99.085-84.434 131.002-122.395C495.367 259.578 512 219.954 512 177.351c0-39.138-13.267-75.746-37.356-103.081z"></path>
                                        </svg>
                                    </Link>
                                </div>

                                <div className="mn-tool-cart">
                                    <Link href="/shop" className="mn-main-cart">
                                        <span className="label lbl-2">4</span>
                                        <svg className="svg-icon" viewBox="0 0 1024 1024">
                                            <path d="M351.552 831.424c-35.328 0-63.968 28.64-63.968 63.968 0 35.328 28.64 63.968 63.968 63.968 35.328 0 63.968-28.64 63.968-63.968C415.52 860.064 386.88 831.424 351.552 831.424L351.552 831.424 351.552 831.424zM799.296 831.424c-35.328 0-63.968 28.64-63.968 63.968 0 35.328 28.64 63.968 63.968 63.968 35.328 0 63.968-28.64 63.968-63.968C863.264 860.064 834.624 831.424 799.296 831.424L799.296 831.424 799.296 831.424zM862.752 799.456 343.264 799.456c-46.08 0-86.592-36.448-92.224-83.008L196.8 334.592 165.92 156.128c-1.92-15.584-16.128-28.288-29.984-28.288L95.2 127.84c-17.664 0-32-14.336-32-31.968 0-17.664 14.336-32 32-32l40.736 0c46.656 0 87.616 36.448 93.28 83.008l30.784 177.792 54.464 383.488c1.792 14.848 15.232 27.36 28.768 27.36l519.488 0c17.696 0 32 14.304 32 31.968S880.416 799.456 862.752 799.456L862.752 799.456z"></path>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Main Content Area */}
            <div className={`mn-main-content ${sidebarHide ? 'sb-hide' : ''}`}>
                {children}
            </div>

            {/* Footer */}
            <footer className={sidebarHide ? 'sb-hide' : ''}>
                <div className="mn-footer bg-dark text-white py-4 border-top">
                    <div className="container-fluid px-4 d-flex flex-wrap justify-content-between align-items-center text-xs text-muted">
                        <p className="mb-0">{settings?.copyright_text || `${siteName} © ${new Date().getFullYear()}. All rights reserved.`}</p>
                        <div className="d-flex gap-3">
                            <Link href="/" className="text-muted text-decoration-none">Home</Link>
                            <Link href="/shop" className="text-muted text-decoration-none">Shop</Link>
                            <span>Powered by Antu Engine</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
