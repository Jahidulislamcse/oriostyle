import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Lock, Mail, User, Phone, Sparkles, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/Components/Common/ThemeToggle';

export default function Register() {
    const { settings } = usePage().props;
    const siteName = settings?.site_name || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;
    const siteFavicon = settings?.site_favicon;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#071324] text-[#0E2038] dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#D4AF37] selection:text-[#071324] transition-colors duration-200">
            <Head title={`Create Account - ${siteName}`}>
                {siteFavicon && <link rel="icon" href={siteFavicon} />}
            </Head>

            {/* Top Right Theme Switcher */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
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
                </Link>
                <h2 className="text-xl font-extrabold text-[#0E2038] dark:text-white tracking-tight">Create your customer account</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-[#8EB0CF]">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-[#926F18] dark:text-[#EBD495] hover:underline transition">
                        Sign in instead
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
                    <form className="space-y-4.5" onSubmit={submit}>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                Full Name
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#5E8CB6]">
                                    <User className="h-4 w-4" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    autoComplete="name"
                                    required
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm transition"
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">{errors.name}</p>
                            )}
                        </div>

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
                                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                Phone Number (Optional)
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#5E8CB6]">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    autoComplete="tel"
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm transition"
                                    placeholder="+880 1700 000000"
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">{errors.phone}</p>
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
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#5E8CB6]">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-sm transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-md shadow-[#D4AF37]/20 text-sm font-bold text-[#071324] bg-[#D4AF37] hover:bg-[#B89226] active:bg-[#926F18] border border-[#D4AF37]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 disabled:opacity-50 transition duration-150 cursor-pointer"
                            >
                                <span>Create Account</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
