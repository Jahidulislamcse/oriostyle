import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ShieldCheck, 
    Sparkles, 
    Truck, 
    CreditCard, 
    Headphones, 
    ArrowRight, 
    LayoutDashboard, 
    LogIn, 
    UserPlus, 
    FolderTree,
    Tag,
    ShoppingBag,
    CheckCircle2,
    Crown,
    Star
} from 'lucide-react';

export default function Welcome({ appName, auth, settings = {} }) {
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;
    const siteFavicon = settings?.site_favicon;
    const siteTagline = settings?.site_tagline || 'Premium Fashion & Tailored Apparel';

    const valuePillars = [
        {
            title: 'Artisan Craftsmanship',
            desc: 'Precision tailoring with hand-picked fabrics, breathable weaves, and meticulous attention to every seam and finish.',
            icon: Sparkles,
            tag: 'Premium Quality',
        },
        {
            title: 'Nationwide Express Delivery',
            desc: 'Rapid and secure doorstep delivery across Bangladesh with protective packaging and real-time tracking.',
            icon: Truck,
            tag: 'Fast & Secure',
        },
        {
            title: 'Flexible & Secure Payments',
            desc: 'Convenient Cash on Delivery, instant mobile banking (bKash, Nagad), and encrypted digital card gateways.',
            icon: CreditCard,
            tag: 'Safe Checkout',
        },
        {
            title: 'Dedicated Customer Support',
            desc: 'Direct WhatsApp styling assistance and dedicated helpline to assist you with sizing, orders, and inquiries.',
            icon: Headphones,
            tag: '6 Days a Week',
        },
    ];

    const quickHighlights = [
        {
            title: 'Categories & Taxonomy',
            desc: 'Browse structured formal, casual, and seasonal collections.',
            icon: FolderTree,
            href: '/admin/categories',
            action: 'View Categories',
        },
        {
            title: 'Brands & Collections',
            desc: 'Explore signature lines and curated partner designer labels.',
            icon: Tag,
            href: '/admin/brands',
            action: 'Explore Brands',
        },
        {
            title: 'Curated Storefront',
            desc: 'Experience modern, high-speed responsive shopping on any device.',
            icon: ShoppingBag,
            href: auth?.user ? '/admin/dashboard' : '/login',
            action: auth?.user ? 'Open Dashboard' : 'Member Login',
        },
    ];

    return (
        <div className="min-h-screen bg-[#071324] text-slate-100 flex flex-col selection:bg-[#D4AF37] selection:text-[#071324] font-sans antialiased">
            <Head title={`${siteName} - ${siteTagline}`}>
                {siteFavicon && <link rel="icon" href={siteFavicon} />}
            </Head>

            {/* Top Navigation */}
            <header className="border-b border-[#1C3E63]/70 backdrop-blur-md bg-[#0E2038]/80 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {siteLogo ? (
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#071324] border border-[#F5E7C2] dark:border-[#D4AF37]/40 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                                <img src={siteLogo} alt={siteName} className="max-h-full max-w-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#926F18] flex items-center justify-center shadow-md shadow-[#D4AF37]/25">
                                <Sparkles className="w-5 h-5 text-[#071324] font-bold" />
                            </div>
                        )}
                        <div>
                            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                                {siteName}
                                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#142C49] text-[#EBD495] border border-[#D4AF37]/40">
                                    Official
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {auth?.user ? (
                            <div className="flex items-center gap-3">
                                {(auth.user.role === 'super_admin' || auth.user.role === 'admin') && (
                                    <Link
                                        href="/admin/dashboard"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#B89226] text-[#071324] text-xs font-bold transition shadow-xs"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5" />
                                        <span>Dashboard</span>
                                    </Link>
                                )}
                                <span className="text-xs text-[#EBD495] font-semibold hidden sm:inline">
                                    Hello, {auth.user.name}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#142C49] hover:bg-[#1C3E63] text-[#BACDE3] hover:text-white text-xs font-semibold border border-[#1C3E63] transition"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>Sign In</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#B89226] text-[#071324] text-xs font-bold transition shadow-xs"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>Register</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col justify-center">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#142C49] border border-[#D4AF37]/40 text-[#EBD495] text-xs font-bold mb-6 shadow-sm">
                        <Crown className="w-4 h-4 text-[#D4AF37]" />
                        <span>Curated Luxury & Tailored Lifestyle</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                        Crafted for Elegance & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#EBD495]">
                            Timeless Modern Style
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-[#8EB0CF] leading-relaxed max-w-2xl mx-auto font-normal">
                        Discover exclusive collections of formal shirts, tailored attire, and premium lifestyle apparel 
                        crafted with uncompromising attention to fabric, fit, and aesthetic refinement.
                    </p>

                    {/* Quick Access CTA Buttons */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                        {auth?.user ? (
                            <Link
                                href="/admin/dashboard"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#B89226] active:bg-[#926F18] text-[#071324] font-bold text-sm shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/60 transition cursor-pointer"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Go to Dashboard</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#B89226] active:bg-[#926F18] text-[#071324] font-bold text-sm shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/60 transition cursor-pointer"
                                >
                                    <span>Explore Collection</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0E2038] hover:bg-[#142C49] text-[#BACDE3] hover:text-white font-semibold text-sm border border-[#1C3E63] transition cursor-pointer"
                                >
                                    <span>Create Customer Account</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Core Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {valuePillars.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div 
                                key={idx}
                                className="relative rounded-2xl bg-[#0E2038]/60 border border-[#1C3E63]/70 p-6 hover:border-[#D4AF37]/50 transition duration-200 backdrop-blur-sm group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#071324] border border-[#1C3E63] flex items-center justify-center text-[#D4AF37] group-hover:scale-105 group-hover:border-[#D4AF37]/50 transition duration-200">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md border bg-[#071324] text-[#EBD495] border-[#D4AF37]/40">
                                            {item.tag}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-xs text-[#8EB0CF] leading-relaxed font-normal">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Catalog & Experience Highlights */}
                <div className="rounded-2xl bg-[#0E2038]/40 border border-[#1C3E63]/70 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#1C3E63]/60 mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                                <span>Featured Catalog & Storefront Hub</span>
                            </h2>
                            <p className="text-xs text-[#8EB0CF] mt-1">Direct access to curated merchandise and store navigation</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#EBD495] font-semibold bg-[#142C49] px-3 py-1.5 rounded-full border border-[#D4AF37]/40">
                            <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                            <span>100% Authentic Quality Guarantee</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {quickHighlights.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <Link 
                                    key={idx}
                                    href={item.href}
                                    className="rounded-xl p-5 bg-[#0E2038] hover:bg-[#142C49] border border-[#1C3E63] hover:border-[#D4AF37]/60 transition duration-200 group flex flex-col justify-between block"
                                >
                                    <div>
                                        <div className="w-10 h-10 rounded-xl bg-[#071324] border border-[#1C3E63] group-hover:border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mb-3 transition">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#EBD495] transition">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-[#8EB0CF] leading-relaxed mb-4">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] group-hover:text-[#F5D77F] transition">
                                        <span>{item.action}</span>
                                        <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#1C3E63]/70 py-6 text-center text-xs text-[#8EB0CF] bg-[#0E2038]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span>{settings?.copyright_text || `${siteName} © 2026. All rights reserved.`}</span>
                    <div className="flex items-center gap-3 text-xs text-[#BACDE3]">
                        {settings?.support_phone && (
                            <span>Helpline: <strong className="text-white">{settings.support_phone}</strong></span>
                        )}
                        {settings?.support_phone && <span className="text-slate-600">•</span>}
                        <span>100% Authentic Quality Guarantee</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
