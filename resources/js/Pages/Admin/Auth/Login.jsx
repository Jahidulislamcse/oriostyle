import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AdminLogin({ status }) {
    const { settings = {}, flash = {} } = usePage().props;
    const siteName = settings?.site_name || 'ORIO STYLE Backoffice';
    const siteLogo = settings?.site_logo;

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
            <Head title={`Admin Portal Login - ${siteName}`} />

            {/* Background Subtle Gradient & Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                {/* Brand / Logo */}
                <div className="inline-flex flex-col items-center gap-2 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10 p-2">
                        {siteLogo ? (
                            <img src={siteLogo} alt={siteName} className="max-h-full max-w-full object-contain" />
                        ) : (
                            <Shield className="w-7 h-7 text-amber-400" />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-wider text-white">ORIO</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold uppercase tracking-widest">
                            Admin Portal
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Secure backoffice authentication for store administrators
                    </p>
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
                    {/* Status Feedback */}
                    {status && (
                        <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-medium">
                            {status}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>{flash.error}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                Administrative Email
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@orio.com"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                Secure Password
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition cursor-pointer"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.password}</span>
                                </p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-xs font-medium text-slate-400 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500/40 w-4 h-4 cursor-pointer"
                                />
                                <span className="ml-2">Remember credentials on this browser</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition duration-150 cursor-pointer"
                            >
                                <span>{processing ? 'Authenticating...' : 'Sign In to Backoffice'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    {/* Return link */}
                    <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                        <a
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-amber-400 transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Return to Public Storefront</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
