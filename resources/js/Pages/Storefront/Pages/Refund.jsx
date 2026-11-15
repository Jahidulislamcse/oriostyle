import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function Refund({ settings = {} }) {
    const siteName = settings.site_name || 'ORIO STYLE';
    const title = settings.refund_title || 'Refund, Return & Exchange Policy';
    const content = settings.refund_content || '';

    // Split content into clean paragraphs
    const paragraphs = content
        ? content.split('\n\n').filter(p => p.trim().length > 0)
        : [];

    return (
        <StorefrontLayout headerSolid={true}>
            <Head title={`${title} | ${siteName}`} />

            {/* Breadcrumb & Hero Header */}
            <section className="bg-light py-5 border-bottom">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-2 font-size-13">
                            <li className="breadcrumb-item">
                                <Link href="/" className="text-muted text-decoration-none">Home</Link>
                            </li>
                            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
                                Refund & Return Policy
                            </li>
                        </ol>
                    </nav>
                    <h1 className="fw-black display-6 text-uppercase tracking-tight text-dark mb-2">
                        {title}
                    </h1>
                    <p className="lead text-muted mb-0 font-size-14">
                        Hassle-Free 7-Day Exchange • Doorstep Return Pickups Across Bangladesh
                    </p>
                </div>
            </section>

            {/* 4 Feature Badges */}
            <section className="py-4 bg-white border-bottom">
                <div className="container">
                    <div className="row g-3 text-center">
                        <div className="col-lg-3 col-6">
                            <div className="p-3 rounded-2 bg-light border border-light">
                                <i className="ri-calendar-check-line text-warning fs-3 mb-1 d-block" />
                                <h6 className="fw-bold font-size-13 text-dark mb-0">7-Day Exchange</h6>
                                <span className="text-muted font-size-11">Unworn items with tags</span>
                            </div>
                        </div>

                        <div className="col-lg-3 col-6">
                            <div className="p-3 rounded-2 bg-light border border-light">
                                <i className="ri-truck-line text-warning fs-3 mb-1 d-block" />
                                <h6 className="fw-bold font-size-13 text-dark mb-0">Doorstep Swap</h6>
                                <span className="text-muted font-size-11">Dhaka metropolitan area</span>
                            </div>
                        </div>

                        <div className="col-lg-3 col-6">
                            <div className="p-3 rounded-2 bg-light border border-light">
                                <i className="ri-refund-2-line text-warning fs-3 mb-1 d-block" />
                                <h6 className="fw-bold font-size-13 text-dark mb-0">Fast MFS Refund</h6>
                                <span className="text-muted font-size-11">24 to 48 hours via bKash</span>
                            </div>
                        </div>

                        <div className="col-lg-3 col-6">
                            <div className="p-3 rounded-2 bg-light border border-light">
                                <i className="ri-shield-check-line text-warning fs-3 mb-1 d-block" />
                                <h6 className="fw-bold font-size-13 text-dark mb-0">100% Genuine</h6>
                                <span className="text-muted font-size-11">Direct factory warranty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Refund Document Content */}
            <section className="py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-9">
                            <div className="bg-white p-4 p-md-5 rounded-3 border border-slate-200 shadow-xs">
                                <div className="border-bottom pb-3 mb-4 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="ri-hand-coin-line text-warning fs-4" />
                                        <span className="fw-bold font-size-14 text-dark text-uppercase">
                                            Return & Exchange Guidelines
                                        </span>
                                    </div>
                                    <span className="badge bg-warning text-dark font-size-11 fw-bold">
                                        Guaranteed Resolution
                                    </span>
                                </div>

                                <div className="legal-prose text-secondary font-size-15 leading-relaxed space-y-4">
                                    {paragraphs.length > 0 ? (
                                        paragraphs.map((p, idx) => {
                                            const isClauseHeader = /^\d+\.\s+/.test(p);
                                            return isClauseHeader ? (
                                                <div key={idx} className="pt-2">
                                                    <h4 className="fw-bold fs-5 text-dark mb-2">
                                                        {p.split('\n')[0]}
                                                    </h4>
                                                    {p.split('\n').slice(1).map((sub, sIdx) => (
                                                        <p key={sIdx} className="mb-2 text-secondary">{sub}</p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p key={idx}>{p}</p>
                                            );
                                        })
                                    ) : (
                                        <p>
                                            At ORIO STYLE, we offer a hassle-free 7-day exchange and refund policy for all qualifying purchases.
                                        </p>
                                    )}
                                </div>

                                {/* Step-by-Step Return Instructions */}
                                <div className="mt-5 p-4 rounded-3 bg-light border border-light">
                                    <h5 className="fw-bold text-dark font-size-15 mb-3">
                                        How to Initiate a Return or Exchange in 3 Simple Steps:
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="bg-white p-3 rounded-2 border shadow-2xs h-100">
                                                <span className="badge bg-dark text-white rounded-circle p-2 font-size-12 mb-2 d-inline-block">1</span>
                                                <h6 className="fw-bold font-size-13 text-dark mb-1">Notify Us</h6>
                                                <p className="text-muted font-size-12 mb-0">Message us on WhatsApp with your Order # and item photo within 7 days.</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="bg-white p-3 rounded-2 border shadow-2xs h-100">
                                                <span className="badge bg-dark text-white rounded-circle p-2 font-size-12 mb-2 d-inline-block">2</span>
                                                <h6 className="fw-bold font-size-13 text-dark mb-1">Courier Pickup</h6>
                                                <p className="text-muted font-size-12 mb-0">Our courier collects the returned package directly from your address.</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="bg-white p-3 rounded-2 border shadow-2xs h-100">
                                                <span className="badge bg-dark text-white rounded-circle p-2 font-size-12 mb-2 d-inline-block">3</span>
                                                <h6 className="fw-bold font-size-13 text-dark mb-1">Instant Settlement</h6>
                                                <p className="text-muted font-size-12 mb-0">Replacement dispatched or refund credited to your bKash/Nagad/Card.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-top d-flex flex-column flex-sm-row items-center justify-between gap-3">
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1 font-size-14">Need immediate exchange assistance?</h6>
                                        <p className="text-muted font-size-12 mb-0">Our concierge support team is ready on WhatsApp.</p>
                                    </div>
                                    <a
                                        href={`https://wa.me/${(settings.whatsapp_number || '+8801700000000').replace(/[^0-9]/g, '')}?text=Hi%20ORIO%20STYLE,%20I%20would%20like%20to%20request%20an%20exchange/refund.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-success btn-sm font-size-12 fw-bold px-3 py-2 rounded-1 text-nowrap"
                                    >
                                        <i className="ri-whatsapp-line me-1" /> WhatsApp Returns Desk
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
