import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const SLIDES = [
    {
        id: 1,
        className: 'slide-1',
        badge: '50%\nOff',
        title: "Fashion sale \nfor Women's",
        subtitle: 'Elevate your every day. Style that speaks volumes.',
        link: '#featured-products',
        bg: '/storefront/img/hero/1.jpg',
    },
    {
        id: 2,
        className: 'slide-2',
        badge: '35%\nOff',
        title: "Fashion sale \nfor Men's",
        subtitle: 'Wear the change. Fashion that feels good.',
        link: '#featured-products',
        bg: '/storefront/img/hero/2.jpg',
    },
    {
        id: 3,
        className: 'slide-3',
        badge: '44%\nOff',
        title: "Fashion sale \nfor Children's",
        subtitle: 'Wear the change. Fashion that feels good.',
        link: '#featured-products',
        bg: '/storefront/img/hero/3.jpg',
    },
    {
        id: 4,
        className: 'slide-4',
        badge: '22%\nOff',
        title: "Cosmetics sale \nfor Women's",
        subtitle: 'Wear the change. Fashion that feels good.',
        link: '#featured-products',
        bg: '/storefront/img/hero/4.jpg',
    },
];

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(1); // Start with slide 2 (Men's fashion matching image 2) or 0
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    };

    const slide = SLIDES[currentSlide];

    return (
        <section
            className="mn-hero swiper-container m-b-15 position-relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="mn-hero-slider w-100 position-relative">
                <div
                    className={`mn-hero-slide swiper-slide ${slide.className}`}
                    style={{
                        backgroundImage: `url(${slide.bg})`,
                        display: 'flex',
                        transition: 'background-image 0.5s ease-in-out',
                    }}
                >
                    <div className="mn-hero-detail">
                        <p className="label">
                            <span style={{ whiteSpace: 'pre-line' }}>{slide.badge}</span>
                        </p>
                        <h2 style={{ whiteSpace: 'pre-line' }}>{slide.title}</h2>
                        <p>{slide.subtitle}</p>
                        <a href={slide.link} className="mn-btn-2">
                            <span>Shop Now</span>
                        </a>
                    </div>
                </div>

                {/* Left / Right Carousel Navigation Arrows */}
                <div className="owl-nav">
                    <button
                        type="button"
                        role="presentation"
                        className="owl-prev border-0"
                        onClick={prevSlide}
                        title="Previous Slide"
                    />
                    <button
                        type="button"
                        role="presentation"
                        className="owl-next border-0"
                        onClick={nextSlide}
                        title="Next Slide"
                    />
                </div>

                {/* Bottom Pagination Dots */}
                <div className="owl-dots">
                    {SLIDES.map((s, index) => (
                        <button
                            key={s.id}
                            type="button"
                            role="button"
                            className={`owl-dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
