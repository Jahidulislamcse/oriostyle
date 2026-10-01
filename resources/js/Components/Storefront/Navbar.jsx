import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    ShoppingBag, 
    Search, 
    User, 
    LayoutDashboard, 
    LogOut, 
    Menu, 
    X, 
    ChevronDown, 
    Sparkles, 
    SlidersHorizontal,
    Phone,
    Mail
} from 'lucide-react';

export default function Navbar({ categoriesTree = [] }) {
    const { settings, auth, appName } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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
        <header className="sticky top-0 z-50 bg-[#071324]/95 backdrop-blur-md border-b border-[#D4AF37]/20 transition-all duration-300">
            {/* Top Micro Header */}
            <div className="bg-[#040C18] text-slate-400 text-xs border-b border-slate-800/80 py-1.5 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-4 text-slate-400 text-[11px] sm:text-xs">
                        {settings?.contact_phone && (
                            <span className="flex items-center gap-1 hover:text-[#EBD495] transition">
                                <Phone className="w-3 h-3 text-[#D4AF37]" /> {settings.contact_phone}
                            </span>
                        )}
                        {settings?.contact_email && (
                            <span className="flex items-center gap-1 hover:text-[#EBD495] transition">
                                <Mail className="w-3 h-3 text-[#D4AF37]" /> {settings.contact_email}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] sm:text-xs">
                        <span className="text-[#EBD495]/90 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                            {settings?.storefront_tagline || 'Premium Quality & Authentic Fashion Collections'}
                        </span>
                        {auth?.user && (auth.user.role === 'super_admin' || auth.user.role === 'admin') && (
                            <Link
                                href="/admin/dashboard"
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#D4AF37]/10 text-[#EBD495] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition text-[11px] font-semibold"
                            >
                                <LayoutDashboard className="w-3 h-3 text-[#D4AF37]" />
                                Backoffice Admin
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4 sm:gap-8">
                {/* Brand Logo & Name */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    {siteLogo ? (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white p-1.5 border border-[#D4AF37]/40 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                            <img src={siteLogo} alt={siteName} className="max-h-full max-w-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#926F18] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
                            <ShoppingBag className="w-5 h-5 text-[#071324]" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-[#EBD495] transition">
                            {siteName}
                        </span>
                        <span className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-semibold">
                            Luxury & Style
                        </span>
                    </div>
                </Link>

                {/* Desktop Search Bar */}
                <form 
                    onSubmit={handleSearchSubmit}
                    className="hidden md:flex flex-1 max-w-md relative items-center"
                >
                    <input
                        type="text"
                        placeholder="Search products, brands, categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-12 py-2.5 bg-[#0E2038] border border-slate-700/80 focus:border-[#D4AF37] text-sm text-slate-100 placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition shadow-inner"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <button
                        type="submit"
                        className="absolute right-1.5 p-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#071324] hover:brightness-110 transition shadow cursor-pointer"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>
                </form>

                {/* Desktop Navigation Links & User Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-sm font-semibold text-slate-200 hover:text-[#EBD495] transition"
                    >
                        Home
                    </Link>

                    <Link
                        href="/shop"
                        className="text-sm font-semibold text-slate-200 hover:text-[#EBD495] transition flex items-center gap-1.5"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                        <span>Shop Catalog</span>
                    </Link>

                    {/* Categories Hover Dropdown */}
                    {categoriesTree.length > 0 && (
                        <div 
                            className="relative group py-2"
                            onMouseEnter={() => setCategoriesDropdownOpen(true)}
                            onMouseLeave={() => setCategoriesDropdownOpen(false)}
                        >
                            <button className="flex items-center gap-1 text-sm font-semibold text-slate-200 group-hover:text-[#EBD495] transition cursor-pointer">
                                <span>Categories</span>
                                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#EBD495] transition" />
                            </button>

                            {categoriesDropdownOpen && (
                                <div className="absolute top-full left-0 w-64 bg-[#0E2038] border border-[#D4AF37]/30 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 pb-2 mb-2 border-b border-slate-800 text-[11px] font-bold tracking-wider text-[#D4AF37] uppercase">
                                        Browse Taxonomies
                                    </div>
                                    <div className="max-h-80 overflow-y-auto space-y-1 px-2">
                                        {categoriesTree.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/shop?category=${cat.slug}`}
                                                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-[#142C49] hover:text-[#EBD495] transition group/item"
                                            >
                                                <span>{cat.name}</span>
                                                {cat.products_count !== undefined && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#071324] text-slate-400 group-hover/item:text-[#EBD495]">
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

                    {/* User Auth Links */}
                    {auth?.user ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                            <span className="text-xs font-medium text-slate-300">
                                Hi, <strong className="text-[#EBD495]">{auth.user.name}</strong>
                            </span>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-[#0E2038] transition cursor-pointer"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-[#0E2038] hover:bg-[#142C49] border border-slate-700/60 transition"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2.5 rounded-xl bg-[#0E2038] text-slate-200 hover:text-[#EBD495] border border-slate-700 cursor-pointer"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0A1A2F] border-b border-[#D4AF37]/30 px-6 py-6 space-y-5 animate-in slide-in-from-top-4 duration-200">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-[#0E2038] border border-slate-700 text-sm text-slate-100 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    </form>

                    <div className="flex flex-col space-y-3 font-semibold text-sm">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-slate-200 hover:text-[#EBD495] py-2 border-b border-slate-800"
                        >
                            Home
                        </Link>
                        <Link
                            href="/shop"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-slate-200 hover:text-[#EBD495] py-2 border-b border-slate-800 flex items-center gap-2"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                            <span>Shop All Products</span>
                        </Link>

                        {categoriesTree.length > 0 && (
                            <div className="py-2">
                                <span className="text-xs text-[#D4AF37] tracking-wider uppercase font-bold block mb-2">
                                    Categories
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {categoriesTree.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/shop?category=${cat.slug}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-xs text-slate-300 hover:text-[#EBD495] bg-[#0E2038] p-2.5 rounded-lg border border-slate-800"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        {auth?.user ? (
                            <div className="flex items-center justify-between w-full">
                                <span className="text-xs text-slate-300">
                                    Signed in as <strong className="text-[#EBD495]">{auth.user.name}</strong>
                                </span>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold"
                                >
                                    Logout
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#071324] font-bold text-xs shadow-md"
                            >
                                Sign In / Register
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
