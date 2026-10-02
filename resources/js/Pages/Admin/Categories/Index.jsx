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
    ChevronDown,
    ChevronRight,
    List,
    Image as ImageIcon,
    UploadCloud,
    X,
    Check
} from 'lucide-react';

export default function CategoryIndex({ categories = [], parentOptions = [], stats = {}, filters = {} }) {
    const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'table'
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [parentFilter, setParentFilter] = useState(filters.parent || 'all');
    const [expandedRoots, setExpandedRoots] = useState(() => {
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

    // Multi-Image state
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [featuredImageId, setFeaturedImageId] = useState(null);
    const [featuredNewIndex, setFeaturedNewIndex] = useState(0);
    const [deletedImageIds, setDeletedImageIds] = useState([]);

    // Inertia Form for Create/Edit
    const {
        data,
        setData,
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

    // Open Create Modal
    const openCreateModal = (presetParentId = '') => {
        reset();
        clearErrors();
        setSlugAutoSync(true);
        setNewImages([]);
        setNewImagePreviews([]);
        setExistingImages([]);
        setFeaturedImageId(null);
        setFeaturedNewIndex(0);
        setDeletedImageIds([]);

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

    // Open Edit Modal
    const openEditModal = (category) => {
        reset();
        clearErrors();
        setSlugAutoSync(false);
        setEditingCategory(category);

        const imgs = category.images || [];
        setExistingImages(imgs);
        const feat = imgs.find(i => i.is_featured) || imgs[0] || null;
        setFeaturedImageId(feat ? feat.id : null);
        setFeaturedNewIndex(null);
        setNewImages([]);
        setNewImagePreviews([]);
        setDeletedImageIds([]);

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

    // Image Upload Handlers (Max 3 total per category)
    const handleFileSelection = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        const currentTotal = existingImages.length + newImages.length;
        const availableSlots = Math.max(0, 3 - currentTotal);
        const filesToAdd = selectedFiles.slice(0, availableSlots);

        if (filesToAdd.length === 0) return;

        const updatedFiles = [...newImages, ...filesToAdd];
        setNewImages(updatedFiles);

        const newPreviews = filesToAdd.map((file) => ({
            url: URL.createObjectURL(file),
            name: file.name,
        }));
        const updatedPreviews = [...newImagePreviews, ...newPreviews];
        setNewImagePreviews(updatedPreviews);

        // If no existing image was featured, ensure a new image is featured
        if (featuredImageId === null && (featuredNewIndex === null || featuredNewIndex >= updatedFiles.length)) {
            setFeaturedNewIndex(0);
        }
    };

    const handleRemoveNewImage = (indexToRemove) => {
        const updatedFiles = [...newImages];
        updatedFiles.splice(indexToRemove, 1);
        setNewImages(updatedFiles);

        const updatedPreviews = [...newImagePreviews];
        updatedPreviews.splice(indexToRemove, 1);
        setNewImagePreviews(updatedPreviews);

        if (featuredNewIndex === indexToRemove) {
            if (existingImages.length > 0) {
                setFeaturedImageId(existingImages[0].id);
                setFeaturedNewIndex(null);
            } else if (updatedFiles.length > 0) {
                setFeaturedNewIndex(0);
            } else {
                setFeaturedNewIndex(null);
            }
        } else if (featuredNewIndex > indexToRemove) {
            setFeaturedNewIndex(featuredNewIndex - 1);
        }
    };

    const handleDeleteExistingImage = (imageId) => {
        setDeletedImageIds((prev) => [...prev, imageId]);
        const remaining = existingImages.filter((img) => img.id !== imageId);
        setExistingImages(remaining);

        if (featuredImageId === imageId) {
            if (remaining.length > 0) {
                setFeaturedImageId(remaining[0].id);
                setFeaturedNewIndex(null);
            } else if (newImages.length > 0) {
                setFeaturedImageId(null);
                setFeaturedNewIndex(0);
            } else {
                setFeaturedImageId(null);
                setFeaturedNewIndex(null);
            }
        }
    };

    const handleSetFeaturedExisting = (imageId) => {
        setFeaturedImageId(imageId);
        setFeaturedNewIndex(null);
    };

    const handleSetFeaturedNew = (index) => {
        setFeaturedNewIndex(index);
        setFeaturedImageId(null);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        
        const payload = {
            ...data,
            images: newImages,
            featured_image_index: featuredNewIndex !== null ? featuredNewIndex : 0,
        };

        router.post(route('admin.categories.store'), payload, {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setNewImages([]);
                setNewImagePreviews([]);
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editingCategory) return;

        const payload = {
            _method: 'put',
            ...data,
            images: newImages,
            featured_image_index: featuredNewIndex,
            featured_image_id: featuredImageId,
            deleted_image_ids: deletedImageIds,
        };

        router.post(route('admin.categories.update', editingCategory.id), payload, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingCategory(null);
                reset();
                setNewImages([]);
                setNewImagePreviews([]);
                setDeletedImageIds([]);
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
            label: 'Category Name & Media',
            render: (_, row) => {
                const primaryImg = row.featured_image?.image_url || row.images?.[0]?.image_url || row.images?.[0]?.image_path;
                const imgCount = row.images?.length || 0;

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FDFBF5] dark:bg-[#071324] border border-[#F5E7C2] dark:border-[#D4AF37]/40 flex items-center justify-center text-[#926F18] dark:text-[#EBD495] font-bold shrink-0 shadow-2xs overflow-hidden">
                            {primaryImg ? (
                                <img src={primaryImg} alt={row.name} className="w-full h-full object-cover" />
                            ) : row.parent_id ? (
                                <CornerDownRight className="w-4 h-4 text-slate-400 dark:text-[#5E8CB6]" />
                            ) : (
                                <FolderTree className="w-4.5 h-4.5 text-[#D4AF37]" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${row.parent_id ? 'text-[#0E2038] dark:text-slate-200 text-xs sm:text-sm font-semibold' : 'text-[#0E2038] dark:text-white text-sm sm:text-base font-extrabold'}`}>
                                    {row.name}
                                </span>
                                {row.is_featured && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/50">
                                        <Star className="w-2.5 h-2.5 mr-1 fill-[#D4AF37] text-[#D4AF37]" /> Featured
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs font-mono text-slate-400 dark:text-[#5E8CB6]">/{row.slug}</p>
                                {imgCount > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#071324] text-slate-500 dark:text-[#8EB0CF] font-medium border border-slate-200 dark:border-[#1C3E63]">
                                        {imgCount} {imgCount === 1 ? 'image' : 'images'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'parent',
            label: 'Hierarchy Level',
            render: (_, row) => (
                <div>
                    {row.parent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F0F4F9] dark:bg-[#071324] text-[#0E2038] dark:text-[#BACDE3] border border-[#BACDE3] dark:border-[#1C3E63]">
                            <CornerDownRight className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#EBD495]" />
                            {row.parent.name}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/50">
                            <Layers className="w-3.5 h-3.5" /> Root Level
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
                <Badge variant={count > 0 ? 'gold' : 'neutral'} size="md">
                    {count} {count === 1 ? 'Subcategory' : 'Subcategories'}
                </Badge>
            ),
        },
        {
            key: 'display_order',
            label: 'Order',
            sortable: true,
            render: (order) => (
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#071324] text-slate-600 dark:text-[#BACDE3] border border-slate-200 dark:border-[#1C3E63]">
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
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition border ${
                        isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 hover:bg-rose-100'
                    }`}
                >
                    {isActive ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Active
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Inactive
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
                <div className="flex items-center justify-end gap-1.5">
                    {!row.parent_id && (
                        <button
                            type="button"
                            onClick={() => openCreateModal(row.id)}
                            title="Add subcategory inside this parent"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-[#8EB0CF] hover:text-[#926F18] dark:hover:text-[#EBD495] hover:bg-[#FDFBF5] dark:hover:bg-[#071324] transition cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        title="Edit category"
                        className="p-1.5 rounded-lg text-slate-500 dark:text-[#8EB0CF] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#071324] transition cursor-pointer"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeletingCategory(row)}
                        title="Delete category"
                        className="p-1.5 rounded-lg text-slate-500 dark:text-[#8EB0CF] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#071324] transition cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Categories Taxonomy">
            <div className="space-y-4 sm:space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E2038] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/50 shrink-0">
                                <FolderTree className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2038] dark:text-white tracking-tight">
                                Category Hierarchy & Taxonomy Tree
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8EB0CF] pl-0 sm:pl-10 max-w-2xl font-normal">
                            Configure parent categories, subcategories, up to 3 gallery images, and catalog taxonomy.
                        </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto justify-between sm:justify-end">
                        {/* View Switcher */}
                        <div className="flex items-center bg-slate-100 dark:bg-[#071324] p-1 rounded-xl border border-slate-200 dark:border-[#1C3E63] text-xs">
                            <button
                                type="button"
                                onClick={() => setViewMode('tree')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                                    viewMode === 'tree'
                                        ? 'bg-white dark:bg-[#0E2038] text-[#926F18] dark:text-[#EBD495] shadow-2xs border border-[#F5E7C2] dark:border-[#D4AF37]/40'
                                        : 'text-slate-600 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white'
                                }`}
                            >
                                <FolderTree className="w-3.5 h-3.5" /> Tree View
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-[#0E2038] text-[#926F18] dark:text-[#EBD495] shadow-2xs border border-[#F5E7C2] dark:border-[#D4AF37]/40'
                                        : 'text-slate-600 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white'
                                }`}
                            >
                                <List className="w-3.5 h-3.5" /> Table View
                            </button>
                        </div>

                        {/* Add Category CTA */}
                        <Button
                            variant="primary"
                            size="md"
                            icon={Plus}
                            onClick={() => openCreateModal()}
                            className="shadow-xs font-bold w-full sm:w-auto justify-center shrink-0"
                        >
                            Add Category
                        </Button>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-3.5 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-[#8EB0CF] mb-1.5">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Total</span>
                            <FolderTree className="w-4 h-4 text-[#D4AF37] dark:text-[#EBD495]" />
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0E2038] dark:text-white">
                            {stats.total ?? categories.length}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-3.5 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-[#8EB0CF] mb-1.5">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Roots</span>
                            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                            {stats.root_count ?? rootCategories.length}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-3.5 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-[#8EB0CF] mb-1.5">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Subcategories</span>
                            <CornerDownRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
                            {stats.sub_count ?? (categories.length - rootCategories.length)}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-3.5 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-[#8EB0CF] mb-1.5">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Active</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {stats.active_count ?? 0}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-3.5 sm:p-5 shadow-xs col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between text-slate-500 dark:text-[#8EB0CF] mb-1.5">
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Featured</span>
                            <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#926F18] dark:text-[#EBD495]">
                            {stats.featured_count ?? 0}
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto flex-1 max-w-3xl">
                        {/* Search Input */}
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#5E8CB6]">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, slug..."
                                className="block w-full pl-9 pr-3.5 py-2 bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-xs sm:text-sm text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition font-medium"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full py-2 px-3 bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-xs sm:text-sm font-medium text-[#0E2038] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>

                        {/* Parent Filter */}
                        <select
                            value={parentFilter}
                            onChange={(e) => setParentFilter(e.target.value)}
                            className="w-full py-2 px-3 bg-[#F4F7FB] dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-xs sm:text-sm font-medium text-[#0E2038] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition cursor-pointer"
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
                        <div className="flex items-center gap-2 justify-end text-xs shrink-0">
                            <button
                                type="button"
                                onClick={expandAll}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1C3E63] text-slate-600 dark:text-[#BACDE3] hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#071324] transition cursor-pointer font-semibold"
                            >
                                Expand All
                            </button>
                            <button
                                type="button"
                                onClick={collapseAll}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1C3E63] text-slate-600 dark:text-[#BACDE3] hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#071324] transition cursor-pointer font-semibold"
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
                    <div className="space-y-3">
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
                                    const rootImg = root.featured_image?.image_url || root.images?.[0]?.image_url || root.images?.[0]?.image_path;

                                    return (
                                        <div
                                            key={root.id}
                                            className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl overflow-hidden shadow-xs transition duration-150"
                                        >
                                            {/* Root Category Row */}
                                            <div className="p-3 sm:p-4 bg-[#F4F7FB]/70 dark:bg-[#0E2038] border-b border-slate-200/80 dark:border-[#1C3E63]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-3.5">
                                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                                    {/* Expand Toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRootExpand(root.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#071324] transition cursor-pointer shrink-0"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4.5 h-4.5 text-[#D4AF37] dark:text-[#EBD495]" />
                                                        ) : (
                                                            <ChevronRight className="w-4.5 h-4.5" />
                                                        )}
                                                    </button>

                                                    {/* Category Icon / Image Avatar */}
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/50 flex items-center justify-center font-bold shrink-0 shadow-2xs overflow-hidden">
                                                        {rootImg ? (
                                                            <img src={rootImg} alt={root.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FolderTree className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#D4AF37]" />
                                                        )}
                                                    </div>

                                                    {/* Category Info */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                            <span className="font-extrabold text-[#0E2038] dark:text-white text-xs sm:text-base break-words">
                                                                {root.name}
                                                            </span>
                                                            <span className="font-mono text-[10px] sm:text-xs text-slate-400 dark:text-[#5E8CB6] truncate">
                                                                /{root.slug}
                                                            </span>
                                                            {root.is_featured && (
                                                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/50">
                                                                    <Star className="w-2.5 h-2.5 mr-0.5 sm:mr-1 fill-[#D4AF37] text-[#D4AF37]" /> Featured
                                                                </span>
                                                            )}
                                                            {root.images && root.images.length > 0 && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-medium bg-slate-100 dark:bg-[#071324] text-slate-500 dark:text-[#8EB0CF] border border-slate-200 dark:border-[#1C3E63]">
                                                                    <ImageIcon className="w-2.5 h-2.5" /> {root.images.length} {root.images.length === 1 ? 'img' : 'imgs'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8EB0CF] mt-0.5 line-clamp-1 font-normal">
                                                            {root.description || 'No description provided.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Meta & Quick Actions */}
                                                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pl-0 sm:pl-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 dark:border-[#1C3E63]/40">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                        {/* Order Badge */}
                                                        <span className="text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 rounded bg-slate-200/70 dark:bg-[#071324] text-slate-600 dark:text-[#BACDE3] font-medium border border-transparent dark:border-[#1C3E63]">
                                                            #{root.display_order}
                                                        </span>

                                                        {/* Subcategories count */}
                                                        <Badge variant={children.length > 0 ? 'gold' : 'neutral'} size="sm">
                                                            {children.length} {children.length === 1 ? 'Sub' : 'Subs'}
                                                        </Badge>

                                                        {/* Active toggle */}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleActive(root)}
                                                            title="Click to toggle status"
                                                            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold cursor-pointer transition border ${
                                                                root.is_active
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                                                                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 hover:bg-rose-100'
                                                            }`}
                                                        >
                                                            {root.is_active ? (
                                                                <>
                                                                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" /> Active
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 dark:text-rose-400" /> Inactive
                                                                </>
                                                            )}
                                                        </button>

                                                        {/* Featured star toggle */}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleFeatured(root)}
                                                            title={root.is_featured ? 'Remove from featured' : 'Mark as featured'}
                                                            className={`p-1 sm:p-1.5 rounded-lg border transition cursor-pointer ${
                                                                root.is_featured
                                                                    ? 'bg-[#FDFBF5] text-[#926F18] border-[#F5E7C2] dark:bg-[#071324] dark:text-[#EBD495] dark:border-[#D4AF37]/50'
                                                                    : 'text-slate-400 hover:text-[#D4AF37] border-slate-200 dark:border-[#1C3E63] hover:bg-slate-100 dark:hover:bg-[#071324]'
                                                            }`}
                                                        >
                                                            <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${root.is_featured ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                                                        </button>
                                                    </div>

                                                    {/* Quick Actions Buttons */}
                                                    <div className="flex items-center gap-0.5 sm:gap-1 sm:border-l sm:border-slate-200 sm:dark:border-[#1C3E63] sm:pl-2 ml-auto sm:ml-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => openCreateModal(root.id)}
                                                            title="Add nested subcategory"
                                                            className="p-1 sm:p-1.5 rounded-lg text-slate-500 dark:text-[#8EB0CF] hover:text-[#926F18] dark:hover:text-[#EBD495] hover:bg-[#FDFBF5] dark:hover:bg-[#071324] transition cursor-pointer"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(root)}
                                                            title="Edit category"
                                                            className="p-1 sm:p-1.5 rounded-lg text-slate-500 dark:text-[#8EB0CF] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#071324] transition cursor-pointer"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingCategory(root)}
                                                            title="Delete category"
                                                            className="p-1 sm:p-1.5 rounded-lg text-slate-500 dark:text-[#8EB0CF] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#071324] transition cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subcategories Nested List */}
                                            {isExpanded && (
                                                <div className="p-2.5 sm:p-3.5 space-y-2 bg-white dark:bg-[#071324]/60">
                                                    {children.length > 0 ? (
                                                        children.map((sub) => {
                                                            const subImg = sub.featured_image?.image_url || sub.images?.[0]?.image_url || sub.images?.[0]?.image_path;

                                                            return (
                                                                <div
                                                                    key={sub.id}
                                                                    className="ml-1 sm:ml-7 pl-2.5 sm:pl-4 py-2 sm:py-2.5 pr-2.5 sm:pr-3 rounded-xl border-l-2 border-[#D4AF37] bg-[#F4F7FB]/60 dark:bg-[#0E2038]/60 hover:bg-[#FDFBF5]/50 dark:hover:bg-[#142C49]/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-y border-r border-slate-100 dark:border-[#1C3E63]/60"
                                                                >
                                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#FDFBF5] dark:bg-[#071324] flex items-center justify-center text-[#926F18] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/30 shrink-0 overflow-hidden">
                                                                            {subImg ? (
                                                                                <img src={subImg} alt={sub.name} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <CornerDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                                                <span className="font-bold text-[#0E2038] dark:text-white text-xs sm:text-sm break-words">
                                                                                    {sub.name}
                                                                                </span>
                                                                                <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 dark:text-[#5E8CB6] truncate">
                                                                                    /{sub.slug}
                                                                                </span>
                                                                                {sub.is_featured && (
                                                                                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/50">
                                                                                        <Star className="w-2.5 h-2.5 mr-0.5 fill-[#D4AF37] text-[#D4AF37]" /> Featured
                                                                                    </span>
                                                                                )}
                                                                                {sub.images && sub.images.length > 0 && (
                                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-medium bg-slate-100 dark:bg-[#071324] text-slate-500 dark:text-[#8EB0CF] border border-slate-200 dark:border-[#1C3E63]">
                                                                                        <ImageIcon className="w-2.5 h-2.5" /> {sub.images.length} {sub.images.length === 1 ? 'img' : 'imgs'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {sub.description && (
                                                                                <p className="text-[11px] text-slate-500 dark:text-[#8EB0CF] line-clamp-1 font-normal">
                                                                                    {sub.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Subcategory actions */}
                                                                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 pl-0 sm:pl-0 w-full sm:w-auto border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-200/50 dark:border-[#1C3E63]/30">
                                                                        <span className="text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-slate-200/70 dark:bg-[#071324] text-slate-600 dark:text-[#BACDE3] font-medium border border-transparent dark:border-[#1C3E63]">
                                                                            #{sub.display_order}
                                                                        </span>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleActive(sub)}
                                                                            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold cursor-pointer transition border ${
                                                                                sub.is_active
                                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                                                                                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
                                                                            }`}
                                                                        >
                                                                            {sub.is_active ? 'Active' : 'Inactive'}
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleFeatured(sub)}
                                                                            className={`p-1 rounded-md border transition cursor-pointer ${
                                                                                sub.is_featured
                                                                                    ? 'text-[#926F18] bg-[#FDFBF5] border-[#F5E7C2] dark:bg-[#071324] dark:text-[#EBD495] dark:border-[#D4AF37]/50'
                                                                                    : 'text-slate-400 hover:text-[#D4AF37] border-slate-200 dark:border-[#1C3E63]'
                                                                            }`}
                                                                        >
                                                                            <Star className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sub.is_featured ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEditModal(sub)}
                                                                            className="p-1 sm:p-1.5 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-[#071324] transition cursor-pointer"
                                                                        >
                                                                            <Edit3 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setDeletingCategory(sub)}
                                                                            className="p-1 sm:p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-[#071324] transition cursor-pointer"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="py-3.5 text-center text-xs text-slate-400 dark:text-[#8EB0CF]">
                                                            No subcategories nested under {root.name} yet.{' '}
                                                            <button
                                                                type="button"
                                                                onClick={() => openCreateModal(root.id)}
                                                                className="text-[#926F18] dark:text-[#EBD495] font-bold hover:underline cursor-pointer inline-flex items-center gap-1 ml-1"
                                                            >
                                                                <Plus className="w-3 h-3 text-[#D4AF37]" /> Add first subcategory
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="p-12 text-center bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl shadow-xs space-y-3">
                                <FolderTree className="w-12 h-12 text-slate-300 dark:text-[#5E8CB6] mx-auto" />
                                <h3 className="text-base font-bold text-[#0E2038] dark:text-slate-200">No categories found</h3>
                                <p className="text-xs text-slate-500 dark:text-[#8EB0CF] max-w-sm mx-auto">
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
                <form onSubmit={submitCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                            Category Description
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description for SEO, catalog intros and navigation cards..."
                            className="block w-full py-2 sm:py-2.5 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition font-medium"
                        />
                        {errors.description && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.description}</p>}
                    </div>

                    {/* Category Multi-Image Upload (Max 3, with 1 Featured Image) */}
                    <div className="p-4 bg-[#F4F7FB] dark:bg-[#071324]/70 rounded-xl border border-slate-200 dark:border-[#1C3E63] space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">
                                    Category Gallery Images (Max 3)
                                </span>
                                <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                    Upload up to 3 images and select 1 as the primary Featured image.
                                </span>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#071324] text-slate-700 dark:text-[#BACDE3]">
                                {newImages.length}/3 images
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* New image previews */}
                            {newImagePreviews.map((prev, idx) => {
                                const isFeatured = featuredNewIndex === idx;
                                return (
                                    <div key={idx} className="relative group border rounded-xl overflow-hidden bg-white dark:bg-[#071324] border-slate-200 dark:border-[#1C3E63]">
                                        <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-[#071324]/80 flex items-center justify-center">
                                            <img src={prev.url} alt={prev.name} className="w-full h-full object-cover" />
                                        </div>
                                        {/* Featured Selector */}
                                        <button
                                            type="button"
                                            onClick={() => handleSetFeaturedNew(idx)}
                                            className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
                                                isFeatured
                                                    ? 'bg-[#D4AF37] text-white shadow-xs'
                                                    : 'bg-black/60 text-white hover:bg-black/80'
                                            }`}
                                        >
                                            <Star className={`w-3 h-3 ${isFeatured ? 'fill-white text-white' : 'text-slate-300'}`} />
                                            {isFeatured ? 'Featured' : 'Featured'}
                                        </button>
                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 rounded-md bg-rose-600/80 text-white hover:bg-rose-600 transition"
                                            title="Remove image"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}

                            {/* Upload Drop Zone */}
                            {newImages.length < 3 && (
                                <label className="border-2 border-dashed border-slate-300 dark:border-[#1C3E63] rounded-xl aspect-square flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:border-[#D4AF37] dark:hover:border-[#D4AF37] hover:bg-white/80 dark:hover:bg-[#071324]/80 transition group">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                        multiple={3 - newImages.length > 1}
                                        onChange={handleFileSelection}
                                        className="hidden"
                                    />
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#071324] flex items-center justify-center text-slate-400 dark:text-[#5E8CB6] group-hover:text-[#926F18] dark:group-hover:text-[#EBD495] group-hover:bg-[#FDFBF5] mb-1.5 transition">
                                        <UploadCloud className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-[#BACDE3] group-hover:text-[#926F18] dark:group-hover:text-[#EBD495] transition block">
                                        Upload Image
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-[#5E8CB6]">
                                        Max 3MB
                                    </span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="p-4 bg-[#F4F7FB] dark:bg-[#071324]/70 rounded-xl border border-slate-200 dark:border-[#1C3E63] flex flex-wrap gap-6">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-[#D4AF37] rounded border-slate-300 dark:border-[#1C3E63] focus:ring-[#D4AF37] cursor-pointer"
                            />
                            <div>
                                <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">Active Status</span>
                                <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">Visible to customers in storefront</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) => setData('is_featured', e.target.checked)}
                                className="w-4 h-4 text-[#D4AF37] rounded border-slate-300 dark:border-[#1C3E63] focus:ring-[#D4AF37] cursor-pointer"
                            />
                            <div>
                                <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">Featured Category</span>
                                <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">Highlight in homepage sliders & cards</span>
                            </div>
                        </label>
                    </div>

                    {/* SEO Meta Section */}
                    <div className="border-t border-slate-100 dark:border-[#1C3E63]/70 pt-4 space-y-3.5">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6]">
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

                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 dark:border-[#1C3E63]/70">
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
                description="Update taxonomy details, gallery images, parent relationship, and SEO tags."
                maxWidth="xl"
            >
                <form onSubmit={submitEdit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5">
                            Category Description
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="block w-full py-2 sm:py-2.5 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition font-medium"
                        />
                        {errors.description && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.description}</p>}
                    </div>

                    {/* Category Multi-Image Upload (Max 3, with 1 Featured Image) */}
                    <div className="p-4 bg-[#F4F7FB] dark:bg-[#071324]/70 rounded-xl border border-slate-200 dark:border-[#1C3E63] space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">
                                    Category Gallery Images (Max 3)
                                </span>
                                <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                    Upload up to 3 images and select 1 as the primary Featured image.
                                </span>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#071324] text-slate-700 dark:text-[#BACDE3]">
                                {existingImages.length + newImages.length}/3 images
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* Existing Images */}
                            {existingImages.map((img) => {
                                const isFeatured = featuredImageId === img.id;
                                return (
                                    <div key={img.id} className="relative group border rounded-xl overflow-hidden bg-white dark:bg-[#071324] border-slate-200 dark:border-[#1C3E63]">
                                        <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-[#071324]/80 flex items-center justify-center">
                                            <img src={img.image_url || img.image_path} alt="Category" className="w-full h-full object-cover" />
                                        </div>
                                        {/* Featured Selector */}
                                        <button
                                            type="button"
                                            onClick={() => handleSetFeaturedExisting(img.id)}
                                            className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
                                                isFeatured
                                                    ? 'bg-[#D4AF37] text-white shadow-xs'
                                                    : 'bg-black/60 text-white hover:bg-black/80'
                                            }`}
                                        >
                                            <Star className={`w-3 h-3 ${isFeatured ? 'fill-white text-white' : 'text-slate-300'}`} />
                                            {isFeatured ? 'Featured' : 'Featured'}
                                        </button>
                                        {/* Delete Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExistingImage(img.id)}
                                            className="absolute top-2 right-2 p-1.5 rounded-md bg-rose-600/80 text-white hover:bg-rose-600 transition"
                                            title="Delete image"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}

                            {/* New image previews */}
                            {newImagePreviews.map((prev, idx) => {
                                const isFeatured = featuredImageId === null && (featuredNewIndex === idx || (existingImages.length === 0 && idx === 0));
                                return (
                                    <div key={`new-${idx}`} className="relative group border rounded-xl overflow-hidden bg-white dark:bg-[#071324] border-slate-200 dark:border-[#1C3E63]">
                                        <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-[#071324]/80 flex items-center justify-center">
                                            <img src={prev.url} alt={prev.name} className="w-full h-full object-cover" />
                                        </div>
                                        {/* Featured Selector */}
                                        <button
                                            type="button"
                                            onClick={() => handleSetFeaturedNew(idx)}
                                            className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
                                                isFeatured
                                                    ? 'bg-[#D4AF37] text-white shadow-xs'
                                                    : 'bg-black/60 text-white hover:bg-black/80'
                                            }`}
                                        >
                                            <Star className={`w-3 h-3 ${isFeatured ? 'fill-white text-white' : 'text-slate-300'}`} />
                                            {isFeatured ? 'Featured' : 'Featured'}
                                        </button>
                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 rounded-md bg-rose-600/80 text-white hover:bg-rose-600 transition"
                                            title="Remove image"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}

                            {/* Upload Drop Zone */}
                            {existingImages.length + newImages.length < 3 && (
                                <label className="border-2 border-dashed border-slate-300 dark:border-[#1C3E63] rounded-xl aspect-square flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:border-[#D4AF37] dark:hover:border-[#D4AF37] hover:bg-white/80 dark:hover:bg-[#071324]/80 transition group">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                        multiple={3 - (existingImages.length + newImages.length) > 1}
                                        onChange={handleFileSelection}
                                        className="hidden"
                                    />
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#071324] flex items-center justify-center text-slate-400 dark:text-[#5E8CB6] group-hover:text-[#926F18] dark:group-hover:text-[#EBD495] group-hover:bg-[#FDFBF5] mb-1.5 transition">
                                        <UploadCloud className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-[#BACDE3] group-hover:text-[#926F18] dark:group-hover:text-[#EBD495] transition block">
                                        Upload Image
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-[#5E8CB6]">
                                        Max 3MB
                                    </span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="p-4 bg-[#F4F7FB] dark:bg-[#071324]/70 rounded-xl border border-slate-200 dark:border-[#1C3E63] flex flex-wrap gap-6">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-[#D4AF37] rounded border-slate-300 dark:border-[#1C3E63] focus:ring-[#D4AF37] cursor-pointer"
                            />
                            <div>
                                <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">Active Status</span>
                                <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">Visible to customers in storefront</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) => setData('is_featured', e.target.checked)}
                                className="w-4 h-4 text-[#D4AF37] rounded border-slate-300 dark:border-[#1C3E63] focus:ring-[#D4AF37] cursor-pointer"
                            />
                            <div>
                                <span className="text-xs sm:text-sm font-bold text-[#0E2038] dark:text-white block">Featured Category</span>
                                <span className="text-xs text-slate-500 dark:text-[#8EB0CF]">Highlight in homepage sliders & cards</span>
                            </div>
                        </label>
                    </div>

                    {/* SEO Meta Section */}
                    <div className="border-t border-slate-100 dark:border-[#1C3E63]/70 pt-4 space-y-3.5">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6]">
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

                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 dark:border-[#1C3E63]/70">
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
