import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ShieldCheck, 
    Zap, 
    Database, 
    Layers, 
    CheckCircle2, 
    ArrowRight,
    Server,
    Sparkles,
    LayoutDashboard,
    LogIn,
    UserPlus,
    FolderTree
} from 'lucide-react';

export default function Welcome({ appName, auth, phpVersion, laravelVersion, settings = {} }) {
    const features = [
        {
            title: 'Anti-N+1 Query Policy',
            desc: 'Model::preventLazyLoading(!app()->isProduction()) actively prevents performance bottlenecks and enforces strict eager loading.',
            icon: ShieldCheck,
            badge: 'Active & Enforced',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
            title: 'Inertia.js v2 Monolithic SPA',
            desc: 'Seamless React 18+ frontend connected directly to Laravel 12 backend without separate API complexity.',
            icon: Zap,
            badge: 'Connected',
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
            title: 'Domain Action/Service Layer',
            desc: 'Strict separation of concerns keeping controllers ultra-thin and business mutations atomic and testable.',
            icon: Layers,
            badge: 'Structured',
            badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
        {
            title: 'MySQL 8.0 & Redis Engine',
            desc: 'InnoDB strict schema types, compound indexing, and Redis high-throughput caching and queue drivers.',
            icon: Database,
            badge: 'Online',
            badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
    ];

    const sprintRoadmap = [
        { phase: 'Phase 1', name: 'Setup & Anti-N+1 Guard', status: 'Completed', current: false, done: true },
        { phase: 'Phase 2', name: 'RBAC & Authentication', status: 'Completed', current: false, done: true },
        { phase: 'Phase 3', name: 'Admin Dashboard Shell', status: 'Completed', current: false, done: true },
        { phase: 'Phase 4', name: 'Category Hierarchy Tree', status: 'Completed', current: false, done: true },
        { phase: 'Phase 5', name: 'Dynamic Settings & CMS', status: 'Completed', current: false, done: true },
        { phase: 'Phase 6', name: 'Brands & WebP Media Hub', status: 'In Progress', current: true, done: false },
    ];

    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;
    const siteFavicon = settings?.site_favicon;

    return (
        <div className="min-h-screen bg-[#071324] text-slate-100 flex flex-col selection:bg-[#D4AF37] selection:text-[#071324] font-sans antialiased">
            <Head title={`${siteName} - ${settings?.site_tagline || 'Enterprise E-Commerce'}`}>
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
                                    Live
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="hidden md:flex items-center gap-2 text-xs text-[#8EB0CF] bg-[#071324] px-3 py-1.5 rounded-lg border border-[#1C3E63]">
                            <Server className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Laravel {laravelVersion || '12.x'}</span>
                            <span className="text-slate-600">•</span>
                            <span>PHP {phpVersion || '8.2+'}</span>
                        </div>

                        {auth?.user ? (
                            <div className="flex items-center gap-2">
                                {(auth.user.role === 'super_admin' || auth.user.role === 'admin') && (
                                    <Link
                                        href="/admin/dashboard"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#B89226] text-[#071324] text-xs font-bold transition shadow-xs"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5" />
                                        <span>Control Tower</span>
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142C49] hover:bg-[#1C3E63] text-[#BACDE3] hover:text-white text-xs font-semibold border border-[#1C3E63] transition"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>Sign In</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#B89226] text-[#071324] text-xs font-bold transition shadow-xs"
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
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#142C49] border border-[#D4AF37]/40 text-[#EBD495] text-xs font-bold mb-6 shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <span>Architectural Integrity & Anti-N+1 Enforced</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                        Enterprise Single-Vendor <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#EBD495]">
                            E-Commerce Platform
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-[#8EB0CF] leading-relaxed max-w-2xl mx-auto font-normal">
                        Built for ultimate speed, strict query discipline, immutable COGS profit accounting, and instant 
                        reactive state management using Laravel 12, Inertia.js React, and Tailwind CSS.
                    </p>

                    {/* Quick Access CTA Buttons */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B89226] active:bg-[#926F18] text-[#071324] font-bold text-sm shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/60 transition cursor-pointer"
                        >
                            <span>Open Admin Control Tower</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E2038] hover:bg-[#142C49] text-[#BACDE3] hover:text-white font-semibold text-sm border border-[#1C3E63] transition cursor-pointer"
                        >
                            <span>Create Customer Account</span>
                        </Link>
                    </div>
                </div>

                {/* Core Architecture Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {features.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div 
                                key={idx}
                                className="relative rounded-2xl bg-[#0E2038]/60 border border-[#1C3E63]/70 p-6 hover:border-[#D4AF37]/50 transition duration-200 backdrop-blur-sm group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#071324] border border-[#1C3E63] flex items-center justify-center text-[#D4AF37] group-hover:scale-105 group-hover:border-[#D4AF37]/50 transition duration-200">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md border bg-[#071324] text-[#EBD495] border-[#D4AF37]/40">
                                        {item.badge}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-[#8EB0CF] leading-relaxed font-normal">{item.desc}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Sprint 1 Roadmap Tracker */}
                <div className="rounded-2xl bg-[#0E2038]/40 border border-[#1C3E63]/70 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#1C3E63]/60 mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                                <span>20-Phase Architectural Blueprint Progress</span>
                            </h2>
                            <p className="text-xs text-[#8EB0CF] mt-1">Enterprise development progress roadmap</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-[#142C49] text-[#EBD495] border border-[#D4AF37]/40 font-mono font-bold">
                            Sprint 1 Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {sprintRoadmap.map((step, idx) => (
                            <div 
                                key={idx}
                                className={`rounded-xl p-4 border transition duration-150 ${
                                    step.done
                                        ? 'bg-[#0E2038] border-[#1C3E63]'
                                        : step.current
                                        ? 'bg-[#142C49] border-[#D4AF37]/60 shadow-md shadow-[#D4AF37]/10 ring-1 ring-[#D4AF37]/40'
                                        : 'bg-[#071324]/60 border-[#1C3E63]/40'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold font-mono text-[#EBD495]">{step.phase}</span>
                                    {step.done ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    ) : step.current ? (
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                                    ) : (
                                        <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                    )}
                                </div>
                                <h4 className="text-sm font-semibold text-slate-200 mb-1">{step.name}</h4>
                                <span className={`text-[10px] font-medium ${step.done ? 'text-emerald-400' : step.current ? 'text-[#EBD495] font-bold' : 'text-slate-500'}`}>
                                    {step.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#1C3E63]/70 py-6 text-center text-xs text-[#8EB0CF] bg-[#0E2038]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>{settings?.copyright_text || `${siteName} © 2026. All rights reserved.`}</span>
                    <span className="font-mono text-[#5E8CB6]">Strict Anti-N+1 Eloquent Engine Active</span>
                </div>
            </footer>
        </div>
    );
}
