import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
    const { settings, appName } = usePage().props;
    const siteName = settings?.site_name || appName || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;

    return (
        <footer className="bg-[#040C18] text-slate-300 border-t border-[#D4AF37]/20 pt-16 pb-12 font-sans relative overflow-hidden">
            {/* Ambient Background Blur */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Value Highlights Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-2xl bg-[#0E2038]/60 border border-[#D4AF37]/20 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 shrink-0">
                            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">100% Authentic Guarantee</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Every item is verified & quality checked</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 shrink-0">
                            <Truck className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Express Nationwide Shipping</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Fast, safe & tracked delivery</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 shrink-0">
                            <RefreshCw className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Dedicated Support</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Responsive assistance for all orders</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                {/* Brand Column */}
                <div className="space-y-4 md:col-span-1">
                    <Link href="/" className="flex items-center gap-3">
                        {siteLogo ? (
                            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#D4AF37]/40 flex items-center justify-center">
                                <img src={siteLogo} alt={siteName} className="max-h-full max-w-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#926F18] flex items-center justify-center shadow-md">
                                <ShoppingBag className="w-5 h-5 text-[#071324]" />
                            </div>
                        )}
                        <span className="font-extrabold text-lg text-white">{siteName}</span>
                    </Link>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {settings?.storefront_description || 'Your premier luxury ecommerce destination. Experience unparalleled craftsmanship, curated catalog, and seamless shopping.'}
                    </p>
                    <div className="pt-2 text-xs text-[#EBD495] flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{settings?.storefront_tagline || 'Excellence in Fashion & Retail'}</span>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4">Quick Navigation</h5>
                    <ul className="space-y-2.5 text-xs text-slate-400">
                        <li>
                            <Link href="/" className="hover:text-[#EBD495] transition">Home</Link>
                        </li>
                        <li>
                            <Link href="/shop" className="hover:text-[#EBD495] transition">Shop Full Catalog</Link>
                        </li>
                        <li>
                            <Link href="/shop?on_sale=1" className="hover:text-[#EBD495] transition">Special Offers & Sales</Link>
                        </li>
                        <li>
                            <Link href="/login" className="hover:text-[#EBD495] transition">Account Login</Link>
                        </li>
                    </ul>
                </div>

                {/* Information */}
                <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4">Customer Support</h5>
                    <ul className="space-y-2.5 text-xs text-slate-400">
                        <li>
                            <span className="hover:text-slate-200 cursor-default">Shipping & Delivery Info</span>
                        </li>
                        <li>
                            <span className="hover:text-slate-200 cursor-default">Return & Exchange Policy</span>
                        </li>
                        <li>
                            <span className="hover:text-slate-200 cursor-default">Terms & Conditions</span>
                        </li>
                        <li>
                            <span className="hover:text-slate-200 cursor-default">Privacy Policy</span>
                        </li>
                    </ul>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4">Contact Information</h5>
                    {settings?.contact_address && (
                        <div className="flex items-start gap-2 text-xs text-slate-400">
                            <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span>{settings.contact_address}</span>
                        </div>
                    )}
                    {settings?.contact_phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <span>{settings.contact_phone}</span>
                        </div>
                    )}
                    {settings?.contact_email && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <span>{settings.contact_email}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>{settings?.copyright_text || `${siteName} © ${new Date().getFullYear()}. All rights reserved.`}</p>
                <div className="flex items-center gap-4">
                    <span className="hover:text-slate-300 transition cursor-default">Privacy</span>
                    <span>•</span>
                    <span className="hover:text-slate-300 transition cursor-default">Terms</span>
                    <span>•</span>
                    <span className="hover:text-[#EBD495] transition cursor-default">Powered by ORIO Engine</span>
                </div>
            </div>
        </footer>
    );
}
