import React, { useState, useMemo } from 'react';
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
    FolderTree,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    Star,
    Layers,
    CornerDownRight,
    Search,
    Filter,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Image as ImageIcon,
    Tag,
    List,
    Sparkles,
    ShieldAlert,
    RotateCcw
} from 'lucide-react';

export default function CategoryIndex({ categories = [], parentOptions = [], stats = {}, filters = {} }) {
    const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'table'
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [parentFilter, setParentFilter] = useState(filters.parent || 'all');
    const [expandedRoots, setExpandedRoots] = useState(() => {
        // Expand all roots by default
        const init = {};
        categories.forEach(c => {
            if (!c.parent_id) init[c.id] = true;
        });
        return init;
    });

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [slugAutoSync, setSlugAutoSync] = useState(true);

    // Inertia Form for Create/Edit
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors
    } = useForm({
        name: '',
        slug: '',
        parent_id: '',
        icon: '',
        image: '',
        description: '',
        display_order: 0,
        is_active: true,
        is_featured: false,
        meta_title: '',
        meta_description: '',
    });

    // Helper to generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setData((prev) => ({
            ...prev,
            name: val,
            slug: slugAutoSync ? generateSlug(val) : prev.slug,
        }));
    };

    const handleSlugChange = (e) => {
        setSlugAutoSync(false);
        setData('slug', e.target.value);
    };

    const openCreateModal = (presetParentId = '') => {
        reset();
        clearErrors();
        setSlugAutoSync(true);
        setData({
            name: '',
            slug: '',
            parent_id: presetParentId ? String(presetParentId) : '',
            icon: '',
            image: '',
            description: '',
            display_order: 0,
            is_active: true,
            is_featured: false,
            meta_title: '',
            meta_description: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (category) => {
        reset();
        clearErrors();
        setSlugAutoSync(false);
        setEditingCategory(category);
        setData({
            name: category.name || '',
            slug: category.slug || '',
            parent_id: category.parent_id ? String(category.parent_id) : '',
            icon: category.icon || '',
            image: category.image || '',
            description: category.description || '',
            display_order: category.display_order ?? 0,
            is_active: Boolean(category.is_active),
            is_featured: Boolean(category.is_featured),
            meta_title: category.meta_title || '',
            meta_description: category.meta_description || '',
        });
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editingCategory) return;
        put(route('admin.categories.update', editingCategory.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingCategory(null);
                reset();
            },
        });
    };

    const submitDelete = () => {
        if (!deletingCategory) return;
        router.delete(route('admin.categories.destroy', deletingCategory.id), {
            onSuccess: () => setDeletingCategory(null),
        });
    };

    const toggleActive = (category) => {
        router.patch(route('admin.categories.toggle-active', category.id), {}, { preserveScroll: true });
    };

    const toggleFeatured = (category) => {
        router.patch(route('admin.categories.toggle-featured', category.id), {}, { preserveScroll: true });
    };

    const toggleRootExpand = (id) => {
        setExpandedRoots((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const expandAll = () => {
        const next = {};
        categories.forEach((c) => {
            next[c.id] = true;
        });
        setExpandedRoots(next);
    };

    const collapseAll = () => {
        setExpandedRoots({});
    };

    // Client-side filtering
    const filteredCategories = useMemo(() => {
        return categories.filter((cat) => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matches =
                    cat.name.toLowerCase().includes(q) ||
                    cat.slug.toLowerCase().includes(q) ||
                    (cat.description && cat.description.toLowerCase().includes(q));
                if (!matches) return false;
            }

            if (statusFilter === 'active' && !cat.is_active) return false;
            if (statusFilter === 'inactive' && cat.is_active) return false;

            if (parentFilter === 'root' && cat.parent_id !== null) return false;
            if (parentFilter === 'sub' && cat.parent_id === null) return false;
            if (parentFilter !== 'all' && parentFilter !== 'root' && parentFilter !== 'sub') {
                if (String(cat.parent_id) !== String(parentFilter)) return false;
            }

            return true;
        });
    }, [categories, searchQuery, statusFilter, parentFilter]);

    // Group into Root categories and subcategories map for tree view
    const { rootCategories, subcategoriesMap } = useMemo(() => {
        const roots = [];
        const subMap = {};

        categories.forEach((cat) => {
            if (cat.parent_id === null) {
                roots.push(cat);
            } else {
                if (!subMap[cat.parent_id]) {
                    subMap[cat.parent_id] = [];
                }
                subMap[cat.parent_id].push(cat);
            }
        });

        return { rootCategories: roots, subcategoriesMap: subMap };
    }, [categories]);

    // Prepare options for Parent Category dropdown in forms
    const parentSelectOptions = useMemo(() => {
        const opts = [{ value: '', label: 'None (Top-Level Root Category)' }];
        parentOptions.forEach((p) => {
            if (editingCategory && p.id === editingCategory.id) return;
            opts.push({ value: String(p.id), label: p.label || p.name });
        });
        return opts;
    }, [parentOptions, editingCategory]);

    // Columns configuration for Table View
    const tableColumns = [
        {
            key: 'name',
            label: 'Category Name',
            render: (_, row) => (
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-slate-800 border-2 border-orange-200 dark:border-slate-700 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shrink-0 shadow-xs">
                        {row.parent_id ? <CornerDownRight className="w-5 h-5 text-slate-500" /> : <FolderTree className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`font-black ${row.parent_id ? 'text-slate-900 dark:text-slate-100 text-sm' : 'text-slate-950 dark:text-white text-base'}`}>
                                {row.name}
                            </span>
                            {row.is_featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                    <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" /> Featured
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">/{row.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'parent',
            label: 'Hierarchy Level',
            render: (_, row) => (
                <div>
                    {row.parent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700">
                            <CornerDownRight className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            {row.parent.name}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200 border-2 border-orange-300 dark:border-orange-700">
                            <Layers className="w-4 h-4" /> Root Level
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'children_count',
            label: 'Subcategories',
            sortable: true,
            render: (count) => (
                <Badge variant={count > 0 ? 'orange' : 'neutral'} size="md">
                    {count} {count === 1 ? 'Subcategory' : 'Subcategories'}
                </Badge>
            ),
        },
        {
            key: 'display_order',
            label: 'Order',
            sortable: true,
            render: (order) => (
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                    #{order}
                </span>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (isActive, row) => (
                <button
                    type="button"
                    onClick={() => toggleActive(row)}
                    title="Click to toggle status"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition border-2 ${
                        isActive
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700 hover:bg-rose-200'
                    }`}
                >
                    {isActive ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> Active
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4 text-rose-700 dark:text-rose-400" /> Inactive
                        </>
                    )}
                </button>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'text-right',
            cellClassName: 'text-right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    {!row.parent_id && (
                        <button
                            type="button"
                            onClick={() => openCreateModal(row.id)}
                            title="Add subcategory inside this parent"
                            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 border border-transparent hover:border-orange-300 transition cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit category"
                        className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-transparent hover:border-indigo-300 transition cursor-pointer"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeletingCategory(row)}
                        title="Delete category"
                        className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 border border-transparent hover:border-rose-300 transition cursor-pointer"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Categories Taxonomy">
            <div className="space-y-7">
                {/* Header Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white dark:bg-slate-900 p-7 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700">
                                <FolderTree className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                                Category Hierarchy & Taxonomy Tree
                            </h1>
                            <span className="px-3 py-1 text-xs font-black rounded-full bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200 border-2 border-orange-300 dark:border-orange-700">
                                Phase 4
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 pl-12 max-w-2xl">
                            Configure self-referencing parent categories, nested subcategories, display sequencing, and catalog taxonomy.
                        </p>
                    </div>

                    <div className="flex items-center gap-3.5 self-start md:self-auto">
                        {/* View Switcher */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-xs">
                            <button
                                type="button"
                                onClick={() => setViewMode('tree')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                                    viewMode === 'tree'
                                        ? 'bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-950 shadow-sm'
                                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                                }`}
                            >
                                <FolderTree className="w-4 h-4" /> Tree View
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-950 shadow-sm'
                                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                                }`}
                            >
                                <List className="w-4 h-4" /> Table View
                            </button>
                        </div>

                        {/* Add Category CTA */}
                        <Button
                            variant="primary"
                            size="md"
                            icon={Plus}
                            onClick={() => openCreateModal()}
                            className="shadow-md"
                        >
                            Add Category
                        </Button>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4.5">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                            <span className="text-xs font-black uppercase tracking-wider">Total Categories</span>
                            <FolderTree className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-3xl font-black text-slate-950 dark:text-white">
                            {stats.total ?? categories.length}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                            <span className="text-xs font-black uppercase tracking-wider">Root Level</span>
                            <Layers className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                        </div>
                        <div className="text-3xl font-black text-indigo-700 dark:text-indigo-400">
                            {stats.root_count ?? rootCategories.length}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                            <span className="text-xs font-black uppercase tracking-wider">Subcategories</span>
                            <CornerDownRight className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
                        </div>
                        <div className="text-3xl font-black text-cyan-700 dark:text-cyan-400">
                            {stats.sub_count ?? (categories.length - rootCategories.length)}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                            <span className="text-xs font-black uppercase tracking-wider">Active Status</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                            {stats.active_count ?? 0}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                            <span className="text-xs font-black uppercase tracking-wider">Featured Items</span>
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </div>
                        <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                            {stats.featured_count ?? 0}
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, slug..."
                                className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 transition"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-44 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 transition"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>

                        {/* Parent Filter */}
                        <select
                            value={parentFilter}
                            onChange={(e) => setParentFilter(e.target.value)}
                            className="w-full sm:w-56 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 transition"
                        >
                            <option value="all">All Levels</option>
                            <option value="root">Root Categories Only</option>
                            <option value="sub">Subcategories Only</option>
                            {rootCategories.map((r) => (
                                <option key={r.id} value={r.id}>
                                    Inside: {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tree Expand/Collapse Controls (if Tree view) */}
                    {viewMode === 'tree' && (
                        <div className="flex items-center gap-2 self-end md:self-auto text-xs">
                            <button
                                type="button"
                                onClick={expandAll}
                                className="px-4 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold"
                            >
                                Expand All
                            </button>
                            <button
                                type="button"
                                onClick={collapseAll}
                                className="px-4 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold"
                            >
                                Collapse All
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                {viewMode === 'table' ? (
                    <DataTable
                        columns={tableColumns}
                        data={filteredCategories}
                        searchable={false}
                        emptyMessage="No categories match your filter criteria."
                    />
                ) : (
                    /* Tree View Mode */
                    <div className="space-y-4">
                        {rootCategories.length > 0 ? (
                            rootCategories
                                .filter((root) => {
                                    if (parentFilter === 'sub') return false;
                                    if (parentFilter !== 'all' && parentFilter !== 'root' && String(parentFilter) !== String(root.id)) return false;
                                    if (statusFilter === 'active' && !root.is_active) return false;
                                    if (statusFilter === 'inactive' && root.is_active) return false;
                                    return true;
                                })
                                .map((root) => {
                                    const children = subcategoriesMap[root.id] || [];
                                    const isExpanded = Boolean(expandedRoots[root.id]);

                                    return (
                                        <div
                                            key={root.id}
                                            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition duration-150"
                                        >
                                            {/* Root Category Row */}
                                            <div className="p-5 bg-slate-50 dark:bg-slate-900/90 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    {/* Expand Toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRootExpand(root.id)}
                                                        className="p-2 rounded-xl text-slate-500 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5" />
                                                        )}
                                                    </button>

                                                    {/* Category Icon / Badge */}
                                                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700 flex items-center justify-center font-bold shrink-0 shadow-xs">
                                                        <FolderTree className="w-6 h-6" />
                                                    </div>

                                                    {/* Category Info */}
                                                    <div>
                                                        <div className="flex items-center gap-2.5 flex-wrap">
                                                            <span className="font-black text-slate-950 dark:text-white text-lg">
                                                                {root.name}
                                                            </span>
                                                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                                /{root.slug}
                                                            </span>
                                                            {root.is_featured && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                                                    <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" /> Featured
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                                                            {root.description || 'No description provided.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Meta & Quick Actions */}
                                                <div className="flex items-center gap-3.5 pl-11 sm:pl-0 self-end sm:self-auto">
                                                    {/* Order Badge */}
                                                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700">
                                                        Order #{root.display_order}
                                                    </span>

                                                    {/* Subcategories count */}
                                                    <Badge variant={children.length > 0 ? 'orange' : 'neutral'} size="md">
                                                        {children.length} {children.length === 1 ? 'Subcategory' : 'Subcategories'}
                                                    </Badge>

                                                    {/* Active toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleActive(root)}
                                                        title="Click to toggle status"
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition border-2 ${
                                                            root.is_active
                                                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700 hover:bg-emerald-200'
                                                                : 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700 hover:bg-rose-200'
                                                        }`}
                                                    >
                                                        {root.is_active ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-4 h-4 text-rose-700 dark:text-rose-400" /> Inactive
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* Featured star toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleFeatured(root)}
                                                        title={root.is_featured ? 'Remove from featured' : 'Mark as featured'}
                                                        className={`p-2 rounded-xl border-2 transition cursor-pointer ${
                                                            root.is_featured
                                                                ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:border-amber-700'
                                                                : 'text-slate-400 hover:text-amber-500 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        <Star className={`w-4 h-4 ${root.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                                                    </button>

                                                    {/* Quick Actions Buttons */}
                                                    <div className="flex items-center gap-1.5 border-l-2 border-slate-300 dark:border-slate-700 pl-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => openCreateModal(root.id)}
                                                            title="Add nested subcategory"
                                                            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 border border-transparent hover:border-orange-300 transition cursor-pointer"
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(root)}
                                                            title="Edit category"
                                                            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-transparent hover:border-indigo-300 transition cursor-pointer"
                                                        >
                                                            <Edit3 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingCategory(root)}
                                                            title="Delete category"
                                                            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 border border-transparent hover:border-rose-300 transition cursor-pointer"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subcategories Nested List */}
                                            {isExpanded && (
                                                <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-900">
                                                    {children.length > 0 ? (
                                                        children.map((sub) => (
                                                            <div
                                                                key={sub.id}
                                                                className="ml-5 sm:ml-10 pl-4 sm:pl-5 py-3.5 pr-4 rounded-2xl border-l-4 border-orange-500 dark:border-orange-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50/40 dark:hover:bg-slate-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-y border-r border-slate-200 dark:border-slate-700"
                                                            >
                                                                <div className="flex items-center gap-3.5">
                                                                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-slate-700 flex items-center justify-center text-orange-700 dark:text-orange-300 shrink-0">
                                                                        <CornerDownRight className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2.5">
                                                                            <span className="font-bold text-slate-950 dark:text-white text-base">
                                                                                {sub.name}
                                                                            </span>
                                                                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                                                                /{sub.slug}
                                                                            </span>
                                                                            {sub.is_featured && (
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                                                                    <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" /> Featured
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {sub.description && (
                                                                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                                                {sub.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Subcategory actions */}
                                                                <div className="flex items-center gap-3 pl-12 sm:pl-0 self-end sm:self-auto">
                                                                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                                                                        #{sub.display_order}
                                                                    </span>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleActive(sub)}
                                                                        className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition border ${
                                                                            sub.is_active
                                                                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
                                                                                : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700'
                                                                        }`}
                                                                    >
                                                                        {sub.is_active ? 'Active' : 'Inactive'}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleFeatured(sub)}
                                                                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                                                            sub.is_featured
                                                                                ? 'text-amber-500 bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-800'
                                                                                : 'text-slate-400 hover:text-amber-500 border-slate-300 dark:border-slate-700'
                                                                        }`}
                                                                    >
                                                                        <Star className={`w-4 h-4 ${sub.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEditModal(sub)}
                                                                        className="p-1.5 rounded-lg text-slate-700 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300 transition cursor-pointer"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setDeletingCategory(sub)}
                                                                        className="p-1.5 rounded-lg text-slate-700 hover:text-rose-700 dark:text-slate-300 dark:hover:text-rose-300 transition cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="py-6 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                            No subcategories nested under {root.name} yet.{' '}
                                                            <button
                                                                type="button"
                                                                onClick={() => openCreateModal(root.id)}
                                                                className="text-orange-600 dark:text-orange-400 font-extrabold hover:underline cursor-pointer inline-flex items-center gap-1 ml-1.5"
                                                            >
                                                                <Plus className="w-4 h-4" /> Add first subcategory
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="p-16 text-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                                <FolderTree className="w-14 h-14 text-slate-400 dark:text-slate-600 mx-auto" />
                                <h3 className="text-lg font-black text-slate-950 dark:text-slate-100">No categories found</h3>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                    No categories currently match your search and filter criteria. Try resetting filters or create a new category.
                                </p>
                                <Button variant="primary" size="md" icon={Plus} onClick={() => openCreateModal()}>
                                    Create First Category
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Category Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Category"
                description="Define category identity, hierarchy nesting, and display parameters."
                maxWidth="xl"
            >
                <form onSubmit={submitCreate} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                        <FormInput
                            id="create_name"
                            label="Category Name"
                            value={data.name}
                            onChange={handleNameChange}
                            placeholder="e.g. Men's Formal Shirts"
                            required
                            error={errors.name}
                        />

                        <FormInput
                            id="create_slug"
                            label="URL Slug"
                            value={data.slug}
                            onChange={handleSlugChange}
                            placeholder="e.g. mens-formal-shirts"
                            required
                            error={errors.slug}
                            helpText="Auto-generated from name. Used in URLs."
                        />
                    </div>

                    <FormSelect
                        id="create_parent_id"
                        label="Parent Category (Hierarchy Level)"
                        value={data.parent_id}
                        onChange={(e) => setData('parent_id', e.target.value)}
                        options={parentSelectOptions}
                        error={errors.parent_id}
                        helpText="Select parent to create a subcategory, or leave as Root level."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                        <FormInput
                            id="create_display_order"
                            label="Display Sequence Order"
                            type="number"
                            value={data.display_order}
                            onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            error={errors.display_order}
                            helpText="Lower numbers appear first in storefront menus."
                        />

                        <FormInput
                            id="create_icon"
                            label="Icon Identifier"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                            placeholder="e.g. Shirt, Watch, Sparkles"
                            error={errors.icon}
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
                            Category Description
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description for SEO, catalog intros and navigation cards..."
                            className="block w-full py-3 px-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 transition"
                        />
                        {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
                    </div>

                    {/* Status Toggles */}
                    <div className="p-4.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex flex-wrap gap-7">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-5 h-5 text-orange-600 rounded border-2 border-slate-300 focus:ring-orange-500 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-black text-slate-950 dark:text-white block">Active Status</span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Visible to customers in storefront</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) => setData('is_featured', e.target.checked)}
                                className="w-5 h-5 text-amber-500 rounded border-2 border-slate-300 focus:ring-amber-500 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-black text-slate-950 dark:text-white block">Featured Category</span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Highlight in homepage sliders & cards</span>
                            </div>
                        </label>
                    </div>

                    {/* SEO Meta Section */}
                    <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            SEO Search Engine Metadata (Optional)
                        </h4>
                        <FormInput
                            id="create_meta_title"
                            label="Meta Page Title"
                            value={data.meta_title}
                            onChange={(e) => setData('meta_title', e.target.value)}
                            placeholder="e.g. Premium Men's Formal Shirts Online | ORIO"
                            error={errors.meta_title}
                        />
                        <FormInput
                            id="create_meta_desc"
                            label="Meta Description"
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                            placeholder="e.g. Shop the latest men's formal shirts crafted with Egyptian cotton..."
                            error={errors.meta_description}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t-2 border-slate-200 dark:border-slate-800">
                        <Button variant="secondary" size="md" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="md" type="submit" processing={processing}>
                            Save Category
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Category Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingCategory(null);
                }}
                title={`Edit Category: ${editingCategory?.name || ''}`}
                description="Update taxonomy details, parent relationship, and SEO tags."
                maxWidth="xl"
            >
                <form onSubmit={submitEdit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                        <FormInput
                            id="edit_name"
                            label="Category Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            error={errors.name}
                        />

                        <FormInput
                            id="edit_slug"
                            label="URL Slug"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            required
                            error={errors.slug}
                            helpText="Unique URL identifier."
                        />
                    </div>

                    <FormSelect
                        id="edit_parent_id"
                        label="Parent Category (Hierarchy Level)"
                        value={data.parent_id}
                        onChange={(e) => setData('parent_id', e.target.value)}
                        options={parentSelectOptions}
                        error={errors.parent_id}
                        helpText="Cannot select this category or its subcategories as its parent."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                        <FormInput
                            id="edit_display_order"
                            label="Display Sequence Order"
                            type="number"
                            value={data.display_order}
                            onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                            error={errors.display_order}
                        />

                        <FormInput
                            id="edit_icon"
                            label="Icon Identifier"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                            placeholder="e.g. Shirt, Watch, Sparkles"
                            error={errors.icon}
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
                            Category Description
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="block w-full py-3 px-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 transition"
                        />
                        {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
                    </div>

                    {/* Status Toggles */}
                    <div className="p-4.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex flex-wrap gap-7">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-5 h-5 text-orange-600 rounded border-2 border-slate-300 focus:ring-orange-500 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-black text-slate-950 dark:text-white block">Active Status</span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Visible to customers in storefront</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) => setData('is_featured', e.target.checked)}
                                className="w-5 h-5 text-amber-500 rounded border-2 border-slate-300 focus:ring-amber-500 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-black text-slate-950 dark:text-white block">Featured Category</span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Highlight in homepage sliders & cards</span>
                            </div>
                        </label>
                    </div>

                    {/* SEO Meta Section */}
                    <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            SEO Search Engine Metadata (Optional)
                        </h4>
                        <FormInput
                            id="edit_meta_title"
                            label="Meta Page Title"
                            value={data.meta_title}
                            onChange={(e) => setData('meta_title', e.target.value)}
                            error={errors.meta_title}
                        />
                        <FormInput
                            id="edit_meta_desc"
                            label="Meta Description"
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                            error={errors.meta_description}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t-2 border-slate-200 dark:border-slate-800">
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setEditingCategory(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" size="md" type="submit" processing={processing}>
                            Update Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deletingCategory)}
                onClose={() => setDeletingCategory(null)}
                onConfirm={submitDelete}
                title={`Delete '${deletingCategory?.name}'?`}
                message={`Are you sure you want to delete this category? Any direct subcategories nested under it will automatically be preserved and shifted to top-level.`}
                confirmText="Delete Category"
                variant="danger"
            />
        </AdminLayout>
    );
}
