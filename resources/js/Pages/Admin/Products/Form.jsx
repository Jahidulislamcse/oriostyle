import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import {
    Package,
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    DollarSign,
    Layers,
    Award,
    Tag,
    Globe,
    Sliders,
    Sparkles,
    Check,
    AlertCircle
} from 'lucide-react';

export default function ProductForm({ product = null, categories = [], brands = [] }) {
    const isEditing = Boolean(product && product.id);
    const [activeTab, setActiveTab] = useState('general');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [slugAutoSync, setSlugAutoSync] = useState(!isEditing);

    // Initial variants
    const initialVariants = product?.variants?.length
        ? product.variants.map((v) => ({
              id: v.id,
              size: v.size || '',
              color: v.color || '',
              price_adjustment: v.price_adjustment ?? 0,
              stock_quantity: v.stock_quantity ?? 0,
          }))
        : [];

    const { data, setData, post, processing, errors } = useForm({
        name: product?.name || '',
        slug: product?.slug || '',
        sku: product?.sku || '',
        category_id: product?.category_id ? String(product.category_id) : '',
        brand_id: product?.brand_id ? String(product.brand_id) : '',
        short_description: product?.short_description || '',
        description: product?.description || '',
        base_price: product?.base_price ?? '',
        sale_price: product?.sale_price ?? '',
        cost_price: product?.cost_price ?? '',
        stock_quantity: product?.stock_quantity ?? 0,
        low_stock_threshold: product?.low_stock_threshold ?? 5,
        is_active: product ? Boolean(product.is_active) : true,
        is_featured: product ? Boolean(product.is_featured) : false,
        is_new_arrival: product ? Boolean(product.is_new_arrival) : true,
        meta_title: product?.meta_title || '',
        meta_description: product?.meta_description || '',
        images: [],
        variants: initialVariants,
    });

    const generateSlug = (nameStr) => {
        return nameStr
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const generateSKU = (nameStr) => {
        const prefix = nameStr
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 4)
            .toUpperCase() || 'ORIO';
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${randomNum}`;
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setData((prev) => ({
            ...prev,
            name: val,
            slug: slugAutoSync ? generateSlug(val) : prev.slug,
            sku: !prev.sku ? generateSKU(val) : prev.sku,
        }));
    };

    const handleImageFiles = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setData('images', [...data.images, ...files]);

        const newPreviews = files.map((file) => ({
            url: URL.createObjectURL(file),
            name: file.name,
        }));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeNewImage = (index) => {
        const updatedFiles = [...data.images];
        updatedFiles.splice(index, 1);
        setData('images', updatedFiles);

        const updatedPreviews = [...imagePreviews];
        updatedPreviews.splice(index, 1);
        setImagePreviews(updatedPreviews);
    };

    // Variant actions
    const addVariantRow = () => {
        setData('variants', [
            ...data.variants,
            { size: '', color: '', price_adjustment: 0, stock_quantity: 0 },
        ]);
    };

    const updateVariantRow = (index, field, val) => {
        const updated = [...data.variants];
        updated[index] = { ...updated[index], [field]: val };
        setData('variants', updated);
    };

    const removeVariantRow = (index) => {
        const updated = [...data.variants];
        updated.splice(index, 1);
        setData('variants', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            router.post(route('admin.products.update', product.id), {
                _method: 'put',
                ...data,
            });
        } else {
            post(route('admin.products.store'));
        }
    };

    const categoryOptions = [
        { label: '-- Select Category --', value: '' },
        ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
    ];

    const brandOptions = [
        { label: '-- Select Brand --', value: '' },
        ...brands.map((b) => ({ label: b.name, value: String(b.id) })),
    ];

    const tabs = [
        { id: 'general', label: 'General & Description', icon: Package },
        { id: 'pricing', label: 'Pricing & Stock', icon: DollarSign },
        { id: 'images', label: 'Media Gallery', icon: ImageIcon },
        { id: 'variants', label: 'Variants & Options', icon: Sliders },
        { id: 'seo', label: 'SEO Metadata', icon: Globe },
    ];

    return (
        <AdminLayout title={isEditing ? `Edit Product: ${product.name}` : 'Create New Product'}>
            <Head title={isEditing ? `Edit Product - Admin` : 'New Product - Admin'} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/80 border border-gold-500/20 p-4 rounded-xl sticky top-4 z-20 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/products"
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-navy-950 border border-slate-700/80 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <Package className="w-5 h-5 text-gold-400" />
                                {isEditing ? `Edit Product: ${product.name}` : 'Create New Product'}
                            </h1>
                            <p className="text-xs text-slate-400">
                                {isEditing ? `Product ID #${product.id} • SKU: ${product.sku}` : 'Fill in product catalog details below'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/admin/products">
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" variant="primary" loading={processing} icon={<Save className="w-4 h-4" />}>
                            {isEditing ? 'Save Product Changes' : 'Publish Product'}
                        </Button>
                    </div>
                </div>

                {/* Validation errors indicator */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold">Please fix validation errors before saving:</h4>
                            <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                                {Object.entries(errors).map(([field, msg]) => (
                                    <li key={field}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-xs whitespace-nowrap transition-colors ${
                                    isActive
                                        ? 'bg-navy-900 border border-gold-500/30 border-b-transparent text-gold-400'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900/50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab 1: General Info */}
                {activeTab === 'general' && (
                    <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Product Name"
                                required
                                value={data.name}
                                onChange={handleNameChange}
                                error={errors.name}
                                placeholder="e.g., Luxury Gold Chronograph Watch"
                            />

                            <div>
                                <FormInput
                                    label="Slug (URL Friendly)"
                                    value={data.slug}
                                    onChange={(e) => {
                                        setSlugAutoSync(false);
                                        setData('slug', e.target.value);
                                    }}
                                    error={errors.slug}
                                    placeholder="auto-generated slug"
                                />
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSlugAutoSync(true);
                                            setData('slug', generateSlug(data.name));
                                        }}
                                        className="text-[11px] text-gold-400 hover:underline"
                                    >
                                        Auto-generate from name
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <FormInput
                                    label="SKU (Stock Keeping Unit)"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    error={errors.sku}
                                    placeholder="e.g., WATCH-9912"
                                />
                                <button
                                    type="button"
                                    onClick={() => setData('sku', generateSKU(data.name || 'ORIO'))}
                                    className="text-[11px] text-gold-400 hover:underline mt-1 inline-block"
                                >
                                    Generate Random SKU
                                </button>
                            </div>

                            <FormSelect
                                label="Category"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                error={errors.category_id}
                                options={categoryOptions}
                            />

                            <FormSelect
                                label="Brand"
                                value={data.brand_id}
                                onChange={(e) => setData('brand_id', e.target.value)}
                                error={errors.brand_id}
                                options={brandOptions}
                            />
                        </div>

                        <div>
                            <FormInput
                                label="Short Summary / Catchphrase"
                                value={data.short_description}
                                onChange={(e) => setData('short_description', e.target.value)}
                                error={errors.short_description}
                                placeholder="Brief 1-2 sentence highlights displayed on cards..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Full Product Description
                            </label>
                            <textarea
                                rows={6}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Detailed product specifications, materials, warranty, sizing guide..."
                                className="w-full bg-navy-950 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                            />
                            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                        </div>
                    </div>
                )}

                {/* Tab 2: Pricing & Stock */}
                {activeTab === 'pricing' && (
                    <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-6 space-y-6">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                            <DollarSign className="w-4 h-4 text-gold-400" />
                            Pricing Strategy & Financials
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput
                                label="Base Price ($)"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={data.base_price}
                                onChange={(e) => setData('base_price', e.target.value)}
                                error={errors.base_price}
                                placeholder="0.00"
                            />

                            <FormInput
                                label="Sale Price ($)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.sale_price}
                                onChange={(e) => setData('sale_price', e.target.value)}
                                error={errors.sale_price}
                                placeholder="Optional discount price"
                            />

                            <FormInput
                                label="Cost Price ($)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.cost_price}
                                onChange={(e) => setData('cost_price', e.target.value)}
                                error={errors.cost_price}
                                placeholder="Internal cost for margin tracking"
                            />
                        </div>

                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 pt-4">
                            <Package className="w-4 h-4 text-emerald-400" />
                            Inventory & Warehouse Stock
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Stock Quantity"
                                type="number"
                                min="0"
                                required
                                value={data.stock_quantity}
                                onChange={(e) => setData('stock_quantity', parseInt(e.target.value) || 0)}
                                error={errors.stock_quantity}
                            />

                            <FormInput
                                label="Low Stock Alert Threshold"
                                type="number"
                                min="0"
                                value={data.low_stock_threshold}
                                onChange={(e) => setData('low_stock_threshold', parseInt(e.target.value) || 0)}
                                error={errors.low_stock_threshold}
                                hint="Triggers low-stock warnings on admin dashboard when stock drops below this level"
                            />
                        </div>

                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 pt-4">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            Visibility Flags & Badges
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className="flex items-center gap-3 p-4 rounded-xl bg-navy-950 border border-slate-800 cursor-pointer hover:border-gold-500/40 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-700 bg-navy-900 text-gold-500 focus:ring-gold-500/30 w-4 h-4"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-slate-200 block">Active Status</span>
                                    <span className="text-xs text-slate-400">Visible in store catalog</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 rounded-xl bg-navy-950 border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="rounded border-slate-700 bg-navy-900 text-amber-500 focus:ring-amber-500/30 w-4 h-4"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-amber-400 block">Featured Showcase</span>
                                    <span className="text-xs text-slate-400">Promoted on homepage grid</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 rounded-xl bg-navy-950 border border-slate-800 cursor-pointer hover:border-blue-500/40 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={data.is_new_arrival}
                                    onChange={(e) => setData('is_new_arrival', e.target.checked)}
                                    className="rounded border-slate-700 bg-navy-900 text-blue-500 focus:ring-blue-500/30 w-4 h-4"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-blue-400 block">New Arrival</span>
                                    <span className="text-xs text-slate-400">Displays NEW badge</span>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Tab 3: Media Gallery */}
                {activeTab === 'images' && (
                    <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-gold-400" />
                                    Product Images Gallery
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Upload high quality JPG, PNG, WEBP images (Max 3MB per file).
                                </p>
                            </div>
                        </div>

                        {/* Existing images if editing */}
                        {isEditing && product.images?.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase">Existing Images</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {product.images.map((img) => (
                                        <div
                                            key={img.id}
                                            className="relative aspect-square rounded-xl bg-navy-950 border border-gold-500/20 overflow-hidden group"
                                        >
                                            <img
                                                src={img.image_url}
                                                alt="Product image"
                                                className="w-full h-full object-cover"
                                            />
                                            {img.is_primary && (
                                                <span className="absolute top-2 left-2 bg-gold-500 text-navy-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* File Upload zone */}
                        <div className="border-2 border-dashed border-slate-700/80 hover:border-gold-500/50 rounded-xl p-8 text-center bg-navy-950/50 transition-colors">
                            <ImageIcon className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                            <label className="cursor-pointer">
                                <span className="text-sm font-medium text-gold-400 hover:text-gold-300">
                                    Click here to upload product images
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageFiles}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP up to 3MB each</p>
                        </div>

                        {/* New uploads preview */}
                        {imagePreviews.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase">New Upload Previews</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {imagePreviews.map((preview, idx) => (
                                        <div
                                            key={idx}
                                            className="relative aspect-square rounded-xl bg-navy-950 border border-gold-500/30 overflow-hidden group"
                                        >
                                            <img
                                                src={preview.url}
                                                alt={preview.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(idx)}
                                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove Image"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 4: Variants */}
                {activeTab === 'variants' && (
                    <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-gold-400" />
                                    Product Variants Matrix
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Specify size, color options, price adjustments, and variant stock levels.
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={addVariantRow}
                                variant="outline"
                                icon={<Plus className="w-4 h-4" />}
                                className="text-xs"
                            >
                                Add Variant Option
                            </Button>
                        </div>

                        {data.variants.length === 0 ? (
                            <div className="bg-navy-950 border border-slate-800 rounded-xl p-8 text-center">
                                <Sliders className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-xs text-slate-400">No variants added for this product.</p>
                                <Button
                                    type="button"
                                    onClick={addVariantRow}
                                    variant="ghost"
                                    className="mt-3 text-xs text-gold-400"
                                >
                                    + Add size or color variant
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.variants.map((v, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-navy-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center"
                                    >
                                        <div>
                                            <label className="block text-[10px] text-slate-400 uppercase">Size</label>
                                            <input
                                                type="text"
                                                value={v.size}
                                                onChange={(e) => updateVariantRow(idx, 'size', e.target.value)}
                                                placeholder="e.g. M, XL, 42"
                                                className="w-full bg-navy-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-slate-400 uppercase">Color</label>
                                            <input
                                                type="text"
                                                value={v.color}
                                                onChange={(e) => updateVariantRow(idx, 'color', e.target.value)}
                                                placeholder="e.g. Gold, Black"
                                                className="w-full bg-navy-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-slate-400 uppercase">Price Adj ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={v.price_adjustment}
                                                onChange={(e) => updateVariantRow(idx, 'price_adjustment', parseFloat(e.target.value) || 0)}
                                                placeholder="+/- 0.00"
                                                className="w-full bg-navy-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-slate-400 uppercase">Variant Stock</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={v.stock_quantity}
                                                onChange={(e) => updateVariantRow(idx, 'stock_quantity', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className="w-full bg-navy-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500/50"
                                            />
                                        </div>

                                        <div className="flex justify-end sm:pt-4">
                                            <button
                                                type="button"
                                                onClick={() => removeVariantRow(idx)}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-navy-800 transition-colors"
                                                title="Delete Variant"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 5: SEO */}
                {activeTab === 'seo' && (
                    <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-6 space-y-6">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                            <Globe className="w-4 h-4 text-gold-400" />
                            Search Engine Optimization (SEO)
                        </h3>

                        <FormInput
                            label="Meta Title"
                            value={data.meta_title}
                            onChange={(e) => setData('meta_title', e.target.value)}
                            error={errors.meta_title}
                            placeholder="Page title displayed in search results..."
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Meta Description
                            </label>
                            <textarea
                                rows={3}
                                value={data.meta_description}
                                onChange={(e) => setData('meta_description', e.target.value)}
                                placeholder="Summary snippet displayed under title in Google search results..."
                                className="w-full bg-navy-950 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                            />
                            {errors.meta_description && <p className="text-xs text-red-400 mt-1">{errors.meta_description}</p>}
                        </div>
                    </div>
                )}
            </form>
        </AdminLayout>
    );
}
