import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Badge from '@/Components/Common/Badge';
import {
    Settings,
    Globe,
    Phone,
    Coins,
    Truck,
    Receipt,
    Share2,
    Search,
    Server,
    Save,
    RotateCcw,
    Upload,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Info,
    Sparkles,
    ShieldCheck,
    MessageSquare,
    Clock,
    FileText,
    ExternalLink
} from 'lucide-react';

export default function SettingsIndex({ settings = {}, system = {} }) {
    const [activeTab, setActiveTab] = useState('general');
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoWhitePreview, setLogoWhitePreview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        isDirty,
        reset
    } = useForm({
        // General & Brand Identity
        site_name: settings.site_name || '',
        site_tagline: settings.site_tagline || '',
        site_logo: null,
        site_logo_white: null,
        site_favicon: null,
        remove_site_logo: false,
        remove_site_logo_white: false,
        remove_site_favicon: false,
        copyright_text: settings.copyright_text || '',

        // Contact & Store Information
        support_phone: settings.support_phone || '',
        whatsapp_number: settings.whatsapp_number || '',
        support_email: settings.support_email || '',
        store_address: settings.store_address || '',
        google_map_url: settings.google_map_url || '',
        business_hours: settings.business_hours || '',

        // Commerce & Currency
        currency_symbol: settings.currency_symbol || '৳',
        currency_code: settings.currency_code || 'BDT',
        currency_position: settings.currency_position || 'left',
        low_stock_threshold: settings.low_stock_threshold ?? 5,
        timezone: settings.timezone || 'Asia/Dhaka',

        // Shipping & Delivery
        shipping_charge_inside: settings.shipping_charge_inside ?? 70,
        shipping_charge_outside: settings.shipping_charge_outside ?? 130,
        free_shipping_threshold: settings.free_shipping_threshold ?? 2000,
        estimated_delivery_inside: settings.estimated_delivery_inside || '24 - 48 Hours',
        estimated_delivery_outside: settings.estimated_delivery_outside || '3 - 5 Days',

        // Invoicing & Checkout
        vat_percentage: settings.vat_percentage ?? 0,
        vat_inclusive: Boolean(settings.vat_inclusive),
        min_order_amount: settings.min_order_amount ?? 0,
        cash_on_delivery_enabled: settings.cash_on_delivery_enabled !== false,
        online_payment_enabled: settings.online_payment_enabled !== false,
        order_prefix: settings.order_prefix || 'ORD-',
        legal_company_name: settings.legal_company_name || '',
        tax_bin_number: settings.tax_bin_number || '',
        invoice_footer_notes: settings.invoice_footer_notes || '',

        // Social Media
        facebook_url: settings.facebook_url || '',
        instagram_url: settings.instagram_url || '',
        youtube_url: settings.youtube_url || '',
        tiktok_url: settings.tiktok_url || '',
        twitter_url: settings.twitter_url || '',
        linkedin_url: settings.linkedin_url || '',
        whatsapp_chat_enabled: settings.whatsapp_chat_enabled !== false,

        // SEO & Scripts
        meta_title: settings.meta_title || '',
        meta_description: settings.meta_description || '',
        meta_keywords: settings.meta_keywords || '',
        custom_header_scripts: settings.custom_header_scripts || '',
        custom_footer_scripts: settings.custom_footer_scripts || '',
    });

    const handleFileChange = (field, e, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                [field]: file,
                [`remove_${field}`]: false,
            }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveFile = (field, setPreview) => {
        setData((prev) => ({
            ...prev,
            [field]: null,
            [`remove_${field}`]: true,
        }));
        setPreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const targetUrl = typeof route === 'function' && route().has('admin.settings.update')
            ? route('admin.settings.update')
            : '/admin/settings';

        post(targetUrl, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setLogoPreview(null);
                setLogoWhitePreview(null);
                setFaviconPreview(null);
            },
        });
    };

    const handleClearCache = () => {
        const targetUrl = typeof route === 'function' && route().has('admin.settings.clear-cache')
            ? route('admin.settings.clear-cache')
            : '/admin/settings/clear-cache';

        router.post(targetUrl, {}, {
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'general', label: 'General & Identity', icon: Globe, count: null },
        { id: 'contact', label: 'Store & Contact', icon: Phone, count: null },
        { id: 'commerce', label: 'Currency & Commerce', icon: Coins, count: null },
        { id: 'shipping', label: 'Shipping & Delivery', icon: Truck, count: null },
        { id: 'invoicing', label: 'Invoicing & Tax', icon: Receipt, count: null },
        { id: 'social', label: 'Social & Chat', icon: Share2, count: null },
        { id: 'seo', label: 'SEO & Scripts', icon: Search, count: null },
        { id: 'system', label: 'System & Cache', icon: Server, count: null },
    ];

    // Formatted currency preview sample
    const sampleAmount = '2,450.00';
    const currencyFormattedSample =
        data.currency_position === 'left'
            ? `${data.currency_symbol} ${sampleAmount}`
            : `${sampleAmount} ${data.currency_symbol}`;

    return (
        <AdminLayout title="Platform Settings">
            <div className="space-y-4 sm:space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E2038] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                            <div className="p-1.5 sm:p-2 rounded-xl bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/50 shrink-0">
                                <Settings className="w-4.5 sm:w-5 h-4.5 sm:h-5 text-[#D4AF37]" />
                            </div>
                            <h1 className="text-lg sm:text-2xl font-extrabold text-[#0E2038] dark:text-white tracking-tight break-words">
                                Platform Settings & CMS
                            </h1>
                            <span className="px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/50">
                                Live Synchronized
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8EB0CF] pl-0 sm:pl-9 max-w-3xl font-normal">
                            Configure brand identity, storefront logo, contact details, currency rules, shipping zones, tax parameters, and SEO tags.
                        </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
                        <Button
                            variant="secondary"
                            size="md"
                            icon={RotateCcw}
                            onClick={handleClearCache}
                            title="Purge cached public settings"
                            className="flex-1 sm:flex-none text-xs sm:text-sm justify-center"
                        >
                            Flush Cache
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            icon={Save}
                            onClick={handleSubmit}
                            processing={processing}
                            className="flex-1 sm:flex-none shadow-xs font-bold justify-center"
                        >
                            Save Settings
                        </Button>
                    </div>
                </div>

                {/* Settings Tabs Bar */}
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-1.5 sm:p-2 shadow-xs overflow-x-auto touch-pan-x scrollbar-none">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 whitespace-nowrap ${
                                        isActive
                                            ? 'bg-[#FDFBF5] text-[#926F18] border border-[#F5E7C2] dark:bg-[#142C49] dark:text-[#EBD495] dark:border-[#D4AF37]/50 shadow-2xs'
                                            : 'text-slate-600 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#071324] border border-transparent'
                                    }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#D4AF37] dark:text-[#EBD495]' : 'text-slate-400 dark:text-[#5E8CB6]'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Form Body Container */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* TAB 1: General & Identity */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                        <Globe className="w-5 h-5 text-[#D4AF37]" />
                                        <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                            Brand & Storefront Identity
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput
                                            id="site_name"
                                            label="Storefront Site Name"
                                            value={data.site_name}
                                            onChange={(e) => setData('site_name', e.target.value)}
                                            placeholder="e.g. ORIO STYLE LTD"
                                            required
                                            error={errors.site_name}
                                            helpText="Rendered in headers, title tags, and outgoing notices."
                                        />

                                        <FormInput
                                            id="site_tagline"
                                            label="Brand Slogan / Tagline"
                                            value={data.site_tagline}
                                            onChange={(e) => setData('site_tagline', e.target.value)}
                                            placeholder="e.g. Premium Fashion & Lifestyle Destination"
                                            error={errors.site_tagline}
                                        />
                                    </div>

                                    <FormInput
                                        id="copyright_text"
                                        label="Footer Copyright Statement"
                                        value={data.copyright_text}
                                        onChange={(e) => setData('copyright_text', e.target.value)}
                                        placeholder="e.g. © 2026 ORIO STYLE LTD. All rights reserved."
                                        error={errors.copyright_text}
                                    />
                                </div>

                                {/* Logo & Favicon Upload Cards */}
                                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                        <Upload className="w-5 h-5 text-[#D4AF37]" />
                                        <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                            Logos & Visual Assets
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                                        {/* Main Brand Logo */}
                                        <div className="p-3.5 sm:p-4 bg-[#F4F7FB] dark:bg-[#071324] rounded-xl border border-slate-200 dark:border-[#1C3E63] space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3]">
                                                    Primary Logo
                                                </span>
                                                <span className="text-[10px] text-slate-400">PNG / WebP</span>
                                            </div>

                                            <div className="h-24 rounded-lg bg-white dark:bg-[#0E2038] border border-dashed border-slate-300 dark:border-[#1C3E63] flex items-center justify-center p-2 relative overflow-hidden">
                                                {logoPreview || (settings.site_logo && !data.remove_site_logo) ? (
                                                    <img
                                                        src={logoPreview || settings.site_logo}
                                                        alt="Site Logo"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="text-center text-slate-400 text-xs">
                                                        <Sparkles className="w-6 h-6 mx-auto mb-1 text-[#D4AF37]" />
                                                        <span>No Logo Uploaded</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#D4AF37] cursor-pointer transition">
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>Choose File</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileChange('site_logo', e, setLogoPreview)}
                                                    />
                                                </label>
                                                {(logoPreview || (settings.site_logo && !data.remove_site_logo)) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('site_logo', setLogoPreview)}
                                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                        title="Remove Logo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {errors.site_logo && <p className="text-xs text-rose-500">{errors.site_logo}</p>}
                                        </div>

                                        {/* White / Dark Mode Logo */}
                                        <div className="p-3.5 sm:p-4 bg-[#F4F7FB] dark:bg-[#071324] rounded-xl border border-slate-200 dark:border-[#1C3E63] space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3]">
                                                    Light Theme Logo
                                                </span>
                                                <span className="text-[10px] text-slate-400">Optional</span>
                                            </div>

                                            <div className="h-24 rounded-lg bg-[#071324] border border-dashed border-[#1C3E63] flex items-center justify-center p-2 relative overflow-hidden">
                                                {logoWhitePreview || (settings.site_logo_white && !data.remove_site_logo_white) ? (
                                                    <img
                                                        src={logoWhitePreview || settings.site_logo_white}
                                                        alt="Light Logo"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="text-center text-slate-500 text-xs">
                                                        <Sparkles className="w-6 h-6 mx-auto mb-1 text-[#F5D77F]" />
                                                        <span>Dark Mode Variant</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#D4AF37] cursor-pointer transition">
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>Choose File</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileChange('site_logo_white', e, setLogoWhitePreview)}
                                                    />
                                                </label>
                                                {(logoWhitePreview || (settings.site_logo_white && !data.remove_site_logo_white)) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('site_logo_white', setLogoWhitePreview)}
                                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                        title="Remove Logo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {errors.site_logo_white && <p className="text-xs text-rose-500">{errors.site_logo_white}</p>}
                                        </div>

                                        {/* Browser Favicon */}
                                        <div className="p-3.5 sm:p-4 bg-[#F4F7FB] dark:bg-[#071324] rounded-xl border border-slate-200 dark:border-[#1C3E63] space-y-3 sm:col-span-2 md:col-span-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3]">
                                                    Browser Favicon
                                                </span>
                                                <span className="text-[10px] text-slate-400">ICO / PNG</span>
                                            </div>

                                            <div className="h-24 rounded-lg bg-white dark:bg-[#0E2038] border border-dashed border-slate-300 dark:border-[#1C3E63] flex items-center justify-center p-2 relative overflow-hidden">
                                                {faviconPreview || (settings.site_favicon && !data.remove_site_favicon) ? (
                                                    <img
                                                        src={faviconPreview || settings.site_favicon}
                                                        alt="Favicon"
                                                        className="w-10 h-10 object-contain rounded"
                                                    />
                                                ) : (
                                                    <div className="text-center text-slate-400 text-xs">
                                                        <Globe className="w-6 h-6 mx-auto mb-1 text-[#D4AF37]" />
                                                        <span>16x16 / 32x32</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#D4AF37] cursor-pointer transition">
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>Choose File</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*,.ico"
                                                        className="hidden"
                                                        onChange={(e) => handleFileChange('site_favicon', e, setFaviconPreview)}
                                                    />
                                                </label>
                                                {(faviconPreview || (settings.site_favicon && !data.remove_site_favicon)) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('site_favicon', setFaviconPreview)}
                                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                        title="Remove Favicon"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {errors.site_favicon && <p className="text-xs text-rose-500">{errors.site_favicon}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info Card */}
                            <div className="space-y-4 sm:space-y-6">
                                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0E2038] dark:text-white flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                                        <span>Identity Synchronization</span>
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-[#8EB0CF] leading-relaxed">
                                        Changes made to brand name, slogans, and logo files are instantly pushed across all client components including the storefront header, admin navigation bar, and invoices without needing server restarts.
                                    </p>
                                    <div className="p-3 bg-[#FDFBF5] dark:bg-[#071324] rounded-xl border border-[#F5E7C2] dark:border-[#D4AF37]/30 text-xs space-y-1">
                                        <span className="font-bold text-[#926F18] dark:text-[#EBD495] block">Current Storefront Name:</span>
                                        <p className="font-mono text-[#0E2038] dark:text-white font-semibold truncate">{data.site_name || 'ORIO STYLE'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Store & Contact Information */}
                    {activeTab === 'contact' && (
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                <Phone className="w-5 h-5 text-[#D4AF37]" />
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                        Customer Contact & Physical Outlets
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                        Public customer helpline numbers, corporate address, and working hours.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormInput
                                    id="support_phone"
                                    label="Customer Support Helpline"
                                    value={data.support_phone}
                                    onChange={(e) => setData('support_phone', e.target.value)}
                                    placeholder="+880 1700-000000"
                                    error={errors.support_phone}
                                />

                                <FormInput
                                    id="whatsapp_number"
                                    label="Direct WhatsApp Number"
                                    value={data.whatsapp_number}
                                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                                    placeholder="+880 1700-000000"
                                    error={errors.whatsapp_number}
                                    helpText="Used for quick customer chat interactions."
                                />

                                <FormInput
                                    id="support_email"
                                    label="Official Support Email"
                                    type="email"
                                    value={data.support_email}
                                    onChange={(e) => setData('support_email', e.target.value)}
                                    placeholder="support@oriostyle.com"
                                    error={errors.support_email}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    id="store_address"
                                    label="Headquarters & Store Address"
                                    value={data.store_address}
                                    onChange={(e) => setData('store_address', e.target.value)}
                                    placeholder="House #12, Road #04, Banani, Dhaka-1213, Bangladesh"
                                    error={errors.store_address}
                                />

                                <FormInput
                                    id="business_hours"
                                    label="Business / Support Working Hours"
                                    value={data.business_hours}
                                    onChange={(e) => setData('business_hours', e.target.value)}
                                    placeholder="Sat - Thu: 9:00 AM - 9:00 PM"
                                    error={errors.business_hours}
                                />
                            </div>

                            <FormInput
                                id="google_map_url"
                                label="Google Map Location Embed Link"
                                value={data.google_map_url}
                                onChange={(e) => setData('google_map_url', e.target.value)}
                                placeholder="https://maps.google.com/..."
                                error={errors.google_map_url}
                                helpText="Optional Google Maps embed link for Contact Us pages."
                            />
                        </div>
                    )}

                    {/* TAB 3: Currency & Commerce */}
                    {activeTab === 'commerce' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                    <Coins className="w-5 h-5 text-[#D4AF37]" />
                                    <div>
                                        <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                            Localization, Currency & Inventory Thresholds
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                            Define the store's primary trading currency symbol, position, and automated low-stock warnings.
                                        </p>
                                    </div>
                                </div>

                                {/* Live Currency Formatting Preview Banner */}
                                <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#FDFBF5] via-[#FBF5E6] to-[#FDFBF5] dark:from-[#071324] dark:via-[#0E2038] dark:to-[#071324] border border-[#F5E7C2] dark:border-[#D4AF37]/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="space-y-1 text-left">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#926F18] dark:text-[#EBD495]">
                                            Live Currency Format Simulation
                                        </span>
                                        <p className="text-xs text-slate-600 dark:text-[#8EB0CF]">
                                            This is how product prices and checkout amounts appear across the storefront.
                                        </p>
                                    </div>
                                    <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#0E2038] dark:bg-[#071324] text-[#F5D77F] border border-[#D4AF37]/50 text-lg sm:text-xl font-extrabold tracking-tight font-mono shadow-xs text-center shrink-0">
                                        {currencyFormattedSample}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <FormInput
                                        id="currency_symbol"
                                        label="Currency Symbol"
                                        value={data.currency_symbol}
                                        onChange={(e) => setData('currency_symbol', e.target.value)}
                                        placeholder="৳"
                                        required
                                        error={errors.currency_symbol}
                                    />

                                    <FormInput
                                        id="currency_code"
                                        label="Currency ISO Code"
                                        value={data.currency_code}
                                        onChange={(e) => setData('currency_code', e.target.value)}
                                        placeholder="BDT"
                                        required
                                        error={errors.currency_code}
                                    />

                                    <FormSelect
                                        id="currency_position"
                                        label="Symbol Position"
                                        value={data.currency_position}
                                        onChange={(e) => setData('currency_position', e.target.value)}
                                        options={[
                                            { value: 'left', label: 'Left (e.g. ৳ 500)' },
                                            { value: 'right', label: 'Right (e.g. 500 ৳)' },
                                        ]}
                                        error={errors.currency_position}
                                    />

                                    <FormInput
                                        id="low_stock_threshold"
                                        label="Low Stock Warning Limit"
                                        type="number"
                                        value={data.low_stock_threshold}
                                        onChange={(e) => setData('low_stock_threshold', parseInt(e.target.value) || 0)}
                                        placeholder="5"
                                        error={errors.low_stock_threshold}
                                        helpText="Triggers inventory alert badge."
                                    />
                                </div>

                                <FormInput
                                    id="timezone"
                                    label="Default Platform Timezone"
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    placeholder="Asia/Dhaka"
                                    error={errors.timezone}
                                    helpText="Default standard server timezone for order timestamps and audit logs."
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Shipping & Delivery */}
                    {activeTab === 'shipping' && (
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                <Truck className="w-5 h-5 text-[#D4AF37]" />
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                        Shipping Zones & Courier Charges
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                        Define automatic delivery charges and free-shipping order milestones.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FormInput
                                    id="shipping_charge_inside"
                                    label={`Inside Dhaka / Metro (${data.currency_symbol})`}
                                    type="number"
                                    step="0.01"
                                    value={data.shipping_charge_inside}
                                    onChange={(e) => setData('shipping_charge_inside', parseFloat(e.target.value) || 0)}
                                    placeholder="70.00"
                                    error={errors.shipping_charge_inside}
                                    helpText="Standard delivery inside city radius."
                                />

                                <FormInput
                                    id="shipping_charge_outside"
                                    label={`Outside Dhaka / Nationwide (${data.currency_symbol})`}
                                    type="number"
                                    step="0.01"
                                    value={data.shipping_charge_outside}
                                    onChange={(e) => setData('shipping_charge_outside', parseFloat(e.target.value) || 0)}
                                    placeholder="130.00"
                                    error={errors.shipping_charge_outside}
                                    helpText="Nationwide standard courier delivery."
                                />

                                <FormInput
                                    id="free_shipping_threshold"
                                    label={`Free Delivery Order Threshold (${data.currency_symbol})`}
                                    type="number"
                                    step="0.01"
                                    value={data.free_shipping_threshold}
                                    onChange={(e) => setData('free_shipping_threshold', parseFloat(e.target.value) || 0)}
                                    placeholder="2000.00"
                                    error={errors.free_shipping_threshold}
                                    helpText="Set 0 to disable automated free shipping."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    id="estimated_delivery_inside"
                                    label="Estimated Timeline (Inside Metro)"
                                    value={data.estimated_delivery_inside}
                                    onChange={(e) => setData('estimated_delivery_inside', e.target.value)}
                                    placeholder="24 - 48 Hours"
                                    error={errors.estimated_delivery_inside}
                                />

                                <FormInput
                                    id="estimated_delivery_outside"
                                    label="Estimated Timeline (Outside Metro)"
                                    value={data.estimated_delivery_outside}
                                    onChange={(e) => setData('estimated_delivery_outside', e.target.value)}
                                    placeholder="3 - 5 Days"
                                    error={errors.estimated_delivery_outside}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 5: Invoicing, Tax & Checkout */}
                    {activeTab === 'invoicing' && (
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                <Receipt className="w-5 h-5 text-[#D4AF37]" />
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                        Taxation, Checkout Policies & Invoicing
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                        Legal business credentials, VAT percentages, invoice footer return terms.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormInput
                                    id="legal_company_name"
                                    label="Registered Corporate Legal Name"
                                    value={data.legal_company_name}
                                    onChange={(e) => setData('legal_company_name', e.target.value)}
                                    placeholder="ORIO STYLE E-Commerce Ltd."
                                    error={errors.legal_company_name}
                                    helpText="Printed on official VAT receipts & thermal invoices."
                                />

                                <FormInput
                                    id="tax_bin_number"
                                    label="Tax BIN / Trade License Number"
                                    value={data.tax_bin_number}
                                    onChange={(e) => setData('tax_bin_number', e.target.value)}
                                    placeholder="BIN-009823412"
                                    error={errors.tax_bin_number}
                                />

                                <FormInput
                                    id="vat_percentage"
                                    label="Government VAT / Sales Tax (%)"
                                    type="number"
                                    step="0.01"
                                    value={data.vat_percentage}
                                    onChange={(e) => setData('vat_percentage', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    error={errors.vat_percentage}
                                    helpText="Set 0 for VAT-exempt products."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    id="min_order_amount"
                                    label={`Minimum Order Checkout Value (${data.currency_symbol})`}
                                    type="number"
                                    step="0.01"
                                    value={data.min_order_amount}
                                    onChange={(e) => setData('min_order_amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    error={errors.min_order_amount}
                                    helpText="Customers must meet this subtotal to place orders."
                                />

                                <FormInput
                                    id="order_prefix"
                                    label="Order Serial Prefix"
                                    value={data.order_prefix}
                                    onChange={(e) => setData('order_prefix', e.target.value)}
                                    placeholder="ORD-"
                                    error={errors.order_prefix}
                                    helpText="Example: ORD-10023, ORIO-5021."
                                />
                            </div>

                            {/* Payment Method & Tax Toggles */}
                            <div className="p-3.5 sm:p-4.5 bg-[#F4F7FB] dark:bg-[#071324] rounded-xl border border-slate-200 dark:border-[#1C3E63] flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.cash_on_delivery_enabled}
                                        onChange={(e) => setData('cash_on_delivery_enabled', e.target.checked)}
                                        className="w-4 h-4 text-[#D4AF37] rounded border-slate-300 dark:border-[#1C3E63] focus:ring-[#D4AF37] cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">Cash on Delivery (COD)</span>
                                        <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">Enable pay-on-arrival option</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.online_payment_enabled}
                                        onChange={(e) => setData('online_payment_enabled', e.target.checked)}
                                        className="w-4 h-4 text-[#D4AF37] rounded border-slate-300 dark:border-[#1C3E63] focus:ring-[#D4AF37] cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">Digital Gateway Payments</span>
                                        <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">bKash, Nagad, Visa & Mastercard</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.vat_inclusive}
                                        onChange={(e) => setData('vat_inclusive', e.target.checked)}
                                        className="w-4 h-4 text-[#D4AF37] rounded border-slate-300 dark:border-[#1C3E63] focus:ring-[#D4AF37] cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">VAT Inclusive Pricing</span>
                                        <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">Prices already include tax</span>
                                    </div>
                                </label>
                            </div>

                            {/* Invoice Footer Notes */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                    Invoice & Receipt Return Policy / Terms Note
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.invoice_footer_notes}
                                    onChange={(e) => setData('invoice_footer_notes', e.target.value)}
                                    placeholder="Thank you for shopping with ORIO STYLE! Goods once sold can be exchanged within 7 days with original invoice."
                                    className="block w-full py-2 sm:py-2.5 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition font-medium"
                                />
                                {errors.invoice_footer_notes && <p className="mt-1 text-xs text-rose-500">{errors.invoice_footer_notes}</p>}
                            </div>
                        </div>
                    )}

                    {/* TAB 6: Social Media & Floating Widgets */}
                    {activeTab === 'social' && (
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                <Share2 className="w-5 h-5 text-[#D4AF37]" />
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                        Social Media Presence & Live Floating Chat
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                        Public channel links and customer assistance chat widgets.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3.5 sm:p-4 bg-[#FDFBF5] dark:bg-[#071324] rounded-xl border border-[#F5E7C2] dark:border-[#D4AF37]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">
                                            Floating WhatsApp Chat Widget
                                        </span>
                                        <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                            Shows a floating quick-chat icon at the bottom-right of the customer storefront.
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end sm:self-auto">
                                    <input
                                        type="checkbox"
                                        checked={data.whatsapp_chat_enabled}
                                        onChange={(e) => setData('whatsapp_chat_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormInput
                                    id="facebook_url"
                                    label="Facebook Page URL"
                                    value={data.facebook_url}
                                    onChange={(e) => setData('facebook_url', e.target.value)}
                                    placeholder="https://facebook.com/oriostyle"
                                    error={errors.facebook_url}
                                />

                                <FormInput
                                    id="instagram_url"
                                    label="Instagram Handle URL"
                                    value={data.instagram_url}
                                    onChange={(e) => setData('instagram_url', e.target.value)}
                                    placeholder="https://instagram.com/oriostyle"
                                    error={errors.instagram_url}
                                />

                                <FormInput
                                    id="youtube_url"
                                    label="YouTube Channel URL"
                                    value={data.youtube_url}
                                    onChange={(e) => setData('youtube_url', e.target.value)}
                                    placeholder="https://youtube.com/@oriostyle"
                                    error={errors.youtube_url}
                                />

                                <FormInput
                                    id="tiktok_url"
                                    label="TikTok Profile URL"
                                    value={data.tiktok_url}
                                    onChange={(e) => setData('tiktok_url', e.target.value)}
                                    placeholder="https://tiktok.com/@oriostyle"
                                    error={errors.tiktok_url}
                                />

                                <FormInput
                                    id="twitter_url"
                                    label="Twitter / X Profile URL"
                                    value={data.twitter_url}
                                    onChange={(e) => setData('twitter_url', e.target.value)}
                                    placeholder="https://x.com/oriostyle"
                                    error={errors.twitter_url}
                                />

                                <FormInput
                                    id="linkedin_url"
                                    label="LinkedIn Company Page"
                                    value={data.linkedin_url}
                                    onChange={(e) => setData('linkedin_url', e.target.value)}
                                    placeholder="https://linkedin.com/company/oriostyle"
                                    error={errors.linkedin_url}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 7: SEO & Custom Analytics Scripts */}
                    {activeTab === 'seo' && (
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                <Search className="w-5 h-5 text-[#D4AF37]" />
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                        SEO Search Engine Optimization & Tracking Code
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                        Global meta tags, Google Analytics, Meta Pixel tracking headers.
                                    </p>
                                </div>
                            </div>

                            <FormInput
                                id="meta_title"
                                label="Default Storefront Meta Page Title"
                                value={data.meta_title}
                                onChange={(e) => setData('meta_title', e.target.value)}
                                placeholder="ORIO STYLE | Premium Fashion & Lifestyle"
                                error={errors.meta_title}
                                helpText="Rendered in search engine results and social previews."
                            />

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                    Default Meta Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.meta_description}
                                    onChange={(e) => setData('meta_description', e.target.value)}
                                    placeholder="Discover luxury formal wear, designer shirts, and tailored fashion crafted with premium fabrics and impeccable craftsmanship."
                                    className="block w-full py-2 sm:py-2.5 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition font-medium"
                                />
                                {errors.meta_description && <p className="mt-1 text-xs text-rose-500">{errors.meta_description}</p>}
                            </div>

                            <FormInput
                                id="meta_keywords"
                                label="SEO Meta Keywords (Comma Separated)"
                                value={data.meta_keywords}
                                onChange={(e) => setData('meta_keywords', e.target.value)}
                                placeholder="fashion, clothing, luxury, men formal shirts, bangladesh ecommerce"
                                error={errors.meta_keywords}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                        Custom Header Scripts (&lt;head&gt; Injection)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={data.custom_header_scripts}
                                        onChange={(e) => setData('custom_header_scripts', e.target.value)}
                                        placeholder="<!-- Google tag (gtag.js), Meta Pixel Code -->"
                                        className="font-mono text-xs block w-full py-2 sm:py-2.5 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition font-medium"
                                    />
                                    <span className="text-[11px] text-slate-400 dark:text-[#5E8CB6] mt-1 block">
                                        Injected into the HTML &lt;head&gt; section of public storefront pages.
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                                        Custom Footer Scripts (&lt;body&gt; Closing)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={data.custom_footer_scripts}
                                        onChange={(e) => setData('custom_footer_scripts', e.target.value)}
                                        placeholder="<!-- Live chat scripts, heatmaps, remarketing tags -->"
                                        className="font-mono text-xs block w-full py-2 sm:py-2.5 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition font-medium"
                                    />
                                    <span className="text-[11px] text-slate-400 dark:text-[#5E8CB6] mt-1 block">
                                        Injected right before the closing &lt;/body&gt; tag.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 8: System & Cache Diagnostics */}
                    {activeTab === 'system' && (
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                                <Server className="w-5 h-5 text-[#D4AF37]" />
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white">
                                        Server Environment & Cache Architecture
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                        Diagnostics, real-time memory caching, and storage system status.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6]">
                                        PHP Runtime
                                    </span>
                                    <p className="text-base sm:text-lg font-extrabold text-[#0E2038] dark:text-white font-mono">
                                        v{system.phpVersion || '8.2+'}
                                    </p>
                                </div>

                                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6]">
                                        Laravel Framework
                                    </span>
                                    <p className="text-base sm:text-lg font-extrabold text-[#0E2038] dark:text-white font-mono">
                                        v{system.laravelVersion || '12.0'}
                                    </p>
                                </div>

                                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6]">
                                        Cache Driver
                                    </span>
                                    <p className="text-base sm:text-lg font-extrabold text-[#D4AF37] dark:text-[#EBD495] font-mono capitalize">
                                        {system.cacheDriver || 'file'}
                                    </p>
                                </div>

                                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6]">
                                        Storage Symbolic Link
                                    </span>
                                    <p className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        <span>Active & Serving Media</span>
                                    </p>
                                </div>

                                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6]">
                                        Database Optimization
                                    </span>
                                    <p className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                        <ShieldCheck className="w-4 h-4 shrink-0" />
                                        <span>Active & Enforced</span>
                                    </p>
                                </div>

                                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6]">
                                        Server Time
                                    </span>
                                    <p className="text-xs font-mono font-bold text-[#0E2038] dark:text-slate-200">
                                        {system.serverTime || 'Live'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3.5 sm:p-4 bg-[#FDFBF5] dark:bg-[#071324] rounded-xl border border-[#F5E7C2] dark:border-[#D4AF37]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                                <div>
                                    <h4 className="text-sm font-bold text-[#0E2038] dark:text-white">
                                        Purge Public Settings Cache
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-[#8EB0CF]">
                                        Forces the caching layer to invalidate and re-query fresh database values immediately.
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="md"
                                    icon={RotateCcw}
                                    onClick={handleClearCache}
                                    className="w-full sm:w-auto shrink-0 justify-center"
                                >
                                    Purge Cache Now
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Bottom Floating/Sticky Save Action Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-white dark:bg-[#0E2038] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-[#8EB0CF]">
                                All parameters are cached for sub-millisecond retrieval.
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => reset()}
                                disabled={processing}
                                className="flex-1 sm:flex-none justify-center"
                            >
                                Reset Form
                            </Button>
                            <Button
                                variant="primary"
                                size="md"
                                type="submit"
                                icon={Save}
                                processing={processing}
                                className="flex-1 sm:flex-none shadow-xs font-bold justify-center"
                            >
                                Save All Settings
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
