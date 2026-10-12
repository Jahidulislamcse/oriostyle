import React from 'react';
import { Link } from '@inertiajs/react';

const DEFAULT_SLOTS = {
    top_left_tall: {
        slotKey: 'top_left_tall',
        title: 'THOBE',
        slug: 'thobe',
        fallbackImg: '/storefront/img/category/1.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    top_mid_upper_half: {
        slotKey: 'top_mid_upper_half',
        title: 'PREMIUM T-SHIRT',
        slug: 'premium-t-shirt',
        fallbackImg: '/storefront/img/category/2.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    top_mid_lower_half: {
        slotKey: 'top_mid_lower_half',
        title: 'VISOR CAP',
        slug: 'visor-cap',
        fallbackImg: '/storefront/img/category/4.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    top_right_tall: {
        slotKey: 'top_right_tall',
        title: 'DROP SHOULDER T-SHIRT',
        slug: 'drop-shoulder-t-shirt',
        fallbackImg: '/storefront/img/category/3.jpg',
        hasArrow: true,
        darkBadge: false,
    },
    mid_wide_left: {
        slotKey: 'mid_wide_left',
        title: 'REGULAR T-SHIRT (PREMIUM)',
        slug: 'regular-t-shirt',
        fallbackImg: '/storefront/img/category/5.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    mid_wide_right: {
        slotKey: 'mid_wide_right',
        title: 'PERFUME OIL (ATTAR)',
        slug: 'perfume-oil',
        fallbackImg: '/storefront/img/category/7.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    bot_left_tall: {
        slotKey: 'bot_left_tall',
        title: 'PAJAMA',
        slug: 'pajama',
        fallbackImg: '/storefront/img/category/6.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    bot_mid_upper_half: {
        slotKey: 'bot_mid_upper_half',
        title: 'SIGNATURE EDITION POLO',
        slug: 'polo',
        fallbackImg: '/storefront/img/category/8.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    bot_mid_lower_half: {
        slotKey: 'bot_mid_lower_half',
        title: 'PLATINUM PANJABI',
        slug: 'platinum-panjabi',
        fallbackImg: '/storefront/img/category/9.jpg',
        hasArrow: true,
        darkBadge: true,
    },
    bot_right_tall: {
        slotKey: 'bot_right_tall',
        title: 'DOCKER CAP',
        slug: 'docker-cap',
        fallbackImg: '/storefront/img/category/10.jpg',
        hasArrow: false,
        darkBadge: false,
    },
};

const ORDERED_SLOT_KEYS = [
    'top_left_tall',
    'top_mid_upper_half',
    'top_mid_lower_half',
    'top_right_tall',
    'mid_wide_left',
    'mid_wide_right',
    'bot_left_tall',
    'bot_mid_upper_half',
    'bot_mid_lower_half',
    'bot_right_tall',
];

export default function CategoryLookbookSection({ bentoSlots = {}, categories = [] }) {
    // Helper to resolve card item with dynamic backend bento slot or category data
    const resolveSlot = (slotKey) => {
        const defaultDef = DEFAULT_SLOTS[slotKey] || {
            slotKey,
            title: 'Featured Collection',
            slug: '',
            fallbackImg: '/storefront/img/category/1.jpg',
            hasArrow: false,
            darkBadge: false,
        };

        // 1. Look for matched slot in bentoSlots object or array
        const slot = bentoSlots && (
            bentoSlots[slotKey] ||
            (Array.isArray(bentoSlots) ? bentoSlots.find((s) => s?.slot_key === slotKey) : null)
        );

        if (slot) {
            const slug = slot.category_slug || slot.category?.slug || defaultDef.slug || '';
            const title = slot.display_title || slot.title || slot.category?.name || defaultDef.title;
            const image = slot.image_url || slot.image_path || defaultDef.fallbackImg;
            const hasArrow = slot.has_arrow !== undefined ? Boolean(slot.has_arrow) : defaultDef.hasArrow;
            const darkBadge = slot.dark_badge !== undefined ? Boolean(slot.dark_badge) : defaultDef.darkBadge;

            return {
                key: slotKey,
                title,
                slug,
                href: slug ? `/shop?category=${encodeURIComponent(slug)}` : '/shop',
                image,
                hasArrow,
                darkBadge,
            };
        }

        // 2. Fallback to categories list by positional index if available
        const catIndex = ORDERED_SLOT_KEYS.indexOf(slotKey);
        const cat = categories && categories[catIndex];
        if (cat) {
            let catImg = null;
            if (cat.banner_url || cat.banner) {
                catImg = cat.banner_url || cat.banner;
            } else if (Array.isArray(cat.images) && cat.images.length > 0) {
                catImg = cat.images[0]?.image_url || cat.images[0]?.image_path || (typeof cat.images[0] === 'string' ? cat.images[0] : null);
            } else if (cat.image_url || cat.image) {
                catImg = cat.image_url || cat.image;
            }

            if (catImg && typeof catImg === 'string' && !catImg.startsWith('http://') && !catImg.startsWith('https://') && !catImg.startsWith('/')) {
                catImg = `/storage/${catImg}`;
            }

            const slug = cat.slug || defaultDef.slug || '';
            return {
                key: slotKey,
                title: cat.name || cat.title || defaultDef.title,
                slug,
                href: slug ? `/shop?category=${encodeURIComponent(slug)}` : '/shop',
                image: catImg || defaultDef.fallbackImg,
                hasArrow: defaultDef.hasArrow,
                darkBadge: defaultDef.darkBadge,
            };
        }

        // 3. Static default fallback
        const slug = defaultDef.slug || '';
        return {
            key: slotKey,
            title: defaultDef.title,
            slug,
            href: slug ? `/shop?category=${encodeURIComponent(slug)}` : '/shop',
            image: defaultDef.fallbackImg,
            hasArrow: defaultDef.hasArrow,
            darkBadge: defaultDef.darkBadge,
        };
    };

    // Resolved slots for layout
    const itemTopLeft = resolveSlot('top_left_tall');
    const itemTopMidUpper = resolveSlot('top_mid_upper_half');
    const itemTopMidLower = resolveSlot('top_mid_lower_half');
    const itemTopRight = resolveSlot('top_right_tall');

    const itemMidWideLeft = resolveSlot('mid_wide_left');
    const itemMidWideRight = resolveSlot('mid_wide_right');

    const itemBotLeft = resolveSlot('bot_left_tall');
    const itemBotMidUpper = resolveSlot('bot_mid_upper_half');
    const itemBotMidLower = resolveSlot('bot_mid_lower_half');
    const itemBotRight = resolveSlot('bot_right_tall');

    const mobileItems = ORDERED_SLOT_KEYS.map((key) => resolveSlot(key));

    return (
        <section className="oubd-bento-lookbook-section">
            {/* --- Desktop Bento Mosaic View (>= 768px) --- */}
            <div className="oubd-bento-desktop">
                <div className="oubd-bento-container">
                    {/* Top 3-Column Bento */}
                    <div className="oubd-bento-mosaic oubd-bento-top">
                        {/* Left Column: Full-Height Tall Card */}
                        <div className="oubd-bento-col oubd-bento-col-tall">
                            <Link
                                href={itemTopLeft.href}
                                className="oubd-bento-card oubd-bento-card-tall"
                            >
                                <img src={itemTopLeft.image} alt={itemTopLeft.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemTopLeft.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemTopLeft.title}</span>
                                    {itemTopLeft.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>

                        {/* Middle Column: 2 Stacked Cards */}
                        <div className="oubd-bento-col oubd-bento-col-stacked">
                            <Link
                                href={itemTopMidUpper.href}
                                className="oubd-bento-card oubd-bento-card-half"
                            >
                                <img src={itemTopMidUpper.image} alt={itemTopMidUpper.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemTopMidUpper.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemTopMidUpper.title}</span>
                                    {itemTopMidUpper.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>

                            <Link
                                href={itemTopMidLower.href}
                                className="oubd-bento-card oubd-bento-card-half"
                            >
                                <img src={itemTopMidLower.image} alt={itemTopMidLower.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemTopMidLower.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemTopMidLower.title}</span>
                                    {itemTopMidLower.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>

                        {/* Right Column: Full-Height Tall Card */}
                        <div className="oubd-bento-col oubd-bento-col-tall">
                            <Link
                                href={itemTopRight.href}
                                className="oubd-bento-card oubd-bento-card-tall"
                            >
                                <img src={itemTopRight.image} alt={itemTopRight.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemTopRight.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemTopRight.title}</span>
                                    {itemTopRight.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Wide 2-Column Banner Row */}
                    <div className="oubd-bento-wide-row">
                        <Link
                            href={itemMidWideLeft.href}
                            className="oubd-bento-card oubd-bento-card-wide"
                        >
                            <img src={itemMidWideLeft.image} alt={itemMidWideLeft.title} loading="lazy" />
                            <div className={`oubd-bento-badge ${itemMidWideLeft.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                <span>{itemMidWideLeft.title}</span>
                                {itemMidWideLeft.hasArrow && <i className="ri-arrow-right-up-line" />}
                            </div>
                        </Link>

                        <Link
                            href={itemMidWideRight.href}
                            className="oubd-bento-card oubd-bento-card-wide"
                        >
                            <img src={itemMidWideRight.image} alt={itemMidWideRight.title} loading="lazy" />
                            <div className={`oubd-bento-badge ${itemMidWideRight.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                <span>{itemMidWideRight.title}</span>
                                {itemMidWideRight.hasArrow && <i className="ri-arrow-right-up-line" />}
                            </div>
                        </Link>
                    </div>

                    {/* Bottom 3-Column Bento */}
                    <div className="oubd-bento-mosaic oubd-bento-bottom">
                        {/* Left Column: Full-Height Tall Card */}
                        <div className="oubd-bento-col oubd-bento-col-tall">
                            <Link
                                href={itemBotLeft.href}
                                className="oubd-bento-card oubd-bento-card-tall"
                            >
                                <img src={itemBotLeft.image} alt={itemBotLeft.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemBotLeft.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemBotLeft.title}</span>
                                    {itemBotLeft.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>

                        {/* Middle Column: 2 Stacked Cards */}
                        <div className="oubd-bento-col oubd-bento-col-stacked">
                            <Link
                                href={itemBotMidUpper.href}
                                className="oubd-bento-card oubd-bento-card-half"
                            >
                                <img src={itemBotMidUpper.image} alt={itemBotMidUpper.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemBotMidUpper.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemBotMidUpper.title}</span>
                                    {itemBotMidUpper.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>

                            <Link
                                href={itemBotMidLower.href}
                                className="oubd-bento-card oubd-bento-card-half"
                            >
                                <img src={itemBotMidLower.image} alt={itemBotMidLower.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemBotMidLower.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemBotMidLower.title}</span>
                                    {itemBotMidLower.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>

                        {/* Right Column: Full-Height Tall Card */}
                        <div className="oubd-bento-col oubd-bento-col-tall">
                            <Link
                                href={itemBotRight.href}
                                className="oubd-bento-card oubd-bento-card-tall"
                            >
                                <img src={itemBotRight.image} alt={itemBotRight.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemBotRight.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemBotRight.title}</span>
                                    {itemBotRight.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Mobile 2-Column Lookbook Grid (< 768px matching Reference Screenshot) --- */}
            <div className="oubd-bento-mobile">
                <div className="oubd-mobile-lookbook-grid">
                    {mobileItems.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className="oubd-mobile-lookbook-card"
                        >
                            <img src={item.image} alt={item.title} loading="lazy" />
                            <div className={`oubd-bento-badge ${item.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                <span>{item.title}</span>
                                {item.hasArrow && <i className="ri-arrow-right-up-line" />}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
