import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import {
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    Search,
    Grid,
    List,
    Image as ImageIcon,
    ExternalLink,
    Sliders,
    Layers,
    Sparkles,
    Move
} from 'lucide-react';

export default function BannerIndex({ banners = { data: [] }, stats = {}, filters = {} }) {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [deletingBanner, setDeletingBanner] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Form setup
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        subtitle: '',
        badge_text: '',
        button_text: '',
        link_url: '',
        type: 'hero',
        display_order: 0,
        is_active: true,
        image: null,
        image_path: '',
        remove_image: false,
    });

    const applyFilters = (newType = typeFilter, newSearch = searchQuery, newStatus = statusFilter) => {
        router.get(
            route('admin.banners.index'),
            { type: newType, search: newSearch, status: newStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters(typeFilter, searchQuery, statusFilter);
    };

    const handleTypeChange = (type) => {
        setTypeFilter(type);
        applyFilters(type, searchQuery, statusFilter);
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        applyFilters(typeFilter, searchQuery, val);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setImagePreview(null);
        setData({
            title: '',
            subtitle: '',
            badge_text: '',
            button_text: '',
            link_url: '',
            type: 'hero',
            display_order: 0,
            is_active: true,
            image: null,
            image_path: '',
            remove_image: false,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (banner) => {
        reset();
        clearErrors();
        setEditingBanner(banner);
        setImagePreview(banner.image_url || null);
        setData({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            badge_text: banner.badge_text || '',
            button_text: banner.button_text || '',
            link_url: banner.link_url || '',
            type: banner.type || 'hero',
            display_order: banner.display_order ?? 0,
            is_active: Boolean(banner.is_active),
            image: null,
            image_path: banner.image_path || '',
            remove_image: false,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('admin.banners.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setImagePreview(null);
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingBanner) return;

        // Use Inertia post with method spoofing _method: 'PUT' for file uploads
        router.post(route('admin.banners.update', editingBanner.id), {
            _method: 'PUT',
            ...data,
        }, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingBanner(null);
                reset();
                setImagePreview(null);
            },
        });
    };

    const handleToggleActive = (banner) => {
        router.patch(route('admin.banners.toggle-active', banner.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!deletingBanner) return;
        router.delete(route('admin.banners.destroy', deletingBanner.id), {
            onSuccess: () => setDeletingBanner(null),
        });
    };

    const bannerList = banners.data || [];

    return (
        <AdminLayout title="Banners & Sliders CMS">
            <Head title="Banners & Sliders Management" />

            <div className="space-y-6">
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0E2038] p-5 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                            <Sliders className="w-6 h-6 text-[#D4AF37]" />
                            Banners & Sliders Management
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Manage storefront hero sliders, split promotional banners, and campaign showcases dynamically.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            onClick={openCreateModal}
                            className="bg-[#D4AF37] hover:bg-[#c49f2e] text-[#071324] font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add New Banner
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                    <div className="bg-white dark:bg-[#0E2038] p-4 rounded-xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Banners</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-[#0E2038] p-4 rounded-xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Active</span>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.active_count || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-[#0E2038] p-4 rounded-xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Hero Slides</span>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.hero_count || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-[#0E2038] p-4 rounded-xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Split Banners</span>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.split_count || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-[#0E2038] p-4 rounded-xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500">Promo Cards</span>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.promo_count || 0}</p>
                    </div>
                </div>

                {/* Filter & View Controls */}
                <div className="bg-white dark:bg-[#0E2038] p-4 rounded-xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Type Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        {['all', 'hero', 'split', 'promo'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleTypeChange(t)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                                    typeFilter === t
                                        ? 'bg-[#0E2038] dark:bg-[#D4AF37] text-white dark:text-[#071324] shadow-xs'
                                        : 'bg-slate-100 dark:bg-[#1C3E63]/40 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1C3E63]/60'
                                }`}
                            >
                                {t === 'all' ? 'All Types' : t === 'hero' ? 'Hero Sliders' : t === 'split' ? 'Split Promos' : 'Promo Cards'}
                            </button>
                        ))}
                    </div>

                    {/* Search & Status Filters */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search title, badge..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1C3E63] bg-white dark:bg-[#071324] text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#D4AF37]"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        </form>

                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-[#1C3E63] bg-white dark:bg-[#071324] text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#D4AF37]"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>

                        <div className="flex items-center bg-slate-100 dark:bg-[#071324] rounded-lg p-0.5 border border-slate-200 dark:border-[#1C3E63]">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-[#1C3E63] text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
                                title="Grid View"
                            >
                                <Grid className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-[#1C3E63] text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
                                title="List View"
                            >
                                <List className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Banner Cards Grid / Table View */}
                {bannerList.length === 0 ? (
                    <div className="bg-white dark:bg-[#0E2038] p-12 text-center rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Banners Found</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            No banners matched your current filter criteria. Create a new banner to showcase items on the storefront.
                        </p>
                        <Button
                            variant="primary"
                            onClick={openCreateModal}
                            className="mt-4 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#071324] font-bold text-xs uppercase px-4 py-2 rounded-xl"
                        >
                            <Plus className="w-4 h-4 mr-1 inline" /> Create First Banner
                        </Button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {bannerList.map((banner) => (
                            <div
                                key={banner.id}
                                className="bg-white dark:bg-[#0E2038] rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs overflow-hidden flex flex-col hover:border-[#D4AF37]/50 transition group"
                            >
                                {/* Banner Image Preview Header */}
                                <div className="relative h-44 bg-slate-950 overflow-hidden flex items-center justify-center">
                                    {banner.image_url ? (
                                        <img
                                            src={banner.image_url}
                                            alt={banner.title || 'Banner'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-500">
                                            <ImageIcon className="w-8 h-8 mb-1" />
                                            <span className="text-[10px] uppercase font-bold">No Image</span>
                                        </div>
                                    )}

                                    {/* Type Pill */}
                                    <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs ${
                                        banner.type === 'hero'
                                            ? 'bg-amber-500 text-slate-950'
                                            : banner.type === 'split'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-purple-600 text-white'
                                    }`}>
                                        {banner.type}
                                    </span>

                                    {/* Active Status Badge */}
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActive(banner)}
                                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                                            banner.is_active
                                                ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                                                : 'bg-rose-500/90 text-white hover:bg-rose-600'
                                        }`}
                                    >
                                        {banner.is_active ? 'Active' : 'Inactive'}
                                    </button>

                                    {/* Badge Overlay */}
                                    {banner.badge_text && (
                                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-white/20">
                                            {banner.badge_text}
                                        </div>
                                    )}
                                </div>

                                {/* Banner Body */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                {banner.title || 'Untitled Banner'}
                                            </h4>
                                            <span className="text-[11px] font-bold text-slate-400 shrink-0">
                                                Order: #{banner.display_order}
                                            </span>
                                        </div>
                                        {banner.subtitle && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                                {banner.subtitle}
                                            </p>
                                        )}

                                        {banner.link_url && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 truncate mb-3">
                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{banner.link_url}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-[#1C3E63]/50 flex items-center justify-between">
                                        <div className="text-[11px] font-semibold text-slate-400">
                                            Btn: <span className="text-slate-700 dark:text-slate-300 font-bold">{banner.button_text || 'None'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(banner)}
                                                className="p-1.5 text-slate-500 hover:text-[#D4AF37] hover:bg-slate-100 dark:hover:bg-[#1C3E63] rounded-lg transition"
                                                title="Edit Banner"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingBanner(banner)}
                                                className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                                                title="Delete Banner"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#0E2038] rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-[#071324] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-[#1C3E63]/70">
                                    <tr>
                                        <th className="p-4">Image</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Title & Subtitle</th>
                                        <th className="p-4">Badge / Button</th>
                                        <th className="p-4">Order</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#1C3E63]/40">
                                    {bannerList.map((banner) => (
                                        <tr key={banner.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C3E63]/20 transition">
                                            <td className="p-4">
                                                <div className="w-20 h-12 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                                                    {banner.image_url ? (
                                                        <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-4 h-4 text-slate-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-[#1C3E63] text-slate-700 dark:text-slate-300">
                                                    {banner.type}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{banner.title || 'Untitled'}</div>
                                                <div className="text-[11px] text-slate-400 truncate max-w-xs">{banner.subtitle || '—'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-slate-700 dark:text-slate-300 font-semibold">{banner.badge_text || '—'}</div>
                                                <div className="text-[11px] text-slate-400">Btn: {banner.button_text || '—'}</div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-600 dark:text-slate-300">
                                                #{banner.display_order}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(banner)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        banner.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                                    }`}
                                                >
                                                    {banner.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(banner)}
                                                        className="p-1.5 text-slate-500 hover:text-[#D4AF37] rounded-lg transition"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingBanner(banner)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Banner Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Banner"
                maxWidth="2xl"
            >
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect
                            label="Banner Placement / Type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            error={errors.type}
                            options={[
                                { value: 'hero', label: 'Hero Slider Banner (Top Carousel)' },
                                { value: 'split', label: 'Split Promotional Banner (2-Column Grid)' },
                                { value: 'promo', label: 'Promotional Lookbook Card' },
                            ]}
                            required
                        />

                        <FormInput
                            label="Display Order"
                            type="number"
                            value={data.display_order}
                            onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                            error={errors.display_order}
                            placeholder="0 (Lower shows first)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Banner Title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            error={errors.title}
                            placeholder="e.g., Glorious 10 Years"
                        />

                        <FormInput
                            label="Badge Text (Optional)"
                            value={data.badge_text}
                            onChange={(e) => setData('badge_text', e.target.value)}
                            error={errors.badge_text}
                            placeholder="e.g., NEW ARRIVAL / SPECIAL DROP"
                        />
                    </div>

                    <FormInput
                        label="Subtitle / Description"
                        value={data.subtitle}
                        onChange={(e) => setData('subtitle', e.target.value)}
                        error={errors.subtitle}
                        placeholder="e.g., Purpose & Style with Premium Quality"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Button Text"
                            value={data.button_text}
                            onChange={(e) => setData('button_text', e.target.value)}
                            error={errors.button_text}
                            placeholder="e.g., EXPLORE NOW / SHOP COLLECTION"
                        />

                        <FormInput
                            label="Link URL"
                            value={data.link_url}
                            onChange={(e) => setData('link_url', e.target.value)}
                            error={errors.link_url}
                            placeholder="e.g., /#featured-products or /?category=thobe"
                        />
                    </div>

                    {/* Image Upload & Preview */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Banner Image (High Resolution Recommended: 1920x800 for Hero, 800x1000 for Split)
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-300 dark:border-[#1C3E63] rounded-xl bg-slate-50 dark:bg-[#071324]/50">
                            {imagePreview ? (
                                <div className="w-32 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-32 h-20 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-6 h-6 text-slate-400" />
                                </div>
                            )}
                            <div className="flex-1 w-full">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-[#071324] hover:file:bg-[#c49f2e] cursor-pointer"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, WEBP up to 5MB.</p>
                                {errors.image && <p className="text-xs text-rose-500 mt-1">{errors.image}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="create_is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-300"
                        />
                        <label htmlFor="create_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            Enable banner immediately on storefront
                        </label>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1C3E63]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={processing}
                            className="bg-[#D4AF37] hover:bg-[#c49f2e] text-[#071324] font-bold text-xs uppercase px-5 py-2.5 rounded-xl"
                        >
                            {processing ? 'Creating...' : 'Save Banner'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Banner Modal */}
            <Modal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Banner #${editingBanner?.id || ''}`}
                maxWidth="2xl"
            >
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect
                            label="Banner Placement / Type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            error={errors.type}
                            options={[
                                { value: 'hero', label: 'Hero Slider Banner (Top Carousel)' },
                                { value: 'split', label: 'Split Promotional Banner (2-Column Grid)' },
                                { value: 'promo', label: 'Promotional Lookbook Card' },
                            ]}
                            required
                        />

                        <FormInput
                            label="Display Order"
                            type="number"
                            value={data.display_order}
                            onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                            error={errors.display_order}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Banner Title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            error={errors.title}
                        />

                        <FormInput
                            label="Badge Text"
                            value={data.badge_text}
                            onChange={(e) => setData('badge_text', e.target.value)}
                            error={errors.badge_text}
                        />
                    </div>

                    <FormInput
                        label="Subtitle / Description"
                        value={data.subtitle}
                        onChange={(e) => setData('subtitle', e.target.value)}
                        error={errors.subtitle}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Button Text"
                            value={data.button_text}
                            onChange={(e) => setData('button_text', e.target.value)}
                            error={errors.button_text}
                        />

                        <FormInput
                            label="Link URL"
                            value={data.link_url}
                            onChange={(e) => setData('link_url', e.target.value)}
                            error={errors.link_url}
                        />
                    </div>

                    {/* Image Upload & Preview */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Banner Image
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-300 dark:border-[#1C3E63] rounded-xl bg-slate-50 dark:bg-[#071324]/50">
                            {imagePreview ? (
                                <div className="w-32 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-32 h-20 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-6 h-6 text-slate-400" />
                                </div>
                            )}
                            <div className="flex-1 w-full">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-[#071324] hover:file:bg-[#c49f2e] cursor-pointer"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Upload a new image to replace the current one.</p>
                                {errors.image && <p className="text-xs text-rose-500 mt-1">{errors.image}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="edit_is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-300"
                        />
                        <label htmlFor="edit_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            Banner is active and visible on storefront
                        </label>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1C3E63]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsEditModalOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={processing}
                            className="bg-[#D4AF37] hover:bg-[#c49f2e] text-[#071324] font-bold text-xs uppercase px-5 py-2.5 rounded-xl"
                        >
                            {processing ? 'Saving...' : 'Update Banner'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                show={Boolean(deletingBanner)}
                title="Delete Banner"
                message={`Are you sure you want to delete banner "${deletingBanner?.title || `#${deletingBanner?.id}`}"? This action cannot be undone.`}
                confirmText="Delete Banner"
                onConfirm={handleDelete}
                onCancel={() => setDeletingBanner(null)}
            />
        </AdminLayout>
    );
}
