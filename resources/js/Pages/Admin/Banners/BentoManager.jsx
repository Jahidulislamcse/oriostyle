import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import {
    LayoutGrid,
    ExternalLink,
    Edit3,
    Upload,
    CheckCircle2,
    Eye,
    EyeOff,
    Image as ImageIcon,
    ArrowUpRight,
    Sparkles,
    AlertCircle,
    Sliders
} from 'lucide-react';

export default function BentoManager({ slots = [], categories = [] }) {
    const [editingSlot, setEditingSlot] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Edit form states
    const [categoryId, setCategoryId] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [hasArrow, setHasArrow] = useState(false);
    const [darkBadge, setDarkBadge] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Find slot by key helper
    const getSlot = (key) => slots.find((s) => s.slot_key === key) || {};

    const openEditModal = (slot) => {
        setEditingSlot(slot);
        setCategoryId(slot.category_id ? String(slot.category_id) : '');
        setTitle(slot.title || '');
        setSubtitle(slot.subtitle || '');
        setHasArrow(Boolean(slot.has_arrow));
        setDarkBadge(Boolean(slot.dark_badge));
        setIsActive(Boolean(slot.is_active));
        setPreviewImage(slot.image_url || null);
        setSelectedFile(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!editingSlot) return;

        setProcessing(true);
        const formData = new FormData();
        formData.append('category_id', categoryId);
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('has_arrow', hasArrow ? '1' : '0');
        formData.append('dark_badge', darkBadge ? '1' : '0');
        formData.append('is_active', isActive ? '1' : '0');

        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        router.post(`/admin/homepage-bento/${editingSlot.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setEditingSlot(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const toggleSlotActive = (slot, e) => {
        e.stopPropagation();
        router.patch(`/admin/homepage-bento/${slot.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    // Slot keys matching the exact 10-item storefront lookbook grid
    const s1 = getSlot('top_left_tall');
    const s2 = getSlot('top_mid_upper_half');
    const s3 = getSlot('top_mid_lower_half');
    const s4 = getSlot('top_right_tall');
    const s5 = getSlot('mid_wide_left');
    const s6 = getSlot('mid_wide_right');
    const s7 = getSlot('bot_left_tall');
    const s8 = getSlot('bot_mid_upper_half');
    const s9 = getSlot('bot_mid_lower_half');
    const s10 = getSlot('bot_right_tall');

    // Render individual interactive slot card preview
    const renderSlotCard = (slot, className = '') => {
        const isTall = slot.aspect_ratio === 'tall';
        const isHalf = slot.aspect_ratio === 'half';
        const isWide = slot.aspect_ratio === 'wide';

        return (
            <div
                onClick={() => openEditModal(slot)}
                className={`group relative overflow-hidden rounded-xl border border-gold-500/30 bg-navy-950 cursor-pointer transition-all duration-200 hover:border-gold-400 hover:shadow-lg hover:shadow-gold-500/10 ${className}`}
            >
                {/* Image Background */}
                <div className="w-full h-full absolute inset-0 bg-navy-900">
                    {slot.image_url ? (
                        <img
                            src={slot.image_url}
                            alt={slot.display_title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-8 h-8 opacity-40" />
                        </div>
                    )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent pointer-events-none" />

                {/* Top Toolbar Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-navy-950/80 text-gold-400 border border-gold-500/30 backdrop-blur-sm">
                        Slot #{slot.display_order} • {slot.recommended_dimensions}
                    </span>

                    <button
                        type="button"
                        onClick={(e) => toggleSlotActive(slot, e)}
                        className={`pointer-events-auto p-1 rounded-md text-xs backdrop-blur-sm transition ${
                            slot.is_active
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                        title={slot.is_active ? 'Slot is visible on Storefront' : 'Slot is hidden'}
                    >
                        {slot.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                </div>

                {/* Bottom Storefront Lookbook Pill Mockup */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                    <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-md ${
                            slot.dark_badge
                                ? 'bg-navy-950/90 text-gold-300 border border-gold-500/40'
                                : 'bg-white/95 text-navy-950 border border-white'
                        }`}
                    >
                        <span>{slot.display_title}</span>
                        {slot.has_arrow && <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>

                    <div className="p-1.5 rounded-lg bg-gold-500 text-navy-950 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout title="Homepage Bento Mosaic Manager">
            <Head title="Homepage Bento Mosaic Grid - Visual Lookbook Manager" />

            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
                            <LayoutGrid className="w-7 h-7 text-gold-400" />
                            Homepage Bento Mosaic Manager
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Curate and customize the high-impact visual lookbook collage on your storefront homepage.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 transition"
                        >
                            <span>Preview Live Storefront</span>
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                        </a>
                    </div>
                </div>

                {/* Dimension & Aspect Ratio Guide Banner */}
                <div className="bg-navy-900/80 border border-gold-500/20 rounded-2xl p-5 backdrop-blur-sm space-y-3">
                    <div className="flex items-center gap-2 text-gold-400 font-bold text-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Curator Design & Aspect Ratio Guide</span>
                    </div>
                    <p className="text-xs text-slate-300">
                        Each slot in the storefront bento collage has a specialized aspect ratio. Uploading images with the suggested dimensions ensures razor-sharp clarity without unwanted automatic cropping:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-navy-950/70 border border-slate-800 text-xs">
                            <span className="font-bold text-gold-400 block font-mono">1. Tall Cards (Slots 1, 4, 7, 10)</span>
                            <span className="text-slate-400 block mt-0.5">Dimensions: <strong className="text-slate-200 font-mono">600 × 780px</strong> (3:4 Portrait)</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">Best for full-body models, coats, panjabis & gowns.</span>
                        </div>

                        <div className="p-3 rounded-xl bg-navy-950/70 border border-slate-800 text-xs">
                            <span className="font-bold text-blue-400 block font-mono">2. Landscape Cards (Slots 2, 3, 8, 9)</span>
                            <span className="text-slate-400 block mt-0.5">Dimensions: <strong className="text-slate-200 font-mono">600 × 375px</strong> (16:9 Landscape)</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">Best for accessories, footwear, hats & watches.</span>
                        </div>

                        <div className="p-3 rounded-xl bg-navy-950/70 border border-slate-800 text-xs">
                            <span className="font-bold text-emerald-400 block font-mono">3. Wide Panorama (Slots 5, 6)</span>
                            <span className="text-slate-400 block mt-0.5">Dimensions: <strong className="text-slate-200 font-mono">900 × 450px</strong> (2:1 Panorama)</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">Best for seasonal horizontal collection banners.</span>
                        </div>
                    </div>
                </div>

                {/* --- Interactive Desktop Bento Collage Mockup --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                            <span>Visual Layout Grid (Click Any Slot to Edit)</span>
                        </h2>
                        <span className="text-xs text-slate-400">
                            10 slots total • Changes update the live storefront instantly
                        </span>
                    </div>

                    {/* SECTION 1: Top 3-Column Bento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[480px]">
                        {/* Slot 1: Tall Left */}
                        <div className="h-64 md:h-full">
                            {renderSlotCard(s1, 'h-full')}
                        </div>

                        {/* Slot 2 & Slot 3: Stacked Center */}
                        <div className="grid grid-rows-2 gap-4 h-64 md:h-full">
                            <div className="h-full">
                                {renderSlotCard(s2, 'h-full')}
                            </div>
                            <div className="h-full">
                                {renderSlotCard(s3, 'h-full')}
                            </div>
                        </div>

                        {/* Slot 4: Tall Right */}
                        <div className="h-64 md:h-full">
                            {renderSlotCard(s4, 'h-full')}
                        </div>
                    </div>

                    {/* SECTION 2: Wide 2-Column Banner Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[260px]">
                        <div className="h-48 md:h-full">
                            {renderSlotCard(s5, 'h-full')}
                        </div>
                        <div className="h-48 md:h-full">
                            {renderSlotCard(s6, 'h-full')}
                        </div>
                    </div>

                    {/* SECTION 3: Bottom 3-Column Bento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[480px]">
                        {/* Slot 7: Tall Left */}
                        <div className="h-64 md:h-full">
                            {renderSlotCard(s7, 'h-full')}
                        </div>

                        {/* Slot 8 & Slot 9: Stacked Center */}
                        <div className="grid grid-rows-2 gap-4 h-64 md:h-full">
                            <div className="h-full">
                                {renderSlotCard(s8, 'h-full')}
                            </div>
                            <div className="h-full">
                                {renderSlotCard(s9, 'h-full')}
                            </div>
                        </div>

                        {/* Slot 10: Tall Right */}
                        <div className="h-64 md:h-full">
                            {renderSlotCard(s10, 'h-full')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Slot Modal */}
            <Modal
                isOpen={Boolean(editingSlot)}
                onClose={() => setEditingSlot(null)}
                title={`Configure Bento Slot #${editingSlot?.display_order || ''}: ${editingSlot?.slot_key || ''}`}
                maxWidth="lg"
            >
                {editingSlot && (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Aspect Ratio Guideline Alert */}
                        <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl flex items-start gap-2.5 text-xs text-gold-300">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold-400" />
                            <div>
                                <strong>Recommended Image Format:</strong>
                                <span className="block mt-0.5 font-mono text-slate-200">
                                    {editingSlot.recommended_dimensions} ({editingSlot.aspect_ratio?.toUpperCase()})
                                </span>
                            </div>
                        </div>

                        {/* Image Preview & Upload Dropzone */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Curated Showcase Photo
                            </label>

                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-navy-950 border border-slate-700/80 rounded-xl">
                                <div className="w-32 h-32 rounded-lg overflow-hidden bg-navy-900 border border-slate-700 flex-shrink-0 flex items-center justify-center relative">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-600" />
                                    )}
                                </div>

                                <div className="space-y-2 flex-1 text-center sm:text-left">
                                    <input
                                        type="file"
                                        id="slot-image-input"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="slot-image-input"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-navy-800 hover:bg-navy-700 text-gold-400 border border-gold-500/30 cursor-pointer transition"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Choose New Photo</span>
                                    </label>
                                    <p className="text-[11px] text-slate-400">
                                        Supports JPG, PNG, WebP up to 5MB. Photo will be displayed in the storefront bento collage.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Category Selector */}
                        <FormSelect
                            label="Associated Category (Navigation Target)"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            options={[
                                { label: '— No Category Association —', value: '' },
                                ...categories.map((c) => ({
                                    label: `${c.name} (/${c.slug})`,
                                    value: String(c.id),
                                })),
                            ]}
                        />

                        {/* Title Override */}
                        <div>
                            <FormInput
                                label="Custom Badge Title (Optional)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={editingSlot.category?.name || 'Leave empty to use category name'}
                            />
                            <span className="text-[11px] text-slate-400 block mt-1">
                                If left blank, the associated category's name will automatically appear on the badge.
                            </span>
                        </div>

                        {/* Subtitle / Description (Optional) */}
                        <FormInput
                            label="Subtitle / Campaign Tag (Optional)"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="e.g. Exclusive Edition, Handcrafted"
                        />

                        {/* Badging & Indicator Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-navy-950/70 border border-slate-800 rounded-xl">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={hasArrow}
                                    onChange={(e) => setHasArrow(e.target.checked)}
                                    className="rounded border-slate-700 text-gold-500 focus:ring-gold-500/20 bg-navy-900"
                                />
                                <span>Show Arrow Indicator (↗)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={darkBadge}
                                    onChange={(e) => setDarkBadge(e.target.checked)}
                                    className="rounded border-slate-700 text-gold-500 focus:ring-gold-500/20 bg-navy-900"
                                />
                                <span>Dark Badge Style</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-navy-900"
                                />
                                <span className={isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                                    Published (Visible)
                                </span>
                            </label>
                        </div>

                        {/* Modal Footer Buttons */}
                        <div className="pt-2 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setEditingSlot(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={processing}
                            >
                                Save Slot Configuration
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
