import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, ShieldCheck, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-teal-500 selection:text-white">
            <Head title="Sign In - ORIO STYLE" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition">
                        <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">ORIO STYLE</span>
                </Link>
                <h2 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h2>
                <p className="mt-2 text-sm text-slate-400">
                    Or{' '}
                    <Link href="/register" className="font-semibold text-teal-400 hover:text-teal-300 transition">
                        create a new customer account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
                    {status && (
                        <div className="mb-4 font-medium text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                            {status}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
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
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Password
                                </label>
                            </div>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
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
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-xs text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500/20 w-4 h-4"
                                />
                                <span className="ml-2">Remember me for 30 days</span>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition duration-150 cursor-pointer"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    {/* Quick Demo Credentials Panel */}
                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <UserCheck className="w-4 h-4 text-teal-400" />
                            <span>Demo Role Auto-Fill:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('superadmin@orio.com', 'password123')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-teal-300 border border-slate-700/80 transition text-left"
                            >
                                👑 Super Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('admin@orio.com', 'password123')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-emerald-300 border border-slate-700/80 transition text-left"
                            >
                                🛡️ Store Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('staff@orio.com', 'password123')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 transition text-left"
                            >
                                📦 Inventory Staff
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('customer@orio.com', 'password123')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-indigo-300 border border-slate-700/80 transition text-left"
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
