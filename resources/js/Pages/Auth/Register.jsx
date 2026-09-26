import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, User, Phone, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/Components/Common/ThemeToggle';

export default function Register() {
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
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-950 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-200">
            <Head title="Create Account - ORIO STYLE" />

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
                <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">Create your customer account</h2>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-orange-600 dark:text-orange-400 hover:underline transition">
                        Sign in instead
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 py-9 px-7 shadow-xl rounded-3xl sm:px-10">
                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
                                Full Name
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    autoComplete="name"
                                    required
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 text-sm sm:text-base font-medium transition"
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold">{errors.name}</p>
                            )}
                        </div>

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
                                Phone Number (Optional)
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    autoComplete="tel"
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 text-sm sm:text-base font-medium transition"
                                    placeholder="+880 1700 000000"
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold">{errors.phone}</p>
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
                                    autoComplete="new-password"
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

                        <div>
                            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 text-sm sm:text-base font-medium transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2.5 py-3.5 px-5 rounded-2xl shadow-md text-base font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 transition duration-150 cursor-pointer"
                            >
                                <span>Create Account</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
