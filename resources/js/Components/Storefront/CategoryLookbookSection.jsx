import React from 'react';
import { Link } from '@inertiajs/react';

const DEFAULT_ITEMS = [
    {
        key: 'thobe',
        title: 'THOBE',
        slug: 'thobe',
        fallbackImg: '/storefront/img/category/1.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    {
        key: 'dawah-tshirt',
        title: 'DAWAH T-SHIRT (PREMIUM)',
        slug: 'dawah-t-shirt',
        fallbackImg: '/storefront/img/category/2.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    {
        key: 'drop-shoulder',
        title: 'DROP SHOULDER T-SHIRT',
        slug: 'drop-shoulder-t-shirt',
        fallbackImg: '/storefront/img/category/3.jpg',
        hasArrow: true,
        darkBadge: false,
    },
    {
        key: 'visor-cap',
        title: 'VISOR CAP',
        slug: 'visor-cap',
        fallbackImg: '/storefront/img/category/4.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    {
        key: 'regular-tshirt',
        title: 'REGULAR T-SHIRT (PREMIUM)',
        slug: 'regular-t-shirt',
        fallbackImg: '/storefront/img/category/5.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    {
        key: 'pajama',
        title: 'PAJAMA',
        slug: 'pajama',
        fallbackImg: '/storefront/img/category/6.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    {
        key: 'perfume-oil',
        title: 'PERFUME OIL (ATTAR)',
        slug: 'perfume-oil',
        fallbackImg: '/storefront/img/category/7.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    {
        key: 'polo',
        title: 'SIGNATURE EDITION POLO',
        slug: 'polo',
        fallbackImg: '/storefront/img/category/8.jpg',
        hasArrow: false,
        darkBadge: false,
    },
    {
        key: 'panjabi',
        title: 'PLATINUM PANJABI',
        slug: 'platinum-panjabi',
        fallbackImg: '/storefront/img/category/9.jpg',
        hasArrow: true,
        darkBadge: true,
    },
    {
        key: 'docker-cap',
        title: 'DOCKER CAP',
        slug: 'docker-cap',
        fallbackImg: '/storefront/img/category/10.jpg',
        hasArrow: false,
        darkBadge: false,
    },
];

export default function CategoryLookbookSection({ categories = [] }) {
    // Helper to resolve card item with dynamic backend category data
    const getItem = (index, defaultDef) => {
        const cat = categories && categories[index];
        if (!cat) {
            return {
                title: defaultDef.title,
                slug: defaultDef.slug,
                image: defaultDef.fallbackImg,
                hasArrow: defaultDef.hasArrow,
                darkBadge: defaultDef.darkBadge,
            };
        }

        let dynamicImg = null;
        if (Array.isArray(cat.images) && cat.images.length > 0) {
            dynamicImg = cat.images[0]?.image_url || cat.images[0]?.image_path || (typeof cat.images[0] === 'string' ? cat.images[0] : null);
        } else if (cat.image_url) {
            dynamicImg = cat.image_url;
        }

        if (dynamicImg && typeof dynamicImg === 'string') {
            if (!dynamicImg.startsWith('http://') && !dynamicImg.startsWith('https://') && !dynamicImg.startsWith('/')) {
                dynamicImg = `/storage/${dynamicImg}`;
            }
        }

        return {
            title: cat.name || cat.title || defaultDef.title,
            slug: cat.slug || defaultDef.slug,
            image: dynamicImg || defaultDef.fallbackImg,
            hasArrow: defaultDef.hasArrow,
            darkBadge: defaultDef.darkBadge,
        };
    };

    const allItems = DEFAULT_ITEMS.map((def, idx) => getItem(idx, def));

    const itemThobe = allItems[0];
    const itemDawah = allItems[1];
    const itemDropShoulder = allItems[2];
    const itemVisor = allItems[3];
    const itemRegular = allItems[4];
    const itemPajama = allItems[5];
    const itemPerfume = allItems[6];
    const itemPolo = allItems[7];
    const itemPanjabi = allItems[8];
    const itemDocker = allItems[9];

    return (
        <section className="oubd-bento-lookbook-section">
            {/* --- Desktop Bento Mosaic View (>= 768px) --- */}
            <div className="oubd-bento-desktop">
                <div className="oubd-bento-container">
                    {/* Top 3-Column Bento */}
                    <div className="oubd-bento-mosaic oubd-bento-top">
                        {/* Left Column: Full-Height Tall Card (THOBE) */}
                        <div className="oubd-bento-col oubd-bento-col-tall">
                            <Link
                                href={`/?category=${itemThobe.slug}`}
                                className="oubd-bento-card oubd-bento-card-tall"
                            >
                                <img src={itemThobe.image} alt={itemThobe.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemThobe.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemThobe.title}</span>
                                    {itemThobe.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>

                        {/* Middle Column: 2 Stacked Cards (DAWAH T-SHIRT + VISOR CAP) */}
                        <div className="oubd-bento-col oubd-bento-col-stacked">
                            <Link
                                href={`/?category=${itemDawah.slug}`}
                                className="oubd-bento-card oubd-bento-card-half"
                            >
                                <img src={itemDawah.image} alt={itemDawah.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemDawah.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemDawah.title}</span>
                                    {itemDawah.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>

                            <Link
                                href={`/?category=${itemVisor.slug}`}
                                className="oubd-bento-card oubd-bento-card-half"
                            >
                                <img src={itemVisor.image} alt={itemVisor.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemVisor.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemVisor.title}</span>
                                    {itemVisor.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>

                        {/* Right Column: Full-Height Tall Card (DROP SHOULDER T-SHIRT ↗) */}
                        <div className="oubd-bento-col oubd-bento-col-tall">
                            <Link
                                href={`/?category=${itemDropShoulder.slug}`}
                                className="oubd-bento-card oubd-bento-card-tall"
                            >
                                <img src={itemDropShoulder.image} alt={itemDropShoulder.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemDropShoulder.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemDropShoulder.title}</span>
                                    {itemDropShoulder.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Wide 2-Column Banner Row */}
                    <div className="oubd-bento-wide-row">
                        <Link
                            href={`/?category=${itemRegular.slug}`}
                            className="oubd-bento-card oubd-bento-card-wide"
                        >
                            <img src={itemRegular.image} alt={itemRegular.title} loading="lazy" />
                            <div className={`oubd-bento-badge ${itemRegular.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                <span>{itemRegular.title}</span>
                                {itemRegular.hasArrow && <i className="ri-arrow-right-up-line" />}
                            </div>
                        </Link>

                        <Link
                            href={`/?category=${itemPerfume.slug}`}
                            className="oubd-bento-card oubd-bento-card-wide"
                        >
                            <img src={itemPerfume.image} alt={itemPerfume.title} loading="lazy" />
                            <div className={`oubd-bento-badge ${itemPerfume.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                <span>{itemPerfume.title}</span>
                                {itemPerfume.hasArrow && <i className="ri-arrow-right-up-line" />}
                            </div>
                        </Link>
                    </div>

                    {/* Bottom 3-Column Bento */}
                    <div className="oubd-bento-mosaic oubd-bento-bottom">
                        {/* Left Column: Full-Height Tall Card (PAJAMA) */}
                        <div className="oubd-bento-col oubd-bento-col-tall">
                            <Link
                                href={`/?category=${itemPajama.slug}`}
                                className="oubd-bento-card oubd-bento-card-tall"
                            >
                                <img src={itemPajama.image} alt={itemPajama.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemPajama.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemPajama.title}</span>
                                    {itemPajama.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>

                        {/* Middle Column: 2 Stacked Cards (SIGNATURE POLO + PLATINUM PANJABI ↗) */}
                        <div className="oubd-bento-col oubd-bento-col-stacked">
                            <Link
                                href={`/?category=${itemPolo.slug}`}
                                className="oubd-bento-card oubd-bento-card-half"
                            >
                                <img src={itemPolo.image} alt={itemPolo.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemPolo.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemPolo.title}</span>
                                    {itemPolo.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>

                            <Link
                                href={`/?category=${itemPanjabi.slug}`}
                                className="oubd-bento-card oubd-bento-card-half"
                            >
                                <img src={itemPanjabi.image} alt={itemPanjabi.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemPanjabi.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemPanjabi.title}</span>
                                    {itemPanjabi.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>

                        {/* Right Column: Full-Height Tall Card (DOCKER CAP) */}
                        <div className="oubd-bento-col oubd-bento-col-tall">
                            <Link
                                href={`/?category=${itemDocker.slug}`}
                                className="oubd-bento-card oubd-bento-card-tall"
                            >
                                <img src={itemDocker.image} alt={itemDocker.title} loading="lazy" />
                                <div className={`oubd-bento-badge ${itemDocker.darkBadge ? 'badge-dark' : 'badge-light'}`}>
                                    <span>{itemDocker.title}</span>
                                    {itemDocker.hasArrow && <i className="ri-arrow-right-up-line" />}
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Mobile 2-Column Lookbook Grid (< 768px matching Reference Screenshot) --- */}
            <div className="oubd-bento-mobile">
                <div className="oubd-mobile-lookbook-grid">
                    {allItems.map((item, index) => (
                        <Link
                            key={item.key || index}
                            href={`/?category=${item.slug}`}
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
