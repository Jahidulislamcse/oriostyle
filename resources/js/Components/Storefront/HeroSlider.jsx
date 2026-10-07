import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const DEFAULT_SLIDES = [
    {
        id: 1,
        title: "Glorious 10 Years",
        subtitle: 'Purpose & Style with Premium Quality',
        link_url: '#new-arrivals',
        image_url: '/storefront/img/hero/2.jpg',
    },
    {
        id: 2,
        title: "Premium Dawah Collection",
        subtitle: 'Elevate your everyday look with modern thobes and shirts',
        link_url: '#featured-products',
        image_url: '/storefront/img/hero/1.jpg',
    },
    {
        id: 3,
        title: "Signature Accessories",
        subtitle: 'Special suede visor caps and essential accessories',
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
    const slide = slides[activeIndex] || DEFAULT_SLIDES[0];
    const bgUrl = slide.image_url || slide.image_path || slide.bg || DEFAULT_SLIDES[0].image_url;

    return (
        <div
            className="oubd-hero-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="oubd-hero-slide"
                style={{
                    backgroundImage: `url(${bgUrl})`,
                    transition: 'background-image 0.6s ease-in-out',
                }}
            >
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

            {/* Bottom Gold/Green Accent Bar */}
            <div className="oubd-hero-accent-bar">
                <div className="bar-left" />
                <div className="bar-right" />
            </div>
        </div>
    );
}
