import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';

export default function CategoryScrollSection({ categories = [] }) {
    const trackRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftPos, setScrollLeftPos] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);

    const updateScrollButtons = useCallback(() => {
        if (!trackRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    useEffect(() => {
        updateScrollButtons();
        const handleResize = () => updateScrollButtons();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [categories, updateScrollButtons]);

    const handleScrollClick = (direction) => {
        if (!trackRef.current) return;
        const container = trackRef.current;
        const firstCard = container.querySelector('.mn-cat-slide-item');
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 280;
        const gap = window.innerWidth < 768 ? 12 : 16;
        const visibleCount = window.innerWidth < 768 ? 2 : window.innerWidth < 992 ? 3 : 4;
        const scrollAmount = (cardWidth + gap) * visibleCount;

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    // Drag-to-scroll functionality for mouse users
    const handleMouseDown = (e) => {
        if (!trackRef.current) return;
        // Don't drag if clicking directly on a button or nested interactive element
        if (e.target.closest('button')) return;

        setIsDragging(true);
        setHasDragged(false);
        setStartX(e.pageX - trackRef.current.offsetLeft);
        setScrollLeftPos(trackRef.current.scrollLeft);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !trackRef.current) return;
        e.preventDefault();
        const currentX = e.pageX - trackRef.current.offsetLeft;
        const distance = currentX - startX;
        if (Math.abs(distance) > 6) {
            setHasDragged(true);
        }
        trackRef.current.scrollLeft = scrollLeftPos - distance;
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const handleCardLinkClick = (e) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    if (!categories || categories.length === 0) return null;

    return (
        <section className="mn-category p-tb-15">
            <div className="mn-cat-scroll-container">
                {/* Left Navigation Arrow */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => handleScrollClick('left')}
                        className="mn-cat-nav-btn prev-btn"
                        aria-label="Scroll Left"
                    >
                        <i className="ri-arrow-left-s-line" />
                    </button>
                )}

                {/* Horizontal Scroll Track */}
                <div
                    ref={trackRef}
                    onScroll={updateScrollButtons}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    className={`mn-cat-scroll-track ${isDragging ? 'is-dragging' : ''}`}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    {categories.map((cat) => (
                        <div key={cat.id || cat.card} className="mn-cat-slide-item">
                            <div
                                className={`mn-cat-card cat-card-${cat.card} w-100 d-flex flex-column justify-content-start`}
                                style={{ minHeight: 'unset', height: 'auto' }}
                            >
                                <div>
                                    {cat.discount && (
                                        <>
                                            <p className="lbl"><span>{cat.discount}</span></p>
                                            <span className="bg">{cat.discount}</span>
                                        </>
                                    )}
                                    <h4>{cat.subtitle}</h4>
                                    <h3 title={cat.title}>{cat.title}</h3>
                                    <p>Items ({cat.count})</p>
                                </div>
                                <ul style={{ marginTop: '4px' }}>
                                    {cat.images.map((imgSrc, imgIdx) => (
                                        <li key={imgIdx} style={{ width: '33.33%' }}>
                                            <Link
                                                href={`/?category=${cat.slug}`}
                                                onClick={handleCardLinkClick}
                                            >
                                                <img
                                                    src={imgSrc}
                                                    alt={cat.title}
                                                    className="img-fluid"
                                                    draggable={false}
                                                />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Navigation Arrow */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => handleScrollClick('right')}
                        className="mn-cat-nav-btn next-btn"
                        aria-label="Scroll Right"
                    >
                        <i className="ri-arrow-right-s-line" />
                    </button>
                )}
            </div>
        </section>
    );
}
