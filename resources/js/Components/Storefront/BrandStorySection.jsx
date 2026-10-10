import React, { useState } from 'react';

export default function BrandStorySection() {
    const [activeTab, setActiveTab] = useState('mission');

    return (
        <section className="oubd-brand-story-section">
            <div className="oubd-story-grid">
                {/* Left Column: Physical Retail Store Photo */}
                <div className="oubd-story-img-wrap">
                    <img
                        src="/storefront/img/banner/1.jpg"
                        alt="ORIO STYLE Flagship Store"
                        loading="lazy"
                    />
                </div>

                {/* Right Column: Mission & Vision Card */}
                <div className="oubd-story-content-wrap">
                    <div className="oubd-story-tabs">
                        <button
                            type="button"
                            className={`oubd-story-tab-btn ${activeTab === 'mission' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mission')}
                        >
                            OUR MISSION
                        </button>
                        <button
                            type="button"
                            className={`oubd-story-tab-btn ${activeTab === 'vision' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vision')}
                        >
                            OUR VISION
                        </button>
                    </div>

                    <h2 className="oubd-story-title">
                        {activeTab === 'mission' ? 'Elegance in Every Choice' : 'Inspiring Modern Luxury'}
                    </h2>

                    <p className="oubd-story-desc">
                        {activeTab === 'mission'
                            ? 'At ORIO STYLE, we aim to inspire individuals to dress with effortless confidence, refined modesty, and modern sophistication through premium apparel crafted with uncompromising attention to detail.'
                            : 'To become the premier contemporary lifestyle brand, pioneering sustainable craftsmanship, ethical standards, and timeless luxury for discerning customers worldwide.'}
                    </p>
                </div>
            </div>
        </section>
    );
}
