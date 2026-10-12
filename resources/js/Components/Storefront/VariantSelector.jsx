import React from 'react';

// Color name to CSS hex mapping helper
const COLOR_MAP = {
    white: '#ffffff',
    'crisp white': '#fdfdfd',
    black: '#111111',
    navy: '#0b1d3a',
    'navy blue': '#0b1d3a',
    blue: '#1e3d59',
    'sky blue': '#87ceeb',
    gray: '#808080',
    grey: '#808080',
    charcoal: '#36454f',
    gold: '#d4af37',
    beige: '#f5f5dc',
    cream: '#fffdd0',
    maroon: '#800000',
    burgundy: '#800020',
    green: '#2e8b57',
    olive: '#556b2f',
    emerald: '#50c878',
    brown: '#8b4513',
    tan: '#d2b48c',
};

function getColorHex(colorName) {
    if (!colorName) return '#e0e0e0';
    const lower = colorName.trim().toLowerCase();
    return COLOR_MAP[lower] || '#cccccc';
}

export default function VariantSelector({
    variants = [],
    selectedVariant = null,
    onVariantSelect,
    currencySymbol = '৳',
}) {
    if (!variants || variants.length === 0) {
        return null;
    }

    // Extract unique colors and sizes
    const availableColors = [...new Set(variants.map(v => v.color).filter(Boolean))];
    const availableSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

    // Currently selected color and size
    const currentColor = selectedVariant?.color || (availableColors.length > 0 ? availableColors[0] : null);
    const currentSize = selectedVariant?.size || (availableSizes.length > 0 ? availableSizes[0] : null);

    const handleColorClick = (color) => {
        // Find matching variant with this color and current size, or first variant of this color
        const match = variants.find(v => v.color === color && v.size === currentSize)
            || variants.find(v => v.color === color);
        if (match) {
            onVariantSelect(match);
        }
    };

    const handleSizeClick = (size) => {
        // Find matching variant with current color and this size, or first variant of this size
        const match = variants.find(v => v.size === size && v.color === currentColor)
            || variants.find(v => v.size === size);
        if (match) {
            onVariantSelect(match);
        }
    };

    return (
        <div className="oubd-variant-selector my-4 pb-3 border-bottom">
            {/* Color Swatches */}
            {availableColors.length > 0 && (
                <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="font-size-13 fw-bold text-uppercase text-dark tracking-wider mb-0">
                            Color: <span className="fw-normal text-muted ms-1 text-capitalize">{currentColor}</span>
                        </label>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {availableColors.map((color) => {
                            const isSelected = currentColor === color;
                            const hexColor = getColorHex(color);
                            const isLight = ['#ffffff', '#fdfdfd', '#f5f5dc', '#fffdd0'].includes(hexColor.toLowerCase());
                            const colorVariants = variants.filter(v => v.color === color);
                            const isOutOfStock = colorVariants.every(v => v.stock_quantity <= 0);

                            return (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleColorClick(color)}
                                    title={`${color} ${isOutOfStock ? '(Out of stock)' : ''}`}
                                    className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill transition-all ${
                                        isSelected
                                            ? 'btn-dark text-white shadow-sm'
                                            : 'btn-outline-secondary text-dark border hover-bg-light'
                                    } ${isOutOfStock ? 'opacity-50 text-decoration-line-through' : ''}`}
                                    style={{
                                        borderWidth: isSelected ? '2px' : '1px',
                                        fontSize: '12px',
                                    }}
                                >
                                    <span
                                        className="rounded-circle d-inline-block"
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: hexColor,
                                            border: isLight ? '1px solid #ccc' : 'none',
                                        }}
                                    />
                                    <span className="text-capitalize">{color}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Size Swatches */}
            {availableSizes.length > 0 && (
                <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="font-size-13 fw-bold text-uppercase text-dark tracking-wider mb-0">
                            Size: <span className="fw-normal text-muted ms-1">{currentSize}</span>
                        </label>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                            const isSelected = currentSize === size;
                            // Find specific variant with current color and this size
                            const variantForSize = variants.find(v => v.size === size && (currentColor ? v.color === currentColor : true));
                            const isOutOfStock = variantForSize ? variantForSize.stock_quantity <= 0 : false;
                            const priceAdj = variantForSize ? variantForSize.price_adjustment : 0;

                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => handleSizeClick(size)}
                                    title={isOutOfStock ? 'Out of stock' : `${size}`}
                                    className={`btn btn-sm px-3 py-2 rounded transition-all font-size-13 ${
                                        isSelected
                                            ? 'btn-dark text-white fw-bold shadow-sm'
                                            : 'btn-outline-secondary text-dark hover-bg-light'
                                    } ${isOutOfStock ? 'opacity-40 text-decoration-line-through' : ''}`}
                                    style={{
                                        minWidth: '48px',
                                        position: 'relative',
                                    }}
                                >
                                    <span>{size}</span>
                                    {priceAdj !== 0 && (
                                        <span className="font-size-10 text-warning d-block" style={{ marginTop: '-2px' }}>
                                            {priceAdj > 0 ? `+${currencySymbol}${priceAdj}` : `-${currencySymbol}${Math.abs(priceAdj)}`}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
