import React, { useState } from 'react';
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
    UserCheck
} from 'lucide-react';
import ToastContainer from '@/Components/Common/ToastContainer';
import Badge from '@/Components/Common/Badge';
import ThemeToggle from '@/Components/Common/ThemeToggle';

export default function AdminLayout({ title = '', children }) {
    const { auth, settings } = usePage().props;
    const user = auth?.user;
    const { post } = useForm();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    const navigation = [
        {
            group: 'Core Operations',
            items: [
                { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: route().current('admin.dashboard') },
            ],
        },
        {
            group: 'Catalog & Taxonomy',
            items: [
                { name: 'Categories Tree', href: '/admin/categories', icon: FolderTree, badge: 'Live', current: route().current('admin.categories.*') },
                { name: 'Brands & Media', href: '/admin/brands', icon: Tag, badge: 'Phase 5', current: route().current('admin.brands.*') },
                { name: 'Products Catalog', href: '/admin/products', icon: Package, badge: 'Phase 6', current: route().current('admin.products.*') },
                { name: 'Variant Matrix', href: '/admin/variants', icon: Boxes, badge: 'Phase 7', current: route().current('admin.variants.*') },
            ],
        },
        {
            group: 'Procurement & Stock',
            items: [
                { name: 'Suppliers Ledger', href: '/admin/suppliers', icon: Truck, badge: 'Phase 8', current: route().current('admin.suppliers.*') },
                { name: 'Stock-In Purchases', href: '/admin/purchases', icon: Boxes, badge: 'Phase 9', current: route().current('admin.purchases.*') },
                { name: 'Inventory Control', href: '/admin/inventory', icon: Package, badge: 'Phase 10', current: route().current('admin.inventory.*') },
            ],
        },
        {
            group: 'Orders & Fulfillment',
            items: [
                { name: 'Orders Management', href: '/admin/orders', icon: ShoppingBag, badge: 'Phase 17', current: route().current('admin.orders.*') },
                { name: 'Invoices & Thermal', href: '/admin/invoices', icon: FileText, badge: 'Phase 18', current: route().current('admin.invoices.*') },
            ],
        },
        {
            group: 'System & Intelligence',
            items: [
                { name: 'Analytics & Profit BI', href: '/admin/analytics', icon: BarChart3, badge: 'Phase 20', current: route().current('admin.analytics.*') },
                { name: 'Dynamic Settings', href: '/admin/settings', icon: Settings, badge: 'CMS', current: route().current('admin.settings.*') },
            ],
        },
    ];

    const siteName = settings?.site_name || 'ORIO STYLE';

    return (
        <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-950 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-white flex flex-col transition-colors duration-200">
            <Head title={title ? `${title} - Admin Control Tower` : `${siteName} - Admin`} />
            <ToastContainer />

            {/* Mobile Drawer Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar (Desktop + Mobile Drawer) */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r-2 border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-lg ${
                    sidebarCollapsed ? 'w-22' : 'w-72'
                } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Brand Header */}
                <div className="h-20 px-5 border-b-2 border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900">
                    <Link href="/admin/dashboard" className="flex items-center gap-3.5 overflow-hidden group">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 flex-shrink-0 flex items-center justify-center shadow-md shadow-teal-700/30 group-hover:scale-105 transition">
                            <Sparkles className="w-6 h-6 text-white font-bold" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-base font-black tracking-tight text-slate-950 dark:text-white truncate">
                                    {siteName}
                                </span>
                                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Control Tower
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
                    {navigation.map((group, groupIdx) => (
                        <div key={groupIdx}>
                            {!sidebarCollapsed && (
                                <h4 className="px-3.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
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
                                            href={item.href}
                                            title={sidebarCollapsed ? item.name : undefined}
                                            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all duration-150 group ${
                                                isActive
                                                    ? 'bg-teal-700 text-white shadow-md shadow-teal-800/30 border-2 border-teal-700 dark:bg-teal-500 dark:text-slate-950 dark:border-teal-500'
                                                    : 'text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-2 border-transparent'
                                            } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                                        >
                                            <Icon
                                                className={`w-5 h-5 flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                                                    isActive 
                                                        ? 'text-white dark:text-slate-950' 
                                                        : 'text-slate-600 dark:text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300'
                                                }`}
                                            />
                                            {!sidebarCollapsed && (
                                                <div className="flex items-center justify-between flex-1 truncate">
                                                    <span className="truncate">{item.name}</span>
                                                    {item.badge && (
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                                                            isActive
                                                                ? 'bg-white/20 text-white border-white/30 dark:bg-slate-950/30 dark:text-slate-950 dark:border-slate-950/40'
                                                                : 'bg-slate-200/80 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
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
                <div className="hidden lg:flex p-3.5 border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition cursor-pointer text-xs font-bold gap-2"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span>Collapse Navigation</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${
                    sidebarCollapsed ? 'lg:pl-22' : 'lg:pl-72'
                }`}
            >
                {/* Topbar */}
                <header className="h-20 border-b-2 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-300 dark:border-slate-700"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden sm:flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl w-72 lg:w-80 focus-within:ring-4 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition">
                            <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search catalog, orders... (Ctrl+K)"
                                className="bg-transparent text-sm font-medium text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                        {/* Light / Dark Mode Toggle */}
                        <ThemeToggle />

                        {/* Storefront Quick View Link */}
                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 text-sm font-bold transition shadow-xs"
                        >
                            <Store className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                            <span className="hidden sm:inline">Storefront</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </Link>

                        {/* User Profile & Actions Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                            >
                                <div className="w-10 h-10 rounded-xl bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="hidden md:flex flex-col pr-1">
                                    <span className="text-sm font-extrabold text-slate-950 dark:text-white leading-tight">{user?.name}</span>
                                    <span className="text-xs text-teal-700 dark:text-teal-400 font-bold capitalize">{user?.role?.replace('_', ' ')}</span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl py-2.5 z-40">
                                        <div className="px-5 py-3 border-b-2 border-slate-100 dark:border-slate-800 mb-1">
                                            <p className="text-sm font-black text-slate-950 dark:text-white truncate">{user?.name}</p>
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">{user?.email}</p>
                                            <div className="mt-2">
                                                <Badge
                                                    variant={user?.role === 'super_admin' ? 'purple' : 'success'}
                                                    size="sm"
                                                >
                                                    {user?.role?.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-5 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2.5 transition cursor-pointer text-left"
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
                <main className="flex-1 p-5 sm:p-7 lg:p-9">
                    {children}
                </main>
            </div>
        </div>
    );
}
