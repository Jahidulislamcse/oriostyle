import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const DEFAULT_SLIDES = [
    {
        id: 1,
        title: "ORIO STYLE Luxury Collection",
        subtitle: 'Elegance & Modern Distinction with Artisan Tailoring',
        link_url: '#new-arrivals',
        image_url: '/storefront/img/hero/2.jpg',
    },
    {
        id: 2,
        title: "ORIO STYLE Signature Edition",
        subtitle: 'Elevate your wardrobe with bespoke shirts, thobes and panjabis',
        link_url: '#featured-products',
        image_url: '/storefront/img/hero/1.jpg',
    },
    {
        id: 3,
        title: "Signature Accessories & Caps",
        subtitle: 'Handcrafted leather goods, visor caps and timeless essentials',
        link_url: '#featured-products',
        image_url: '/storefront/img/hero/3.jpg',
    },
];

export default function HeroSlider({ banners = [] }) {
    const slides = (banners && banners.length > 0) ? banners : DEFAULT_SLIDES;
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered || slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5500);
        return () => clearInterval(timer);
    }, [isHovered, slides.length]);

    const activeIndex = currentSlide < slides.length ? currentSlide : 0;

    return (
        <div
            className="oubd-hero-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="oubd-hero-slider-wrap">
                {/* Render each slide with responsive art-directed picture tag */}
                {slides.map((s, index) => {
                    const desktopUrl = s.image_url || s.image_path || s.bg || DEFAULT_SLIDES[0].image_url;
                    const mobileUrl = s.mobile_image_url || s.mobile_image_path || null;
                    const isActive = index === activeIndex;

                    const imageContent = (
                        <picture className="w-100 d-block">
                            {mobileUrl && (
                                <source media="(max-width: 767px)" srcSet={mobileUrl} />
                            )}
                            <img
                                src={desktopUrl}
                                alt={s.title || `Hero Banner ${index + 1}`}
                                className="oubd-hero-img"
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                        </picture>
                    );

                    return (
                        <div
                            key={s.id || index}
                            className={`oubd-hero-slide-item ${isActive ? 'active' : ''}`}
                        >
                            {s.link_url ? (
                                <Link
                                    href={s.link_url}
                                    className="oubd-hero-slide-link"
                                    aria-label={s.title || `Shop Banner ${index + 1}`}
                                >
                                    {imageContent}
                                </Link>
                            ) : (
                                imageContent
                            )}
                        </div>
                    );
                })}

                {/* Dots indicator */}
                {slides.length > 1 && (
                    <div className="oubd-slider-dots">
                        {slides.map((s, index) => (
                            <button
                                key={s.id || index}
                                type="button"
                                aria-label={`Slide ${index + 1}`}
                                className={`oubd-slider-dot ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Dual-tone Accent Bar matching reference design (Gold Left, Green Right) */}
            <div className="oubd-hero-accent-bar">
                <div className="bar-left" />
                <div className="bar-right" />
            </div>
        </div>
    );
}
