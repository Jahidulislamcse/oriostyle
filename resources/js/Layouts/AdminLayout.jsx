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
    Shield
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-orange-400 selection:text-white flex flex-col transition-colors duration-200">
            <Head title={title ? `${title} - Admin Control Tower` : `${siteName} - Admin`} />
            <ToastContainer />

            {/* Mobile Drawer Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar (Desktop + Mobile Drawer) */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-xs ${
                    sidebarCollapsed ? 'w-20' : 'w-64'
                } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Brand Header */}
                <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 flex-shrink-0 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
                            <Sparkles className="w-5 h-5 text-white font-bold" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                                    {siteName}
                                </span>
                                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Control Tower
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                    {navigation.map((group, groupIdx) => (
                        <div key={groupIdx}>
                            {!sidebarCollapsed && (
                                <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                                    {group.group}
                                </h4>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item, idx) => {
                                    const Icon = item.icon;
                                    const isActive = item.current;

                                    return (
                                        <Link
                                            key={idx}
                                            href={item.href}
                                            title={sidebarCollapsed ? item.name : undefined}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                                                isActive
                                                    ? 'bg-orange-50 text-orange-700 border border-orange-200/90 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60 shadow-2xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent'
                                            } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                                        >
                                            <Icon
                                                className={`w-4.5 h-4.5 flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                                                    isActive 
                                                        ? 'text-orange-600 dark:text-orange-400' 
                                                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                                }`}
                                            />
                                            {!sidebarCollapsed && (
                                                <div className="flex items-center justify-between flex-1 truncate">
                                                    <span className="truncate">{item.name}</span>
                                                    {item.badge && (
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                                            isActive
                                                                ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-700/60'
                                                                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
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
                <div className="hidden lg:flex p-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs font-semibold gap-2"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4" />
                                <span>Collapse Sidebar</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${
                    sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
                }`}
            >
                {/* Topbar */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-3 py-2 rounded-xl w-64 lg:w-72 focus-within:ring-2 focus-within:ring-orange-400/20 focus-within:border-orange-400 transition">
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search catalog, orders... (Ctrl+K)"
                                className="bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Light / Dark Mode Toggle */}
                        <ThemeToggle />

                        {/* Storefront Quick View Link */}
                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition shadow-2xs"
                        >
                            <Store className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                            <span className="hidden sm:inline">Storefront</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>

                        {/* User Profile & Actions Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            >
                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center font-bold text-xs shadow-2xs">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="hidden md:flex flex-col pr-0.5">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</span>
                                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold capitalize">{user?.role?.replace('_', ' ')}</span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-40">
                                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                            <div className="mt-1.5">
                                                <Badge
                                                    variant={user?.role === 'super_admin' ? 'purple' : 'orange'}
                                                    size="sm"
                                                >
                                                    {user?.role?.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 transition cursor-pointer text-left"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
