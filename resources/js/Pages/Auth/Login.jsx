import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, Sparkles, ArrowRight, UserCheck, Shield } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-950 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-200">
            <Head title="Sign In - ORIO STYLE" />

            {/* Top Right Theme Switcher */}
            <div className="absolute top-5 right-5 sm:top-7 sm:right-7">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition">
                        <Sparkles className="w-7 h-7 text-white font-bold" />
                    </div>
                    <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">ORIO STYLE</span>
                </Link>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">Sign in to your account</h2>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Or{' '}
                    <Link href="/register" className="font-bold text-orange-600 dark:text-orange-400 hover:underline transition">
                        create a new customer account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 py-9 px-7 shadow-xl rounded-3xl sm:px-10">
                    {status && (
                        <div className="mb-5 font-bold text-sm text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-700 p-4 rounded-2xl">
                            {status}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={submit}>
                        <div>
                            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
                                Email Address
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    required
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 text-sm sm:text-base font-medium transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
                                Password
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    required
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 text-sm sm:text-base font-medium transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-2 border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500/20 w-4.5 h-4.5 cursor-pointer"
                                />
                                <span className="ml-2.5">Remember me on this device</span>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2.5 py-3.5 px-5 rounded-2xl shadow-md text-base font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 transition duration-150 cursor-pointer"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {/* Quick Demo Credentials Panel */}
                    <div className="mt-9 pt-7 border-t-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3.5">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <UserCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                1-Click Demo Login
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                Dev Helpers
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('superadmin@orio.com', 'password123')}
                                className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 border-2 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-black transition cursor-pointer flex flex-col items-center shadow-xs"
                            >
                                <span>Super Admin</span>
                                <span className="text-[10px] opacity-75 font-normal">All Access</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('admin@orio.com', 'password123')}
                                className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900/60 border-2 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200 text-xs font-black transition cursor-pointer flex flex-col items-center shadow-xs"
                            >
                                <span>Store Admin</span>
                                <span className="text-[10px] opacity-75 font-normal">Staff Access</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('customer@orio.com', 'password123')}
                                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-black transition cursor-pointer flex flex-col items-center shadow-xs"
                            >
                                <span>Customer</span>
                                <span className="text-[10px] opacity-75 font-normal">Storefront</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
