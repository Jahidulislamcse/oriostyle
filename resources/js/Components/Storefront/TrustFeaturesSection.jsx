import React from 'react';

const FEATURES = [
    {
        id: 1,
        icon: 'ri-box-3-line',
        title: 'Cash On Delivery',
        desc: 'Cash on Delivery available for all Orders',
    },
    {
        id: 2,
        icon: 'ri-bank-card-line',
        title: 'Flexible Payment',
        desc: 'Pay with multiple cards or MFS via SSLCOMMERZ.',
    },
    {
        id: 3,
        icon: 'ri-arrow-go-back-line',
        title: '07 Day Returns',
        desc: 'Within 07 days for an exchange',
    },
    {
        id: 4,
        icon: 'ri-headphone-line',
        title: 'Premium Support',
        desc: 'Outstanding premium support',
    },
];

export default function TrustFeaturesSection() {
    return (
        <section className="oubd-features-section">
            <div className="oubd-features-grid">
                {FEATURES.map((item) => (
                    <div key={item.id} className="oubd-feature-card">
                        <i className={`${item.icon} oubd-feature-icon`} />
                        <h4 className="oubd-feature-title">{item.title}</h4>
                        <p className="oubd-feature-desc">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
