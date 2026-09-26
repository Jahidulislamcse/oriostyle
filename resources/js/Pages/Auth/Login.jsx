import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import ThemeToggle from '@/Components/Common/ThemeToggle';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login.store'), {
            onFinish: () => reset('password'),
        });
    };

    const fillDemoCredentials = (email, password) => {
        setData((prev) => ({
            ...prev,
            email,
            password,
        }));
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#071324] text-[#0E2038] dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#D4AF37] selection:text-[#071324] transition-colors duration-200">
            <Head title="Sign In - ORIO STYLE LTD" />

            {/* Top Right Theme Switcher */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#926F18] flex items-center justify-center shadow-md shadow-[#D4AF37]/25 group-hover:scale-105 transition">
                        <Sparkles className="w-6 h-6 text-[#071324] font-bold" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-[#0E2038] dark:text-white">ORIO STYLE LTD</span>
                </Link>
                <h2 className="text-xl font-extrabold text-[#0E2038] dark:text-white tracking-tight">Sign in to your account</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-[#8EB0CF]">
                    Or{' '}
                    <Link href="/register" className="font-bold text-[#926F18] dark:text-[#EBD495] hover:underline transition">
                        create a new customer account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
                    {status && (
                        <div className="mb-4 font-semibold text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 p-3.5 rounded-xl">
                            {status}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                Email Address
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#5E8CB6]">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    required
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-bold">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                Password
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#5E8CB6]">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    required
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-bold">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-xs font-medium text-slate-700 dark:text-[#BACDE3] cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded bg-white dark:bg-[#071324] border-slate-300 dark:border-[#1C3E63] text-[#D4AF37] focus:ring-[#D4AF37]/30 w-4 h-4 cursor-pointer"
                                />
                                <span className="ml-2">Remember me on this device</span>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-md shadow-[#D4AF37]/20 text-sm font-bold text-[#071324] bg-[#D4AF37] hover:bg-[#B89226] active:bg-[#926F18] border border-[#D4AF37]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 disabled:opacity-50 transition duration-150 cursor-pointer"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    {/* Quick Demo Credentials Panel */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#1C3E63]/70">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#BACDE3] flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#EBD495]" />
                                1-Click Demo Login
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-[#8EB0CF] bg-slate-100 dark:bg-[#071324] px-2 py-0.5 rounded-md border border-transparent dark:border-[#1C3E63]">
                                Dev Helpers
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('superadmin@orio.com', 'password123')}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-[#071324] dark:hover:bg-[#142C49] border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-semibold transition cursor-pointer flex flex-col items-center"
                            >
                                <span>Super Admin</span>
                                <span className="text-[9px] opacity-75">All Access</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('admin@orio.com', 'password123')}
                                className="px-2.5 py-1.5 rounded-lg bg-[#FDFBF5] hover:bg-[#FBF5E6] dark:bg-[#071324] dark:hover:bg-[#142C49] border border-[#F5E7C2] dark:border-[#D4AF37]/50 text-[#926F18] dark:text-[#EBD495] text-xs font-semibold transition cursor-pointer flex flex-col items-center"
                            >
                                <span>Store Admin</span>
                                <span className="text-[9px] opacity-75">Staff Access</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('customer@orio.com', 'password123')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#071324] dark:hover:bg-[#142C49] border border-slate-200 dark:border-[#1C3E63] text-slate-700 dark:text-[#BACDE3] text-xs font-semibold transition cursor-pointer flex flex-col items-center"
                            >
                                <span>Customer</span>
                                <span className="text-[9px] opacity-75">Storefront</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
