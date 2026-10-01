import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import DataTable from '@/Components/Common/DataTable';
import {
    Package,
    Plus,
    Edit3,
    Trash2,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Star,
    Layers,
    Award,
    Grid,
    List,
    Box
} from 'lucide-react';

export default function ProductIndex({
    products = { data: [] },
    categories = [],
    brands = [],
    stats = {},
    filters = {}
}) {
    const [viewMode, setViewMode] = useState('table');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [brandFilter, setBrandFilter] = useState(filters.brand || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Modals state
    const [stockModalProduct, setStockModalProduct] = useState(null);
    const [newStockQty, setNewStockQty] = useState(0);
    const [stockUpdating, setStockUpdating] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);

    const applyFilters = (
        search = searchQuery,
        cat = categoryFilter,
        br = brandFilter,
        st = statusFilter
    ) => {
        router.get(
            route('admin.products.index'),
            { search, category: cat, brand: br, status: st },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const confirmDelete = () => {
        if (!deletingProduct) return;
        router.delete(route('admin.products.destroy', deletingProduct.id), {
            onSuccess: () => setDeletingProduct(null),
        });
    };

    const openStockModal = (product) => {
        setStockModalProduct(product);
        setNewStockQty(product.stock_quantity ?? 0);
    };

    const submitStockUpdate = (e) => {
        e.preventDefault();
        if (!stockModalProduct) return;

        setStockUpdating(true);
        router.patch(
            route('admin.products.update-stock', stockModalProduct.id),
            { stock_quantity: newStockQty },
            {
                onSuccess: () => {
                    setStockModalProduct(null);
                    setStockUpdating(false);
                },
                onError: () => setStockUpdating(false),
            }
        );
    };

    const handleToggleActive = (product) => {
        router.patch(route('admin.products.toggle-active', product.id), {}, { preserveScroll: true });
    };

    const handleToggleFeatured = (product) => {
        router.patch(route('admin.products.toggle-featured', product.id), {}, { preserveScroll: true });
    };

    const categoryOptions = [
        { label: 'All Categories', value: 'all' },
        ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
    ];

    const brandOptions = [
        { label: 'All Brands', value: 'all' },
        ...brands.map((b) => ({ label: b.name, value: String(b.id) })),
    ];

    const statusOptions = [
        { label: 'All Status', value: 'all' },
        { label: 'Active Only', value: 'active' },
        { label: 'Inactive Only', value: 'inactive' },
        { label: 'Low Stock Alert', value: 'low_stock' },
        { label: 'Out of Stock', value: 'out_of_stock' },
        { label: 'Featured Only', value: 'featured' },
    ];

    const getStockBadge = (product) => {
        const qty = product.stock_quantity ?? 0;
        const threshold = product.low_stock_threshold ?? 5;

        if (qty <= 0) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                    <XCircle className="w-3 h-3" /> Out of Stock
                </span>
            );
        }
        if (qty <= threshold) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> Low Stock ({qty})
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> {qty} in stock
            </span>
        );
    };

    const columns = [
        {
            key: 'name',
            label: 'Product',
            cellClassName: 'min-w-[240px]',
            render: (val, item) => {
                const row = item || val || {};
                const imageUrl =
                    row.primary_image_url ||
                    row.primary_image?.image_url ||
                    row.primary_image?.image_path ||
                    row.images?.[0]?.image_url ||
                    row.images?.[0]?.image_path;

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={row.name || 'Product'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Package className="w-6 h-6 text-gold-400/40" />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-100 line-clamp-1">{row.name || 'N/A'}</div>
                            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                                <span>SKU: {row.sku || 'N/A'}</span>
                                {row.is_new_arrival && (
                                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                                        NEW
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'category_brand',
            label: 'Category & Brand',
            cellClassName: 'min-w-[160px]',
            render: (val, item) => {
                const row = item || val || {};
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-slate-300">
                            <Layers className="w-3 h-3 text-gold-400" />
                            <span>{row.category?.name || 'Uncategorized'}</span>
                        </div>
                        {row.brand && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Award className="w-3 h-3 text-amber-400" />
                                <span>{row.brand.name}</span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'price',
            label: 'Price',
            cellClassName: 'min-w-[120px]',
            render: (val, item) => {
                const row = item || val || {};
                return (
                    <div className="font-mono text-sm">
                        {row.sale_price ? (
                            <div>
                                <span className="font-bold text-emerald-400">
                                    ${(parseFloat(row.sale_price) || 0).toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500 line-through ml-1.5">
                                    ${(parseFloat(row.base_price) || 0).toFixed(2)}
                                </span>
                            </div>
                        ) : (
                            <span className="font-bold text-slate-200">
                                ${(parseFloat(row.base_price) || 0).toFixed(2)}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'stock',
            label: 'Stock Level',
            cellClassName: 'min-w-[130px]',
            render: (val, item) => {
                const row = item || val || {};
                return (
                    <button
                        onClick={() => openStockModal(row)}
                        className="hover:opacity-80 transition-opacity text-left"
                        title="Click to adjust stock level"
                    >
                        {getStockBadge(row)}
                    </button>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            cellClassName: 'min-w-[160px]',
            render: (val, item) => {
                const row = item || val || {};
                return (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                            onClick={() => handleToggleActive(row)}
                            className="transition-transform active:scale-95"
                            title="Toggle Active Status"
                        >
                            <Badge variant={row.is_active ? 'success' : 'secondary'} className="cursor-pointer">
                                {row.is_active ? 'Active' : 'Draft'}
                            </Badge>
                        </button>
                        {row.is_featured && (
                            <button
                                onClick={() => handleToggleFeatured(row)}
                                title="Toggle Featured"
                            >
                                <Badge variant="warning" className="cursor-pointer flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    Featured
                                </Badge>
                            </button>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            cellClassName: 'min-w-[90px]',
            render: (val, item) => {
                const row = (item && typeof item === 'object' && item.id) ? item : (val && typeof val === 'object' && val.id) ? val : (item || val || {});
                const productId = row.id;

                return (
                    <div className="flex items-center gap-2">
                        {productId ? (
                            <Link
                                href={`/admin/products/${productId}/edit`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
                                title="Edit Product"
                            >
                                <Edit3 className="w-4 h-4" />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="p-1.5 rounded-lg text-slate-600 cursor-not-allowed"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setDeletingProduct(row)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
                            title="Delete Product"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    const productList = products.data || [];

    return (
        <AdminLayout title="Products Catalog">
            <Head title="Products Catalog - Admin" />

            <div className="space-y-6">
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                            <Package className="w-7 h-7 text-gold-400" />
                            Products Catalog
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Manage your inventory stock, product variants, galleries, and pricing strategy.
                        </p>
                    </div>
                    <Link href={route('admin.products.create')}>
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                            Add New Product
                        </Button>
                    </Link>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Total Products</span>
                            <Box className="w-4 h-4 text-gold-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">
                            {stats.total ?? productList.length}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Active</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                            {stats.active_count ?? 0}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Low Stock</span>
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
                            {stats.low_stock_count ?? 0}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Out of Stock</span>
                            <XCircle className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-red-400 mt-2 font-mono">
                            {stats.out_of_stock_count ?? 0}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm col-span-2 md:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Featured</span>
                            <Star className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
                            {stats.featured_count ?? 0}
                        </div>
                    </div>
                </div>

                {/* Organized Filters & Actions Bar */}
                <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-4">
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full xl:w-auto flex-1 max-w-lg">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by product name, SKU..."
                                    className="w-full bg-navy-950/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="sm" className="px-4 shrink-0">
                                Search
                            </Button>
                        </form>

                        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
                            <FormSelect
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                    applyFilters(searchQuery, e.target.value, brandFilter, statusFilter);
                                }}
                                containerClassName="w-full sm:w-44"
                                options={categoryOptions}
                                placeholder={null}
                            />

                            <FormSelect
                                value={brandFilter}
                                onChange={(e) => {
                                    setBrandFilter(e.target.value);
                                    applyFilters(searchQuery, categoryFilter, e.target.value, statusFilter);
                                }}
                                containerClassName="w-full sm:w-36"
                                options={brandOptions}
                                placeholder={null}
                            />

                            <FormSelect
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    applyFilters(searchQuery, categoryFilter, brandFilter, e.target.value);
                                }}
                                containerClassName="w-full sm:w-40"
                                options={statusOptions}
                                placeholder={null}
                            />

                            <div className="flex items-center bg-navy-950 border border-slate-700/80 rounded-xl p-1 shrink-0">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-gold-500/20 text-gold-400' : 'text-slate-400 hover:text-slate-200'}`}
                                    title="Table View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gold-500/20 text-gold-400' : 'text-slate-400 hover:text-slate-200'}`}
                                    title="Grid View"
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table or Grid Display */}
                {productList.length === 0 ? (
                    <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-12 text-center">
                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-300">No Products Found</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                            No products match your current search or filter criteria. Try resetting filters or create a new product.
                        </p>
                        <Link href={route('admin.products.create')} className="inline-block mt-4">
                            <Button variant="outline" icon={<Plus className="w-4 h-4" />}>
                                Create Product
                            </Button>
                        </Link>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl overflow-hidden">
                        <DataTable columns={columns} data={productList} searchable={false} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {productList.map((product) => {
                            const imageUrl =
                                product.primary_image_url ||
                                product.primary_image?.image_url ||
                                product.primary_image?.image_path ||
                                product.images?.[0]?.image_url ||
                                product.images?.[0]?.image_path;

                            return (
                                <div
                                    key={product.id}
                                    className="bg-navy-900/80 border border-gold-500/20 hover:border-gold-500/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-gold-500/5 group"
                                >
                                    <div>
                                        <div className="relative aspect-square bg-navy-950 overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-12 h-12 text-gold-400/20" />
                                                </div>
                                            )}

                                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                                {product.is_featured && (
                                                    <span className="bg-amber-500/90 text-navy-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                                        <Star className="w-3 h-3 fill-navy-950" /> Featured
                                                    </span>
                                                )}
                                                {product.is_new_arrival && (
                                                    <span className="bg-blue-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>

                                            <div className="absolute bottom-2 left-2">
                                                <button onClick={() => openStockModal(product)}>
                                                    {getStockBadge(product)}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="text-xs text-slate-400 font-mono mb-1">
                                                SKU: {product.sku || 'N/A'}
                                            </div>
                                            <h3 className="font-semibold text-slate-100 line-clamp-1 group-hover:text-gold-300 transition-colors">
                                                {product.name}
                                            </h3>

                                            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                                                <span>{product.category?.name || 'Uncategorized'}</span>
                                                {product.brand && <span className="text-gold-400/80">{product.brand.name}</span>}
                                            </div>

                                            <div className="mt-3 font-mono text-base font-bold flex items-baseline justify-between">
                                                {product.sale_price ? (
                                                    <div>
                                                        <span className="text-emerald-400">
                                                            ${(parseFloat(product.sale_price) || 0).toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-slate-500 line-through ml-2">
                                                            ${(parseFloat(product.base_price) || 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-100">
                                                        ${(parseFloat(product.base_price) || 0).toFixed(2)}
                                                    </span>
                                                )}

                                                <Badge variant={product.is_active ? 'success' : 'secondary'}>
                                                    {product.is_active ? 'Active' : 'Draft'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
                                        <button
                                            onClick={() => handleToggleActive(product)}
                                            className="text-xs text-slate-400 hover:text-gold-400 transition-colors"
                                        >
                                            Toggle Status
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {product?.id ? (
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                            ) : null}
                                            <button
                                                onClick={() => setDeletingProduct(product)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Stock Modal */}
            <Modal
                isOpen={Boolean(stockModalProduct)}
                onClose={() => setStockModalProduct(null)}
                title={`Quick Stock Adjust: ${stockModalProduct?.name || ''}`}
                maxWidth="sm"
            >
                <form onSubmit={submitStockUpdate} className="space-y-4">
                    <p className="text-xs text-slate-400">
                        Current stock is <strong className="text-gold-400">{stockModalProduct?.stock_quantity}</strong> unit(s).
                        Update stock count directly below:
                    </p>

                    <FormInput
                        label="New Stock Quantity"
                        type="number"
                        min="0"
                        required
                        value={newStockQty}
                        onChange={(e) => setNewStockQty(parseInt(e.target.value) || 0)}
                    />

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <Button type="button" variant="ghost" onClick={() => setStockModalProduct(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={stockUpdating}>
                            Update Stock
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deletingProduct)}
                onClose={() => setDeletingProduct(null)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete '${deletingProduct?.name}'? This action cannot be undone.`}
                confirmText="Delete Product"
                type="danger"
            />
        </AdminLayout>
    );
}
