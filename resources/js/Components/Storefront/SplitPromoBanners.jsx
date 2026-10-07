import React from 'react';
import { Link } from '@inertiajs/react';

const DEFAULT_SPLIT_BANNERS = [
    {
        id: 1,
        badge_text: 'EVERYDAY CARRY ESSENTIAL',
        title: 'Smart, Durable, Daily Use.',
        button_text: 'SHOP NOW',
        link_url: '/?category=accessories',
        image_url: '/storefront/img/banner/5.jpg',
        theme: 'dark',
    },
    {
        id: 2,
        badge_text: 'PREMIUM COMFORT',
        title: 'Soft feel. Perfect fit.',
        button_text: 'SHOP NOW',
        link_url: '/?category=t-shirts',
        image_url: '/storefront/img/banner/6.jpg',
        theme: 'light',
    },
];

export default function SplitPromoBanners({ banners = [] }) {
    const items = (banners && banners.length >= 2) ? banners.slice(0, 2) : DEFAULT_SPLIT_BANNERS;

    return (
        <section className="oubd-split-banners-section">
            <div className="oubd-split-grid">
                {items.map((b, index) => {
                    const bg = b.image_url || b.image_path || (index === 0 ? '/storefront/img/banner/5.jpg' : '/storefront/img/banner/6.jpg');
                    const badge = b.badge_text || b.subtitle || (index === 0 ? 'EVERYDAY CARRY ESSENTIAL' : 'PREMIUM COMFORT');
                    const title = b.title || (index === 0 ? 'Smart, Durable, Daily Use.' : 'Soft feel. Perfect fit.');
                    const btnText = b.button_text || 'SHOP NOW';
                    const link = b.link_url || '/#featured-products';
                    const isDark = index % 2 === 0;

                    return (
                        <div
                            key={b.id || index}
                            className={`oubd-split-banner ${isDark ? 'banner-dark' : 'banner-light'}`}
                            style={{
                                backgroundImage: isDark
                                    ? `linear-gradient(rgba(11, 19, 32, 0.45), rgba(11, 19, 32, 0.75)), url(${bg})`
                                    : `linear-gradient(rgba(243, 245, 247, 0.35), rgba(243, 245, 247, 0.65)), url(${bg})`,
                            }}
                        >
                            <span className="oubd-split-subtitle">{badge}</span>
                            <h3 className="oubd-split-title">{title}</h3>
                            <Link href={link} className="oubd-split-btn">
                                {btnText}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
