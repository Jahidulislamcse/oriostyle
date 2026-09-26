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

    const siteName = settings?.site_name || 'ORIO STYLE LTD';

    return (
        <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#071324] text-[#0E2038] dark:text-slate-100 font-sans selection:bg-[#D4AF37] selection:text-[#071324] flex flex-col transition-colors duration-200">
            <Head title={title ? `${title} - Admin Control Tower` : `${siteName} - Admin`} />
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
                    sidebarCollapsed ? 'w-20' : 'w-64'
                } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Brand Header */}
                <div className="h-16 px-4 border-b border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#926F18] flex-shrink-0 flex items-center justify-center shadow-md shadow-[#D4AF37]/25 group-hover:scale-105 transition">
                            <Sparkles className="w-5 h-5 text-[#071324] font-bold" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-extrabold tracking-tight text-[#0E2038] dark:text-white truncate">
                                    {siteName}
                                </span>
                                <span className="text-[10px] font-bold text-[#926F18] dark:text-[#EBD495] uppercase tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3 text-[#D4AF37]" /> Control Tower
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
                                <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] mb-1.5">
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
                                                    ? 'bg-[#FDFBF5] text-[#926F18] border border-[#F5E7C2] dark:bg-[#142C49] dark:text-[#EBD495] dark:border-[#D4AF37]/50 shadow-2xs'
                                                    : 'text-slate-600 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#142C49]/60 border border-transparent'
                                            } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
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
                                                    <span className="truncate">{item.name}</span>
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
                <div className="hidden lg:flex p-3 border-t border-slate-200 dark:border-[#1C3E63]/70">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-[#8EB0CF] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#142C49] transition cursor-pointer text-xs font-semibold gap-2"
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
                <header className="h-16 border-b border-slate-200 dark:border-[#1C3E63]/70 bg-white/90 dark:bg-[#0E2038]/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#142C49] transition cursor-pointer"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-[#8EB0CF] bg-slate-100/80 dark:bg-[#142C49]/70 border border-slate-200 dark:border-[#1C3E63] px-3 py-2 rounded-xl w-64 lg:w-72 focus-within:ring-2 focus-within:ring-[#D4AF37]/30 focus-within:border-[#D4AF37] transition">
                            <Search className="w-4 h-4 text-slate-400 dark:text-[#5E8CB6] shrink-0" />
                            <input
                                type="text"
                                placeholder="Search catalog, orders... (Ctrl+K)"
                                className="bg-transparent text-xs text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#8EB0CF]/60 focus:outline-none w-full"
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
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#FDFBF5] hover:text-[#926F18] hover:border-[#F5E7C2] dark:bg-[#142C49] dark:hover:bg-[#1C3E63] text-slate-700 dark:text-[#BACDE3] border border-slate-200 dark:border-[#1C3E63] text-xs font-semibold transition shadow-2xs"
                        >
                            <Store className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#EBD495]" />
                            <span className="hidden sm:inline">Storefront</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 dark:text-[#5E8CB6]" />
                        </Link>

                        {/* User Profile & Actions Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#142C49] transition text-left cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-[#1C3E63]"
                            >
                                <div className="w-8 h-8 rounded-lg bg-[#FBF5E6] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs shadow-2xs">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="hidden md:flex flex-col pr-0.5">
                                    <span className="text-xs font-bold text-[#0E2038] dark:text-white leading-tight">{user?.name}</span>
                                    <span className="text-[10px] text-[#926F18] dark:text-[#DFC068] font-semibold capitalize">{user?.role?.replace('_', ' ')}</span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] rounded-2xl shadow-xl py-2 z-40">
                                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#1C3E63]/70 mb-1">
                                            <p className="text-xs font-bold text-[#0E2038] dark:text-white truncate">{user?.name}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-[#8EB0CF] truncate">{user?.email}</p>
                                            <div className="mt-1.5">
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
