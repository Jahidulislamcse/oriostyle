import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

const FAQS = [
    {
        q: 'How long does delivery take?',
        a: 'Inside Dhaka: 24 to 48 hours. Outside Dhaka: 3 to 5 business days with reliable express couriers.',
    },
    {
        q: 'Do you offer Cash on Delivery (COD)?',
        a: 'Yes, Cash on Delivery (COD) is available for all addresses across Bangladesh without advance payment requirements.',
    },
    {
        q: 'Can I exchange or return a product?',
        a: 'Yes, you can exchange any product within 07 days of receiving your delivery if the item is unused with original tags intact.',
    },
    {
        q: 'How do I choose the right fitting size?',
        a: 'Every product page features a detailed sizing measurement chart with chest, length, and shoulder specifications.',
    },
    {
        q: 'Do you restock sold-out items?',
        a: 'Yes, popular signature drops and essentials are regularly restocked. Contact customer support to check arrival schedules.',
    },
    {
        q: 'How can I contact customer support?',
        a: 'Our dedicated customer care team is available daily from 9:00 AM to 9:00 PM via live chat, WhatsApp, and phone support.',
    },
];

export default function FaqAndSupportSection() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="oubd-faq-section">
            <div className="oubd-faq-grid">
                {/* Left Column: FAQ Accordion */}
                <div>
                    <h2 className="oubd-faq-heading">Frequently Asked Questions</h2>
                    <div className="oubd-accordion">
                        {FAQS.map((item, idx) => {
                            const isOpen = openIndex === idx;
                            return (
                                <div key={idx} className="oubd-accordion-item">
                                    <button
                                        type="button"
                                        className={`oubd-accordion-btn ${isOpen ? 'active' : ''}`}
                                        onClick={() => toggleFaq(idx)}
                                    >
                                        <span>{item.q}</span>
                                        <i className="ri-arrow-down-s-line" />
                                    </button>
                                    {isOpen && (
                                        <div className="oubd-accordion-body">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Support & Refund Processing Card */}
                <div className="oubd-support-box">
                    <h3>Have a question</h3>
                    <p>
                        Need help with your order or have a quick question? Our support team is here for you. Click the button below to chat live with a Customer Care representative for fast assistance.
                    </p>

                    <h4>Refund Processing</h4>
                    <p>
                        Once your returned package reaches us, please allow 15 Working days for your refund to be processed and issued.
                    </p>

                    <div className="oubd-support-actions">
                        <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer" className="oubd-btn-contact">
                            Contact Us
                        </a>
                        <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer" className="oubd-link-chat">
                            Live chat ↗
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
