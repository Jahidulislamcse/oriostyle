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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-teal-500 selection:text-white transition-colors duration-200">
            <Head title="Sign In - ORIO STYLE" />

            {/* Top Right Theme Switcher */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition">
                        <Sparkles className="w-6 h-6 text-white font-bold" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">ORIO STYLE</span>
                </Link>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in to your account</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Or{' '}
                    <Link href="/register" className="font-bold text-teal-600 dark:text-teal-400 hover:underline transition">
                        create a new customer account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
                    {status && (
                        <div className="mb-4 font-semibold text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 p-3.5 rounded-xl">
                            {status}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
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
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-bold">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                            </div>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
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
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-bold">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500/20 w-4 h-4 cursor-pointer"
                                />
                                <span className="ml-2">Remember me on this device</span>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition duration-150 cursor-pointer"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    {/* Quick Demo Credentials Panel */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span>1-Click Demo Auto-Fill:</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('superadmin@orio.com', 'password123')}
                                className="px-2 py-2 rounded-xl bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-700 font-bold transition text-center cursor-pointer shadow-2xs"
                            >
                                👑 Super Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('admin@orio.com', 'password123')}
                                className="px-2 py-2 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 font-bold transition text-center cursor-pointer shadow-2xs"
                            >
                                🛡️ Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('customer@orio.com', 'password123')}
                                className="px-2 py-2 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 font-bold transition text-center cursor-pointer shadow-2xs"
                            >
                                🛍️ Customer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
