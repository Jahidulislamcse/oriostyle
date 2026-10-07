import React from 'react';
import { Link } from '@inertiajs/react';

export default function CategoryLookbookSection({ categories = [] }) {
    if (!categories || categories.length === 0) return null;

    return (
        <section className="oubd-lookbook-section">
            <div className="oubd-lookbook-grid">
                {categories.map((cat, index) => {
                    const imgSrc = Array.isArray(cat.images) && cat.images.length > 0
                        ? cat.images[0]
                        : (cat.image_url || `/storefront/img/category/${(index % 18) + 1}.jpg`);

                    const title = cat.title || cat.name || 'Collection';
                    const slug = cat.slug || '';
                    const hasArrow = index % 3 === 2; // Subtle arrow accent for visual variety matching screenshot

                    return (
                        <Link
                            key={cat.id || index}
                            href={`/?category=${slug}`}
                            className="oubd-lookbook-card"
                        >
                            <img
                                src={imgSrc}
                                alt={title}
                                loading="lazy"
                            />
                            <div className="oubd-lookbook-badge">
                                <span>{title}</span>
                                {hasArrow && <i className="ri-arrow-right-up-line" />}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
