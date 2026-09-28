import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Sparkles, LayoutDashboard, LogIn } from 'lucide-react';

export default function Welcome({ appName, auth, settings = {} }) {
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;
    const siteFavicon = settings?.site_favicon;

    return (
        <div className="min-h-screen bg-[#071324] text-slate-100 flex flex-col justify-between p-6 sm:p-8 selection:bg-[#D4AF37] selection:text-[#071324] font-sans antialiased relative overflow-hidden">
            <Head title={`${siteName} - System Development in Progress`}>
                {siteFavicon && <link rel="icon" href={siteFavicon} />}
            </Head>

            {/* Subtle Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Navigation / Staff Access */}
            <header className="w-full max-w-7xl mx-auto flex justify-end z-10">
                {auth?.user ? (
                    <div className="flex items-center gap-3">
                        {(auth.user.role === 'super_admin' || auth.user.role === 'admin') && (
                            <Link
                                href="/admin/dashboard"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0E2038] hover:bg-[#142C49] text-[#EBD495] text-xs font-semibold border border-[#D4AF37]/40 transition shadow-xs"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>Admin Dashboard</span>
                            </Link>
                        )}
                        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                            Logged in as <span className="text-[#EBD495] font-semibold">{auth.user.name}</span>
                        </span>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-[#EBD495] hover:bg-[#0E2038]/60 border border-transparent hover:border-[#1C3E63] text-xs font-medium transition"
                    >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                    </Link>
                )}
            </header>

            {/* Main Centered Content */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 py-12">
                <div className="flex flex-col items-center max-w-lg mx-auto">
                    {/* Brand Logo */}
                    {siteLogo ? (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-[#0E2038] border-2 border-[#D4AF37]/50 p-3.5 flex items-center justify-center shadow-2xl shadow-[#D4AF37]/20 overflow-hidden mb-6 hover:scale-105 transition duration-300">
                            <img src={siteLogo} alt={siteName} className="max-h-full max-w-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#926F18] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/25 mb-6 hover:scale-105 transition duration-300">
                            <Sparkles className="w-12 h-12 text-[#071324]" />
                        </div>
                    )}

                    {/* Site Name */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
                        {siteName}
                    </h1>

                    {/* System In Progress Notice */}
                    <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-[#0E2038] border border-[#D4AF37]/40 text-[#EBD495] text-xs sm:text-sm font-semibold shadow-lg shadow-[#071324]/60">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                        <span>System development is in progress.</span>
                    </div>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="w-full max-w-7xl mx-auto text-center text-xs text-slate-500 z-10">
                <p>{settings?.copyright_text || `${siteName} © 2026. All rights reserved.`}</p>
            </footer>
        </div>
    );
}
