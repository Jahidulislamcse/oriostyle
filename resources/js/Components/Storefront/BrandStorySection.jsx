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
                        alt="One Ummah Retail Store"
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
                        {activeTab === 'mission' ? 'Faith in Every Choice' : 'Inspiring Global Ummah'}
                    </h2>

                    <p className="oubd-story-desc">
                        {activeTab === 'mission'
                            ? 'We aim to inspire Muslims to live with confidence and purpose through meaningful lifestyle products that reflect faith, modesty, and modern style while spreading Dawah in a simple and natural way.'
                            : 'To become a globally recognized modest lifestyle and apparel brand that blends contemporary craftsmanship with authentic ethical values.'}
                    </p>
                </div>
            </div>
        </section>
    );
}
