import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import DataTable from '@/Components/Common/DataTable';
import {
    Award,
    Plus,
    Edit3,
    Trash2,
    Globe,
    CheckCircle2,
    XCircle,
    Star,
    Search,
    Grid,
    List,
    Image as ImageIcon,
    ExternalLink,
    Package
} from 'lucide-react';

export default function BrandIndex({ brands = { data: [] }, stats = {}, filters = {} }) {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [deletingBrand, setDeletingBrand] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    // Form setup
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        slug: '',
        website_url: '',
        description: '',
        display_order: 0,
        is_active: true,
        is_featured: false,
        logo: null,
        remove_logo: false,
        meta_title: '',
        meta_description: '',
    });

    // Handle filter application
    const applyFilters = (newSearch = searchQuery, newStatus = statusFilter) => {
        router.get(
            route('admin.brands.index'),
            { search: newSearch, status: newStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        applyFilters(searchQuery, val);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setLogoPreview(null);
        setData({
            name: '',
            slug: '',
            website_url: '',
            description: '',
            display_order: 0,
            is_active: true,
            is_featured: false,
            logo: null,
            remove_logo: false,
            meta_title: '',
            meta_description: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (brand) => {
        reset();
        clearErrors();
        setEditingBrand(brand);
        setLogoPreview(brand.logo_url || null);
        setData({
            name: brand.name || '',
            slug: brand.slug || '',
            website_url: brand.website_url || '',
            description: brand.description || '',
            display_order: brand.display_order ?? 0,
            is_active: Boolean(brand.is_active),
            is_featured: Boolean(brand.is_featured),
            logo: null,
            remove_logo: false,
            meta_title: brand.meta_title || '',
            meta_description: brand.meta_description || '',
        });
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.brands.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editingBrand) return;

        // Use Inertia post with _method PUT for multipart form data support
        router.post(route('admin.brands.update', editingBrand.id), {
            _method: 'put',
            ...data,
        }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deletingBrand) return;
        router.delete(route('admin.brands.destroy', deletingBrand.id), {
            onSuccess: () => setDeletingBrand(null),
        });
    };

    const handleToggleActive = (brand) => {
        router.patch(route('admin.brands.toggle-active', brand.id), {}, { preserveScroll: true });
    };

    const handleToggleFeatured = (brand) => {
        router.patch(route('admin.brands.toggle-featured', brand.id), {}, { preserveScroll: true });
    };

    // Columns for table view
    const columns = [
        {
            key: 'name',
            label: 'Brand',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy-800 border border-gold-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {row.logo_url ? (
                            <img src={row.logo_url} alt={row.name} className="w-full h-full object-contain p-1" />
                        ) : (
                            <Award className="w-5 h-5 text-gold-400/60" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-slate-100">{row.name}</div>
                        <div className="text-xs text-slate-400 font-mono">/{row.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'products_count',
            label: 'Products',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-slate-300 font-mono text-sm">
                    <Package className="w-4 h-4 text-gold-400" />
                    <span>{row.products_count ?? row.products?.length ?? 0}</span>
                </div>
            ),
        },
        {
            key: 'website_url',
            label: 'Website',
            render: (row) => row.website_url ? (
                <a
                    href={row.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 hover:underline"
                >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[140px]">{row.website_url.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                </a>
            ) : (
                <span className="text-xs text-slate-500">—</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleToggleActive(row)}
                        title="Toggle Active Status"
                        className="transition-transform active:scale-95"
                    >
                        <Badge variant={row.is_active ? 'success' : 'secondary'} className="cursor-pointer">
                            {row.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </button>
                    {row.is_featured && (
                        <Badge variant="warning" className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-gold-400" />
                            Featured
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openEditModal(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
                        title="Edit Brand"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDeletingBrand(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
                        title="Delete Brand"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const brandList = Array.isArray(brands) ? brands : (brands.data || []);

    return (
        <AdminLayout title="Brands Catalog">
            <Head title="Brands Catalog - Admin" />

            <div className="space-y-6">
                {/* Header section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                            <Award className="w-7 h-7 text-gold-400" />
                            Brand Catalog
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Manage partner brands, manufacturer logos, and featured brand showcases.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
                        Add New Brand
                    </Button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Total Brands</span>
                            <Award className="w-4 h-4 text-gold-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">
                            {stats.total ?? brandList.length}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Active Brands</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                            {stats.active_count ?? 0}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Inactive</span>
                            <XCircle className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-400 mt-2 font-mono">
                            {stats.inactive_count ?? 0}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Featured Brands</span>
                            <Star className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
                            {stats.featured_count ?? 0}
                        </div>
                    </div>
                </div>

                {/* Filters and View Controls */}
                <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by brand name or slug..."
                                className="w-full bg-navy-950/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="px-4">
                            Filter
                        </Button>
                    </form>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <FormSelect
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-36 text-sm"
                            options={[
                                { label: 'All Status', value: 'all' },
                                { label: 'Active Only', value: 'active' },
                                { label: 'Inactive Only', value: 'inactive' },
                                { label: 'Featured Only', value: 'featured' },
                            ]}
                        />

                        <div className="flex items-center bg-navy-950 border border-slate-700/80 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gold-500/20 text-gold-400' : 'text-slate-400 hover:text-slate-200'}`}
                                title="Grid View"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-gold-500/20 text-gold-400' : 'text-slate-400 hover:text-slate-200'}`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content View */}
                {brandList.length === 0 ? (
                    <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-12 text-center">
                        <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-300">No Brands Found</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                            No brand entries matched your search parameters. Try adjusting filters or add a new brand.
                        </p>
                        <Button onClick={openCreateModal} variant="outline" className="mt-4" icon={<Plus className="w-4 h-4" />}>
                            Add Brand
                        </Button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {brandList.map((brand) => (
                            <div
                                key={brand.id}
                                className="bg-navy-900/80 border border-gold-500/20 hover:border-gold-500/40 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-gold-500/5 group"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-14 h-14 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-gold-500/50 transition-colors">
                                            {brand.logo_url ? (
                                                <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Award className="w-7 h-7 text-gold-400/50" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleToggleFeatured(brand)}
                                                className={`p-1.5 rounded-lg border transition-colors ${
                                                    brand.is_featured
                                                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                                                        : 'bg-navy-950 border-slate-700/80 text-slate-500 hover:text-amber-400'
                                                }`}
                                                title="Toggle Featured"
                                            >
                                                <Star className={`w-3.5 h-3.5 ${brand.is_featured ? 'fill-amber-400' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(brand)}
                                                className={`p-1.5 rounded-lg border transition-colors ${
                                                    brand.is_active
                                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                                        : 'bg-navy-950 border-slate-700/80 text-slate-500 hover:text-emerald-400'
                                                }`}
                                                title="Toggle Active"
                                            >
                                                {brand.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-100 mt-4 group-hover:text-gold-300 transition-colors">
                                        {brand.name}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-mono">/{brand.slug}</p>

                                    {brand.description && (
                                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                            {brand.description}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                    <div className="flex items-center gap-1.5 font-mono">
                                        <Package className="w-3.5 h-3.5 text-gold-400" />
                                        <span>{brand.products_count ?? brand.products?.length ?? 0} Products</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(brand)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingBrand(brand)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl overflow-hidden">
                        <DataTable columns={columns} data={brandList} />
                    </div>
                )}
            </div>

            {/* Modal: Create Brand */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Brand"
                maxWidth="md"
            >
                <form onSubmit={submitCreate} className="space-y-4">
                    <FormInput
                        label="Brand Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="e.g., Nike, Samsung, Orio Luxury"
                    />

                    <FormInput
                        label="Slug (URL Friendly)"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        error={errors.slug}
                        placeholder="auto-generated if left empty"
                        hint="Unique URL identifier for brand catalog filter"
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Brand Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-slate-600" />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy-800 file:text-gold-400 hover:file:bg-navy-700 cursor-pointer"
                            />
                        </div>
                        {errors.logo && <p className="text-xs text-red-400 mt-1">{errors.logo}</p>}
                    </div>

                    <FormInput
                        label="Official Website URL"
                        type="url"
                        value={data.website_url}
                        onChange={(e) => setData('website_url', e.target.value)}
                        error={errors.website_url}
                        placeholder="https://brand-website.com"
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description of the brand background or origin..."
                            className="w-full bg-navy-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                        />
                        {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Display Order"
                            type="number"
                            value={data.display_order}
                            onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                            error={errors.display_order}
                        />

                        <div className="flex flex-col justify-center space-y-2 pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-700 bg-navy-950 text-gold-500 focus:ring-gold-500/30"
                                />
                                <span className="text-xs font-semibold text-slate-300 uppercase">Active Status</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="rounded border-slate-700 bg-navy-950 text-amber-500 focus:ring-amber-500/30"
                                />
                                <span className="text-xs font-semibold text-slate-300 uppercase">Featured Showcase</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 space-y-3">
                        <FormInput
                            label="Meta Title (SEO)"
                            value={data.meta_title}
                            onChange={(e) => setData('meta_title', e.target.value)}
                            error={errors.meta_title}
                            placeholder="SEO Browser Title"
                        />

                        <FormInput
                            label="Meta Description (SEO)"
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                            error={errors.meta_description}
                            placeholder="SEO Meta Description snippet"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={processing}>
                            Create Brand
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit Brand */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Brand: ${editingBrand?.name || ''}`}
                maxWidth="md"
            >
                <form onSubmit={submitEdit} className="space-y-4">
                    <FormInput
                        label="Brand Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                    />

                    <FormInput
                        label="Slug"
                        required
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        error={errors.slug}
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Brand Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-slate-600" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy-800 file:text-gold-400 hover:file:bg-navy-700 cursor-pointer"
                                />
                                {logoPreview && (
                                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                                        <input
                                            type="checkbox"
                                            checked={data.remove_logo}
                                            onChange={(e) => setData('remove_logo', e.target.checked)}
                                            className="rounded border-slate-700 bg-navy-950 text-red-500"
                                        />
                                        <span className="text-xs text-red-400 font-medium">Remove current logo</span>
                                    </label>
                                )}
                            </div>
                        </div>
                        {errors.logo && <p className="text-xs text-red-400 mt-1">{errors.logo}</p>}
                    </div>

                    <FormInput
                        label="Official Website URL"
                        type="url"
                        value={data.website_url}
                        onChange={(e) => setData('website_url', e.target.value)}
                        error={errors.website_url}
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full bg-navy-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                        />
                        {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Display Order"
                            type="number"
                            value={data.display_order}
                            onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                            error={errors.display_order}
                        />

                        <div className="flex flex-col justify-center space-y-2 pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-700 bg-navy-950 text-gold-500 focus:ring-gold-500/30"
                                />
                                <span className="text-xs font-semibold text-slate-300 uppercase">Active Status</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="rounded border-slate-700 bg-navy-950 text-amber-500 focus:ring-amber-500/30"
                                />
                                <span className="text-xs font-semibold text-slate-300 uppercase">Featured Showcase</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 space-y-3">
                        <FormInput
                            label="Meta Title (SEO)"
                            value={data.meta_title}
                            onChange={(e) => setData('meta_title', e.target.value)}
                            error={errors.meta_title}
                        />

                        <FormInput
                            label="Meta Description (SEO)"
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                            error={errors.meta_description}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                        <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={processing}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deletingBrand)}
                onClose={() => setDeletingBrand(null)}
                onConfirm={confirmDelete}
                title="Delete Brand"
                message={`Are you sure you want to delete '${deletingBrand?.name}'? Any associated products will lose their brand reference.`}
                confirmText="Delete Brand"
                type="danger"
            />
        </AdminLayout>
    );
}
