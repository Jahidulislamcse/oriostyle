import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    FolderTree, 
    Tag, 
    Package, 
    Boxes, 
    Truck, 
    ShoppingBag, 
    FileText, 
    BarChart3, 
    Settings, 
    Menu, 
    X, 
    ChevronLeft, 
    ChevronRight, 
    LogOut, 
    Sparkles, 
    ExternalLink, 
    Search,
    Store,
    Shield,
    Image as ImageIcon,
    LayoutGrid,
    Ticket,
    Bell,
    AlertTriangle
} from 'lucide-react';
import ToastContainer from '@/Components/Common/ToastContainer';
import Badge from '@/Components/Common/Badge';
import ThemeToggle from '@/Components/Common/ThemeToggle';

export default function AdminLayout({ title = '', children }) {
    const { url = '', props = {} } = usePage();
    const { auth = {}, settings = {}, adminNotifications: initialAlerts = null } = props;
    const user = auth?.user;
    const { post } = useForm();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin_sidebar_collapsed') === 'true';
        }
        return false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Live notifications state & real-time popup toast
    const [liveAlerts, setLiveAlerts] = useState(initialAlerts);
    const [incomingToast, setIncomingToast] = useState(null);
    const lastPendingCountRef = useRef(initialAlerts?.pending_orders_count ?? null);
    const toastTimerRef = useRef(null);

    // Audio chime helper using Web Audio API (Zero external file dependency, reliable, crisp chime)
    const playNotificationSound = () => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            // Tone 1: Gentle primary chime
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now); // D5
            osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
            gain1.gain.setValueAtTime(0.25, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.35);

            // Tone 2: Harmonious celebratory overtone
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(880, now + 0.12); // A5
            osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6
            gain2.gain.setValueAtTime(0.0, now);
            gain2.gain.setValueAtTime(0.2, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.55);
        } catch {
            // Ignore browsers requiring prior user interaction
        }
    };

    // Lightweight Background Polling (Interval: 15s, paused when tab is in background)
    useEffect(() => {
        if (!user || !['super_admin', 'admin', 'manager', 'inventory_staff'].includes(user.role)) {
            return;
        }

        let isMounted = true;

        const checkAlerts = async () => {
            // If tab is inactive or hidden, skip to save CPU/battery
            if (document.hidden) return;

            try {
                const res = await fetch('/admin/notifications/poll', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!res.ok) return;
                const data = await res.json();
                if (!isMounted) return;

                setLiveAlerts(data);

                // Detect new incoming order(s)
                if (lastPendingCountRef.current !== null && data.pending_orders_count > lastPendingCountRef.current) {
                    playNotificationSound();

                    const latestOrder = data.recent_orders?.[0];
                    if (latestOrder) {
                        setIncomingToast({
                            type: 'order',
                            title: 'New Order Received!',
                            message: `Order #${latestOrder.order_number} by ${latestOrder.customer_name}`,
                            amount: latestOrder.total_amount,
                            url: latestOrder.url,
                        });

                        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                        toastTimerRef.current = setTimeout(() => {
                            setIncomingToast(null);
                        }, 7000);
                    }
                }

                lastPendingCountRef.current = data.pending_orders_count;
            } catch {
                // Silently swallow transient network failure
            }
        };

        // Poll every 15 seconds
        const pollInterval = setInterval(checkAlerts, 15000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, [user?.role]);

    // Keep state synced if parent props change via full page inertia visit
    useEffect(() => {
        if (initialAlerts) {
            setLiveAlerts(initialAlerts);
            if (lastPendingCountRef.current === null) {
                lastPendingCountRef.current = initialAlerts.pending_orders_count;
            }
        }
    }, [initialAlerts]);

    const sidebarNavRef = useRef(null);
    const activeItemRef = useRef(null);

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('admin_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    // Save sidebar scroll position continuously
    const handleSidebarScroll = (e) => {
        sessionStorage.setItem('admin_sidebar_scroll_top', String(e.currentTarget.scrollTop));
    };

    // Robust, reactive URL matching for sidebar items across full page loads & Inertia client navigations
    const currentPath = (url || (typeof window !== 'undefined' ? window.location.pathname : ''))
        .split('?')[0]
        .replace(/\/+$/, '') || '/';

    // Restore scroll position after navigation or scroll active item into view
    useEffect(() => {
        const navEl = sidebarNavRef.current;
        if (!navEl) return;

        const savedScroll = sessionStorage.getItem('admin_sidebar_scroll_top');
        if (savedScroll !== null) {
            navEl.scrollTop = parseInt(savedScroll, 10);
        } else if (activeItemRef.current) {
            activeItemRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [currentPath]);

    const isItemActive = (href, matchPrefixes = []) => {
        const targetPath = href.split('?')[0].replace(/\/+$/, '') || '/';

        // Exact match required for Dashboard root so it doesn't collide with other /admin routes
        if (targetPath === '/admin/dashboard') {
            return currentPath === '/admin/dashboard';
        }

        // Sub-path match (e.g. /admin/products/create matches /admin/products)
        if (currentPath === targetPath || currentPath.startsWith(targetPath + '/')) {
            return true;
        }

        // Additional prefix aliases
        return matchPrefixes.some((prefix) => {
            const cleanPrefix = prefix.replace(/\/+$/, '');
            return currentPath === cleanPrefix || currentPath.startsWith(cleanPrefix + '/');
        });
    };

    const navigation = [
        {
            group: 'Core Operations',
            items: [
                { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: isItemActive('/admin/dashboard') },
            ],
        },
        {
            group: 'Catalog & Taxonomy',
            items: [
                { name: 'Categories Tree', href: '/admin/categories', icon: FolderTree, current: isItemActive('/admin/categories') },
                { name: 'Brands & Media', href: '/admin/brands', icon: Tag, current: isItemActive('/admin/brands') },
                { name: 'Products Catalog', href: '/admin/products', icon: Package, current: isItemActive('/admin/products') },
                { name: 'Banners & Sliders', href: '/admin/banners', icon: ImageIcon, current: isItemActive('/admin/banners') },
                { name: 'Bento Mosaic Grid', href: '/admin/homepage-bento', icon: LayoutGrid, current: isItemActive('/admin/homepage-bento') },
                { name: 'Variant Matrix', href: '/admin/variants', icon: Boxes, current: isItemActive('/admin/variants') },
            ],
        },
        {
            group: 'Procurement & Stock',
            items: [
                { name: 'Suppliers Ledger', href: '/admin/suppliers', icon: Truck, current: isItemActive('/admin/suppliers') },
                { name: 'Stock-In PO', href: '/admin/purchase-orders', icon: Boxes, current: isItemActive('/admin/purchase-orders', ['/admin/purchases']) },
                { 
                    name: 'Inventory Control', 
                    href: '/admin/inventory', 
                    icon: Package, 
                    current: isItemActive('/admin/inventory'),
                    badge: (liveAlerts?.low_stock_count || liveAlerts?.out_of_stock_count) 
                        ? `${(liveAlerts.low_stock_count || 0) + (liveAlerts.out_of_stock_count || 0)} alert`
                        : null
                },
            ],
        },
        {
            group: 'Orders & Fulfillment',
            items: [
                { 
                    name: 'Orders Management', 
                    href: '/admin/orders', 
                    icon: ShoppingBag, 
                    current: isItemActive('/admin/orders') && !currentPath.includes('/invoice'),
                    badge: liveAlerts?.pending_orders_count 
                        ? `${liveAlerts.pending_orders_count} new`
                        : null
                },
                { name: 'Invoices & Thermal', href: '/admin/invoices', icon: FileText, current: isItemActive('/admin/invoices') || currentPath.includes('/invoice') },
                { name: 'Coupons & Promos', href: '/admin/coupons', icon: Ticket, current: isItemActive('/admin/coupons') },
            ],
        },
        {
            group: 'System & Intelligence',
            items: [
                { name: 'Analytics & Profit BI', href: '/admin/analytics', icon: BarChart3, current: isItemActive('/admin/analytics') },
                { name: 'Dynamic Settings', href: '/admin/settings', icon: Settings, current: isItemActive('/admin/settings') },
            ],
        },
    ];

    const siteName = settings?.site_name || 'ORIO STYLE LTD';
    const siteLogo = settings?.site_logo;
    const siteFavicon = settings?.site_favicon;

    return (
        <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#071324] text-[#0E2038] dark:text-slate-100 font-sans selection:bg-[#D4AF37] selection:text-[#071324] flex flex-col transition-colors duration-200">
            <Head title={title ? `${title} - Store Administration` : `${siteName} - Admin`}>
                {siteFavicon && <link rel="icon" href={siteFavicon} />}
            </Head>
            <ToastContainer />

            {/* Mobile Drawer Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-[#071324]/70 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar (Desktop + Mobile Drawer) */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-[#0E2038] border-r border-slate-200 dark:border-[#1C3E63]/70 flex flex-col transition-all duration-300 ease-in-out shadow-xs ${
                    sidebarCollapsed ? 'w-20' : 'w-72'
                } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Brand Header */}
                <div className="h-16 px-4.5 lg:px-5 border-b border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between">
                    <Link href="/admin/dashboard" preserveScroll preserveState className="flex items-center gap-3 overflow-hidden group">
                        {siteLogo ? (
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#D4AF37]/40 p-1 flex-shrink-0 flex items-center justify-center shadow-xs group-hover:scale-105 transition overflow-hidden">
                                <img src={siteLogo} alt={siteName} className="max-h-full max-w-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#926F18] flex-shrink-0 flex items-center justify-center shadow-md shadow-[#D4AF37]/25 group-hover:scale-105 transition">
                                <Sparkles className="w-5 h-5 text-[#071324] font-bold" />
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-extrabold tracking-tight text-[#0E2038] dark:text-white truncate">
                                    {siteName}
                                </span>
                                <span className="text-[11px] font-bold text-[#926F18] dark:text-[#EBD495] uppercase tracking-wider flex items-center gap-1">
                                    <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> Store Management
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div
                    ref={sidebarNavRef}
                    onScroll={handleSidebarScroll}
                    data-scroll-region="true"
                    className="flex-1 overflow-y-auto px-3.5 lg:px-4 pt-6 pb-6 space-y-6"
                >
                    {navigation.map((group, groupIdx) => (
                        <div key={groupIdx} className={groupIdx === 0 ? 'mt-1' : ''}>
                            {!sidebarCollapsed && (
                                <h4 className="px-3 text-[11px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-[#5E8CB6] mb-2.5">
                                    {group.group}
                                </h4>
                            )}
                            <div className="space-y-1.5">
                                {group.items.map((item, idx) => {
                                    const Icon = item.icon;
                                    const isActive = item.current;

                                    return (
                                        <Link
                                            key={idx}
                                            ref={isActive ? activeItemRef : null}
                                            href={item.href}
                                            preserveScroll
                                            preserveState
                                            onClick={() => setMobileOpen(false)}
                                            title={sidebarCollapsed ? item.name : undefined}
                                            className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group ${
                                                isActive
                                                    ? 'bg-[#FBF5E6] text-[#755615] border border-[#EBD495] dark:bg-[#142C49] dark:text-[#EBD495] dark:border-[#D4AF37]/50 shadow-xs font-bold before:absolute before:left-1 before:top-2 before:bottom-2 before:w-1 before:bg-[#D4AF37] before:rounded-full'
                                                    : 'text-slate-600 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#142C49]/60 border border-transparent'
                                            } ${sidebarCollapsed ? 'justify-center px-0 before:hidden' : ''}`}
                                        >
                                            <Icon
                                                className={`w-4.5 h-4.5 flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                                                    isActive 
                                                        ? 'text-[#D4AF37] dark:text-[#EBD495]' 
                                                        : 'text-slate-400 dark:text-[#5E8CB6] group-hover:text-slate-700 dark:group-hover:text-[#8EB0CF]'
                                                }`}
                                            />
                                            {!sidebarCollapsed && (
                                                <div className="flex items-center justify-between flex-1 truncate">
                                                    <span className="truncate text-xs sm:text-sm">{item.name}</span>
                                                    {item.badge && (
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                                            isActive
                                                                ? 'bg-[#FBF5E6] text-[#755615] border-[#EBD495] dark:bg-[#071324]/80 dark:text-[#EBD495] dark:border-[#926F18]/60'
                                                                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#071324] dark:text-[#8EB0CF] dark:border-[#1C3E63]'
                                                        }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Collapse Toggle */}
                <div className="hidden lg:flex p-3.5 border-t border-slate-200 dark:border-[#1C3E63]/70">
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-[#8EB0CF] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#142C49] transition cursor-pointer text-xs sm:text-sm font-semibold gap-2"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4.5 h-4.5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-4.5 h-4.5" />
                                <span>Collapse Sidebar</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                    sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
                }`}
            >
                {/* Topbar */}
                <header className="h-16 border-b border-slate-200 dark:border-[#1C3E63]/70 bg-white/90 dark:bg-[#0E2038]/90 backdrop-blur sticky top-0 z-30 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5 sm:gap-4 shadow-2xs">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open Navigation Menu"
                            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#142C49] transition cursor-pointer"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#8EB0CF] bg-slate-100/80 dark:bg-[#142C49]/70 border border-slate-200 dark:border-[#1C3E63] px-3.5 py-2 rounded-xl w-72 lg:w-80 focus-within:ring-2 focus-within:ring-[#D4AF37]/30 focus-within:border-[#D4AF37] transition">
                            <Search className="w-4 h-4 text-slate-400 dark:text-[#5E8CB6] shrink-0" />
                            <input
                                type="text"
                                placeholder="Search catalog, orders... (Ctrl+K)"
                                className="bg-transparent text-xs sm:text-sm text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#8EB0CF]/60 focus:outline-none w-full font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Light / Dark Mode Toggle */}
                        <ThemeToggle />

                        {/* Backoffice Notifications Center (Orders & Stock Alerts) */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setNotificationsOpen(!notificationsOpen);
                                    setUserMenuOpen(false);
                                }}
                                aria-label="Notifications"
                                className="relative p-2 rounded-xl text-slate-500 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#142C49] border border-slate-200/80 dark:border-[#1C3E63] transition cursor-pointer"
                            >
                                <Bell className="w-4.5 h-4.5" />
                                {liveAlerts && liveAlerts.total_unread > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs animate-pulse">
                                        {liveAlerts.total_unread > 99 ? '99+' : liveAlerts.total_unread}
                                    </span>
                                )}
                            </button>

                            {/* Floating Toast Popup under Notification Icon upon new order arrival */}
                            {incomingToast && (
                                <div className="absolute right-0 top-12 w-80 p-3.5 rounded-2xl bg-[#0E2038] text-white border-2 border-[#D4AF37] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#EBD495]">
                                                <ShoppingBag className="w-4 h-4" />
                                            </span>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-wider text-[#EBD495]">
                                                    {incomingToast.title}
                                                </h4>
                                                <p className="text-xs text-slate-200 font-medium line-clamp-1">
                                                    {incomingToast.message}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIncomingToast(null)}
                                            className="text-slate-400 hover:text-white p-1 rounded-lg"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="mt-2.5 pt-2 border-t border-[#1C3E63] flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-400">
                                            ৳{Number(incomingToast.amount).toLocaleString()}
                                        </span>
                                        <Link
                                            href={incomingToast.url}
                                            onClick={() => setIncomingToast(null)}
                                            className="px-2.5 py-1 rounded-lg bg-[#D4AF37] text-[#071324] font-bold text-[11px] uppercase tracking-wider hover:bg-[#EBD495] transition"
                                        >
                                            View Order
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Dropdown Panel */}
                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                                    <div className="absolute right-0 sm:-right-12 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] rounded-2xl shadow-2xl py-3 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        {/* Dropdown Header */}
                                        <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-[#1C3E63]/70 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-[#D4AF37]" />
                                                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0E2038] dark:text-white">
                                                    Activity & Alerts
                                                </h3>
                                            </div>
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-[#071324] dark:text-[#8EB0CF] border border-slate-200 dark:border-[#1C3E63]">
                                                {liveAlerts?.total_unread || 0} active
                                            </span>
                                        </div>

                                        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#1C3E63]/50">
                                            {/* Section: Incoming Orders */}
                                            <div className="p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] flex items-center gap-1.5">
                                                        <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                                                        Incoming Orders ({liveAlerts?.pending_orders_count || 0})
                                                    </span>
                                                    <Link
                                                        href="/admin/orders?status=pending"
                                                        onClick={() => setNotificationsOpen(false)}
                                                        className="text-[10px] font-bold text-[#D4AF37] hover:underline"
                                                    >
                                                        View all
                                                    </Link>
                                                </div>

                                                {liveAlerts?.recent_orders && liveAlerts.recent_orders.length > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {liveAlerts.recent_orders.map((order) => (
                                                            <Link
                                                                key={order.id}
                                                                href={order.url}
                                                                onClick={() => setNotificationsOpen(false)}
                                                                className="block p-2 rounded-xl bg-slate-50 dark:bg-[#071324]/60 hover:bg-slate-100 dark:hover:bg-[#142C49] border border-slate-200/60 dark:border-[#1C3E63]/50 transition group"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-bold text-[#0E2038] dark:text-white font-mono group-hover:text-[#D4AF37]">
                                                                        #{order.order_number}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400">
                                                                        {order.time_ago}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-300">
                                                                    <span className="truncate max-w-[170px]">{order.customer_name}</span>
                                                                    <span className="font-bold text-emerald-500">
                                                                        ৳{Number(order.total_amount).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic py-1 px-1">
                                                        No pending orders requiring attention.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Section: Stock Alerts */}
                                            <div className="p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] flex items-center gap-1.5">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                        Low Stock & OOS Alerts ({(liveAlerts?.low_stock_count || 0) + (liveAlerts?.out_of_stock_count || 0)})
                                                    </span>
                                                    <Link
                                                        href="/admin/inventory"
                                                        onClick={() => setNotificationsOpen(false)}
                                                        className="text-[10px] font-bold text-[#D4AF37] hover:underline"
                                                    >
                                                        Manage
                                                    </Link>
                                                </div>

                                                {liveAlerts?.stock_alerts && liveAlerts.stock_alerts.length > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {liveAlerts.stock_alerts.map((item) => (
                                                            <Link
                                                                key={item.id}
                                                                href={item.url}
                                                                onClick={() => setNotificationsOpen(false)}
                                                                className="block p-2 rounded-xl bg-slate-50 dark:bg-[#071324]/60 hover:bg-slate-100 dark:hover:bg-[#142C49] border border-slate-200/60 dark:border-[#1C3E63]/50 transition group"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-semibold text-[#0E2038] dark:text-white truncate max-w-[200px] group-hover:text-[#D4AF37]">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                                        item.is_out_of_stock
                                                                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                                                                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                                                    }`}>
                                                                        {item.is_out_of_stock ? 'OUT OF STOCK' : `${item.stock_quantity} left`}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                    SKU: {item.sku || 'N/A'} (Threshold: {item.low_stock_threshold})
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic py-1 px-1">
                                                        All products have healthy stock levels.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dropdown Footer */}
                                        <div className="pt-2 px-3 border-t border-slate-100 dark:border-[#1C3E63]/70 flex items-center justify-between text-xs">
                                            <Link
                                                href="/admin/orders"
                                                onClick={() => setNotificationsOpen(false)}
                                                className="text-slate-500 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white font-medium"
                                            >
                                                All Orders
                                            </Link>
                                            <Link
                                                href="/admin/inventory"
                                                onClick={() => setNotificationsOpen(false)}
                                                className="text-slate-500 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white font-medium"
                                            >
                                                Inventory Control
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Storefront Quick View Link */}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-[#FDFBF5] hover:text-[#926F18] hover:border-[#F5E7C2] dark:bg-[#142C49] dark:hover:bg-[#1C3E63] text-slate-700 dark:text-[#BACDE3] border border-slate-200 dark:border-[#1C3E63] text-xs sm:text-sm font-semibold transition shadow-2xs"
                        >
                            <Store className="w-4 h-4 text-[#D4AF37] dark:text-[#EBD495]" />
                            <span className="hidden sm:inline">Storefront</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-[#5E8CB6]" />
                        </a>

                        {/* User Profile & Actions Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#142C49] transition text-left cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-[#1C3E63]"
                            >
                                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#FBF5E6] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/40 flex items-center justify-center font-bold text-sm shadow-2xs">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="hidden md:flex flex-col pr-1">
                                    <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white leading-tight">{user?.name}</span>
                                    <span className="text-[11px] font-semibold text-[#926F18] dark:text-[#DFC068] capitalize">{user?.role?.replace('_', ' ')}</span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] rounded-2xl shadow-xl py-2 z-40">
                                        <div className="px-4.5 py-3 border-b border-slate-100 dark:border-[#1C3E63]/70 mb-1">
                                            <p className="text-sm font-bold text-[#0E2038] dark:text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-[#8EB0CF] truncate">{user?.email}</p>
                                            <div className="mt-2">
                                                <Badge
                                                    variant={user?.role === 'super_admin' ? 'purple' : 'gold'}
                                                    size="sm"
                                                >
                                                    {user?.role?.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 transition cursor-pointer text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-[1600px] w-full mx-auto min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
