import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const SLIDES = [
    {
        id: 1,
        title: "Glorious 10 Years",
        subtitle: 'Purpose & Style with Premium Quality',
        link: '#new-arrivals',
        bg: '/storefront/img/hero/2.jpg',
    },
    {
        id: 2,
        title: "Premium Dawah Collection",
        subtitle: 'Elevate your everyday look with modern thobes and shirts',
        link: '#featured-products',
        bg: '/storefront/img/hero/1.jpg',
    },
    {
        id: 3,
        title: "Signature Accessories",
        subtitle: 'Special suede visor caps and essential accessories',
        link: '#featured-products',
        bg: '/storefront/img/hero/3.jpg',
    },
];

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered]);

    const slide = SLIDES[currentSlide];

    return (
        <div
            className="oubd-hero-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="oubd-hero-slide"
                style={{
                    backgroundImage: `url(${slide.bg})`,
                    transition: 'background-image 0.6s ease-in-out',
                }}
            >
                {/* Dots indicator */}
                <div className="oubd-slider-dots">
                    {SLIDES.map((s, index) => (
                        <button
                            key={s.id}
                            type="button"
                            aria-label={`Slide ${index + 1}`}
                            className={`oubd-slider-dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Gold/Green Accent Bar */}
            <div className="oubd-hero-accent-bar">
                <div className="bar-left" />
                <div className="bar-right" />
            </div>
        </div>
    );
}
