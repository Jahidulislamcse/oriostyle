import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ShopFilterSidebar({
    categoriesTree = [],
    brands = [],
    priceRange = { min: 0, max: 10000 },
    filters = {},
    currencySymbol = '৳',
    onFilterChange,
    onResetFilters,
}) {
    // Local price inputs state
    const [minPriceInput, setMinPriceInput] = useState(filters.min_price || '');
    const [maxPriceInput, setMaxPriceInput] = useState(filters.max_price || '');
    const [brandSearch, setBrandSearch] = useState('');

    // Accordion collapse state
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategoryExpand = (catId, e) => {
        e.stopPropagation();
        setExpandedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    const handleCategoryClick = (slug) => {
        if (filters.category === slug) {
            onFilterChange('category', null);
        } else {
            onFilterChange('category', slug);
        }
    };

    const handleBrandToggle = (brandSlug) => {
        const currentBrands = filters.brand
            ? (Array.isArray(filters.brand) ? filters.brand : filters.brand.split(',').filter(Boolean))
            : [];

        let updatedBrands;
        if (currentBrands.includes(brandSlug)) {
            updatedBrands = currentBrands.filter(b => b !== brandSlug);
        } else {
            updatedBrands = [...currentBrands, brandSlug];
        }

        onFilterChange('brand', updatedBrands.length > 0 ? updatedBrands.join(',') : null);
    };

    const handlePriceApply = (e) => {
        e.preventDefault();
        onFilterChange({
            min_price: minPriceInput ? parseFloat(minPriceInput) : null,
            max_price: maxPriceInput ? parseFloat(maxPriceInput) : null,
        });
    };

    const handlePricePreset = (min, max) => {
        setMinPriceInput(min || '');
        setMaxPriceInput(max || '');
        onFilterChange({
            min_price: min,
            max_price: max,
        });
    };

    const handleStockToggle = (e) => {
        onFilterChange('in_stock', e.target.checked ? '1' : null);
    };

    const selectedBrandList = filters.brand
        ? (Array.isArray(filters.brand) ? filters.brand : filters.brand.split(',').filter(Boolean))
        : [];

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(brandSearch.toLowerCase())
    );

    const hasActiveFilters = Boolean(
        filters.category ||
        (selectedBrandList.length > 0) ||
        filters.min_price ||
        filters.max_price ||
        filters.in_stock ||
        filters.search
    );

    return (
        <aside className="oubd-shop-sidebar">
            {/* Header / Reset bar */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                <span className="fw-bold font-size-14 text-uppercase tracking-wider text-dark d-flex align-items-center gap-2">
                    <i className="ri-sound-module-line text-warning font-size-16" /> Filters
                </span>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="btn btn-sm btn-link text-danger p-0 text-decoration-none font-size-12 fw-semibold"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* In-Stock Toggle Filter */}
            <div className="filter-group mb-4 pb-3 border-bottom">
                <div className="d-flex align-items-center justify-content-between">
                    <label htmlFor="inStockSwitch" className="font-size-13 fw-semibold text-dark mb-0 cursor-pointer user-select-none">
                        In Stock Only
                    </label>
                    <div className="form-check form-switch m-0">
                        <input
                            className="form-check-input cursor-pointer"
                            type="checkbox"
                            role="switch"
                            id="inStockSwitch"
                            checked={Boolean(filters.in_stock)}
                            onChange={handleStockToggle}
                            style={{ cursor: 'pointer', width: '2.4em', height: '1.2em' }}
                        />
                    </div>
                </div>
            </div>

            {/* Categories Tree Accordion */}
            <div className="filter-group mb-4 pb-3 border-bottom">
                <h6 className="font-size-13 fw-bold text-uppercase text-dark mb-3 tracking-wider d-flex justify-content-between align-items-center">
                    Categories
                </h6>
                <div className="category-filter-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <ul className="list-unstyled mb-0 font-size-13">
                        {categoriesTree.map((rootCat) => {
                            const isSelected = filters.category === rootCat.slug;
                            const hasChildren = rootCat.children && rootCat.children.length > 0;
                            const isExpanded = expandedCategories[rootCat.id] || isSelected || rootCat.children?.some(c => c.slug === filters.category);

                            return (
                                <li key={rootCat.id} className="mb-2">
                                    <div
                                        className={`d-flex align-items-center justify-content-between py-1 px-2 rounded cursor-pointer transition-all ${
                                            isSelected ? 'bg-dark text-white fw-bold shadow-sm' : 'hover-bg-light text-secondary'
                                        }`}
                                        onClick={() => handleCategoryClick(rootCat.slug)}
                                        style={{ transition: 'all 0.15s ease' }}
                                    >
                                        <span className="text-truncate d-flex align-items-center gap-1">
                                            {rootCat.name}
                                        </span>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge rounded-pill font-size-10 ${isSelected ? 'bg-warning text-dark' : 'bg-light text-muted'}`}>
                                                {rootCat.products_count || 0}
                                            </span>
                                            {hasChildren && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => toggleCategoryExpand(rootCat.id, e)}
                                                    className={`btn btn-link p-0 border-0 ${isSelected ? 'text-white' : 'text-muted'}`}
                                                    style={{ width: '18px', height: '18px', lineHeight: 1 }}
                                                >
                                                    <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line font-size-13`} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subcategories list */}
                                    {hasChildren && isExpanded && (
                                        <ul className="list-unstyled ms-3 mt-1 border-start ps-2 mb-1">
                                            {rootCat.children.map((subCat) => {
                                                const isSubSelected = filters.category === subCat.slug;
                                                return (
                                                    <li key={subCat.id} className="py-1">
                                                        <div
                                                            className={`d-flex align-items-center justify-content-between py-1 px-2 rounded cursor-pointer ${
                                                                isSubSelected ? 'bg-warning text-dark fw-bold' : 'text-muted hover-text-dark'
                                                            }`}
                                                            onClick={() => handleCategoryClick(subCat.slug)}
                                                            style={{ fontSize: '12px' }}
                                                        >
                                                            <span className="text-truncate">{subCat.name}</span>
                                                            <span className="font-size-10 text-muted">
                                                                ({subCat.products_count || 0})
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group mb-4 pb-3 border-bottom">
                <h6 className="font-size-13 fw-bold text-uppercase text-dark mb-3 tracking-wider">
                    Price Range ({currencySymbol})
                </h6>

                {/* Quick Preset Buttons */}
                <div className="d-flex flex-wrap gap-1 mb-3">
                    <button
                        type="button"
                        onClick={() => handlePricePreset(null, 1500)}
                        className="btn btn-outline-secondary btn-sm py-0 px-2 font-size-11 rounded"
                    >
                        Under {currencySymbol}1,500
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePricePreset(1500, 3000)}
                        className="btn btn-outline-secondary btn-sm py-0 px-2 font-size-11 rounded"
                    >
                        {currencySymbol}1,500 - 3,000
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePricePreset(3000, 5000)}
                        className="btn btn-outline-secondary btn-sm py-0 px-2 font-size-11 rounded"
                    >
                        {currencySymbol}3,000 - 5,000
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePricePreset(5000, null)}
                        className="btn btn-outline-secondary btn-sm py-0 px-2 font-size-11 rounded"
                    >
                        Above {currencySymbol}5,000
                    </button>
                </div>

                {/* Manual Min - Max Inputs */}
                <form onSubmit={handlePriceApply}>
                    <div className="row g-2 align-items-center mb-2">
                        <div className="col-5">
                            <input
                                type="number"
                                className="form-control form-control-sm font-size-12"
                                placeholder={`Min (${priceRange.min})`}
                                value={minPriceInput}
                                min="0"
                                onChange={(e) => setMinPriceInput(e.target.value)}
                            />
                        </div>
                        <div className="col-2 text-center text-muted font-size-12">to</div>
                        <div className="col-5">
                            <input
                                type="number"
                                className="form-control form-control-sm font-size-12"
                                placeholder={`Max (${priceRange.max})`}
                                value={maxPriceInput}
                                min="0"
                                onChange={(e) => setMaxPriceInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-dark btn-sm w-100 font-size-12 fw-bold text-uppercase py-1"
                    >
                        Apply Price
                    </button>
                </form>
            </div>

            {/* Brands Filter */}
            <div className="filter-group mb-4">
                <h6 className="font-size-13 fw-bold text-uppercase text-dark mb-2 tracking-wider">
                    Brands
                </h6>

                {brands.length > 5 && (
                    <div className="mb-2">
                        <input
                            type="text"
                            className="form-control form-control-sm font-size-12"
                            placeholder="Search brands..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                        />
                    </div>
                )}

                <div className="brand-filter-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredBrands.length === 0 ? (
                        <p className="text-muted font-size-12 mb-0 py-1">No brands found</p>
                    ) : (
                        <ul className="list-unstyled mb-0 font-size-13">
                            {filteredBrands.map((brand) => {
                                const isChecked = selectedBrandList.includes(brand.slug);
                                return (
                                    <li key={brand.id} className="py-1">
                                        <label className="d-flex align-items-center justify-content-between cursor-pointer user-select-none mb-0 w-100">
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input mt-0 cursor-pointer"
                                                    checked={isChecked}
                                                    onChange={() => handleBrandToggle(brand.slug)}
                                                />
                                                <span className={`text-truncate ${isChecked ? 'fw-bold text-dark' : 'text-secondary'}`}>
                                                    {brand.name}
                                                </span>
                                            </div>
                                            <span className="font-size-11 text-muted">
                                                ({brand.products_count || 0})
                                            </span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </aside>
    );
}
