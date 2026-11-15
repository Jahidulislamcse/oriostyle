import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/Components/Common/ThemeToggle';

export default function Login({ status }) {
    const { settings, flash } = usePage().props;
    const siteName = settings?.site_name || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;
    const siteFavicon = settings?.site_favicon;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#071324] text-[#0E2038] dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#D4AF37] selection:text-[#071324] transition-colors duration-200">
            <Head title={`Sign In - ${siteName}`}>
                {siteFavicon && <link rel="icon" href={siteFavicon} />}
            </Head>

            {/* Top Right Theme Switcher */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <a href="/" className="inline-flex items-center gap-2.5 mb-4 group">
                    {siteLogo ? (
                        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#D4AF37]/40 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition overflow-hidden">
                            <img src={siteLogo} alt={siteName} className="max-h-full max-w-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#926F18] flex items-center justify-center shadow-md shadow-[#D4AF37]/25 group-hover:scale-105 transition">
                            <Sparkles className="w-6 h-6 text-[#071324] font-bold" />
                        </div>
                    )}
                    <span className="text-2xl font-extrabold tracking-tight text-[#0E2038] dark:text-white">{siteName}</span>
                </a>
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
                    {flash?.error && (
                        <div className="mb-4 font-semibold text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 p-3.5 rounded-xl">
                            {flash.error}
                        </div>
                    )}

                    {flash?.success && (
                        <div className="mb-4 font-semibold text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 p-3.5 rounded-xl">
                            {flash.success}
                        </div>
                    )}

                    {status && (
                        <div className="mb-4 font-semibold text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 p-3.5 rounded-xl">
                            {status}
                        </div>
                    )}

                    {/* Google OAuth Quick Sign In */}
                    <a
                        href="/auth/google/redirect"
                        className="w-full flex justify-center items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-white dark:bg-[#071324] hover:bg-slate-50 dark:hover:bg-[#0c1f38] text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-2xs hover:border-[#D4AF37]/50 transition duration-150 group"
                    >
                        <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                        </svg>
                        <span>Sign in with Google</span>
                    </a>

                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-[#1C3E63]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#0E2038] px-3 text-slate-500 dark:text-[#8EB0CF] font-bold tracking-wider">
                                Or sign in with email
                            </span>
                        </div>
                    </div>

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
                </div>
            </div>
        </div>
    );
}
