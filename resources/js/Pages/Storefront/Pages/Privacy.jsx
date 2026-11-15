import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function Privacy({ settings = {} }) {
    const siteName = settings.site_name || 'ORIO STYLE';
    const title = settings.privacy_title || 'Privacy Policy';
    const content = settings.privacy_content || '';

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
                                Privacy Policy
                            </li>
                        </ol>
                    </nav>
                    <h1 className="fw-black display-6 text-uppercase tracking-tight text-dark mb-2">
                        {title}
                    </h1>
                    <p className="lead text-muted mb-0 font-size-14">
                        Your Privacy & Data Protection Commitment • Secure SSL & PCI-DSS Compliant
                    </p>
                </div>
            </section>

            {/* Privacy Document Content */}
            <section className="py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-9">
                            <div className="bg-white p-4 p-md-5 rounded-3 border border-slate-200 shadow-xs">
                                <div className="border-bottom pb-3 mb-4 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="ri-shield-check-line text-success fs-4" />
                                        <span className="fw-bold font-size-14 text-dark text-uppercase">
                                            Patron Data Privacy Charter
                                        </span>
                                    </div>
                                    <span className="badge bg-success-subtle text-success border border-success-subtle font-size-11">
                                        Encrypted 256-Bit
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
                                            At ORIO STYLE LTD, protecting your privacy and personal data is our foundational commitment.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-5 pt-4 border-top bg-light p-4 rounded-3 d-flex flex-column flex-sm-row items-center justify-between gap-3">
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1 font-size-14">Request Data Export or Deletion</h6>
                                        <p className="text-muted font-size-12 mb-0">Exercise your rights under data privacy regulations.</p>
                                    </div>
                                    <a
                                        href={`mailto:${settings.support_email || 'privacy@oriostyle.com'}`}
                                        className="btn btn-dark btn-sm font-size-12 fw-bold px-3 py-2 rounded-1 text-nowrap"
                                    >
                                        Contact Privacy Officer
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
