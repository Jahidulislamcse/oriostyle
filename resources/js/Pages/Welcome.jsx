import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ShieldCheck, 
    Zap, 
    Database, 
    Layers, 
    CheckCircle2, 
    Cpu, 
    Code2, 
    ArrowRight,
    Server,
    Sparkles
} from 'lucide-react';

export default function Welcome({ appName, auth, phpVersion, laravelVersion, dbStatus, antiN1Status }) {
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
            badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
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
        { phase: 'Phase 1', name: 'Setup & Anti-N+1 Guard', status: 'Completed', current: true },
        { phase: 'Phase 2', name: 'RBAC & Authentication', status: 'Next Up', current: false },
        { phase: 'Phase 3', name: 'Admin Dashboard Shell', status: 'Planned', current: false },
        { phase: 'Phase 4', name: 'Category Hierarchy Tree', status: 'Planned', current: false },
        { phase: 'Phase 5', name: 'Brands & WebP Media Hub', status: 'Planned', current: false },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white font-sans antialiased">
            <Head title="Enterprise E-Commerce Foundation" />

            {/* Top Navigation */}
            <header className="border-b border-slate-800/80 backdrop-blur-md bg-slate-900/70 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                {appName || 'ORIO ECOMMERCE'}
                                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                    Phase 1
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                            <Server className="w-3.5 h-3.5 text-teal-400" />
                            <span>Laravel {laravelVersion || '12.x'}</span>
                            <span className="text-slate-600">•</span>
                            <span>PHP {phpVersion || '8.2+'}</span>
                        </div>

                        {auth?.user ? (
                            <span className="text-sm text-teal-400 font-medium">Hello, {auth.user.name}</span>
                        ) : (
                            <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>System Healthy</span>
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-medium mb-6">
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        <span>Architectural Integrity & Anti-N+1 Enforced</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                        Enterprise Single-Vendor <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
                            E-Commerce Platform
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 leading-relaxed">
                        Built for ultimate speed, strict query discipline, immutable COGS profit accounting, and instant 
                        reactive state management using Laravel 12, Inertia.js, and React 18+.
                    </p>
                </div>

                {/* Core Architecture Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {features.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div 
                                key={idx}
                                className="relative rounded-2xl bg-slate-800/40 border border-slate-700/60 p-6 hover:border-teal-500/40 transition duration-200 backdrop-blur-sm group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/60 flex items-center justify-center text-teal-400 group-hover:scale-105 group-hover:bg-teal-500/10 transition duration-200">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-md border bg-slate-800/80 text-teal-300 border-teal-500/30">
                                        {item.badge}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Sprint 1 Roadmap Tracker */}
                <div className="rounded-2xl bg-slate-800/30 border border-slate-800 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-teal-400" />
                                <span>Sprint 1: Core Foundation Roadmap</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">20-Phase Architectural Blueprint Progress</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
                            Phase 1 Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {sprintRoadmap.map((step, idx) => (
                            <div 
                                key={idx}
                                className={`rounded-xl p-4 border transition duration-150 ${
                                    step.current 
                                        ? 'bg-teal-950/40 border-teal-500/50 shadow-md shadow-teal-950/50 ring-1 ring-teal-500/30' 
                                        : 'bg-slate-800/40 border-slate-700/40'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold font-mono text-teal-400">{step.phase}</span>
                                    {step.current ? (
                                        <CheckCircle2 className="w-4 h-4 text-teal-400" />
                                    ) : (
                                        <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                    )}
                                </div>
                                <h4 className="text-sm font-semibold text-slate-200 mb-1">{step.name}</h4>
                                <span className={`text-[10px] font-medium ${step.current ? 'text-teal-300' : 'text-slate-500'}`}>
                                    {step.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>ORIO E-Commerce &copy; 2026. Lead Architect: Jahidul Islam.</span>
                    <span className="font-mono text-slate-600">Strict Anti-N+1 Eloquent Engine Active</span>
                </div>
            </footer>
        </div>
    );
}
