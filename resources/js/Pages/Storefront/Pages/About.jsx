import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function About({ settings = {} }) {
    const siteName = settings.site_name || 'ORIO STYLE';
    const title = settings.about_title || 'About ORIO STYLE';
    const subtitle = settings.about_subtitle || 'Crafting Contemporary Elegance & Everyday Luxury';
    const content = settings.about_content || '';
    const mission = settings.about_mission || '';
    const vision = settings.about_vision || '';

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
                                About Us
                            </li>
                        </ol>
                    </nav>
                    <h1 className="fw-black display-6 text-uppercase tracking-tight text-dark mb-2">
                        {title}
                    </h1>
                    <p className="lead text-muted mb-0 font-size-16 max-w-2xl">
                        {subtitle}
                    </p>
                </div>
            </section>

            {/* Main Narrative Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6">
                            <div className="pe-lg-4">
                                <span className="badge bg-warning text-dark px-3 py-1.5 text-uppercase fw-bold font-size-12 rounded-pill mb-3">
                                    Our Heritage & Identity
                                </span>
                                <h2 className="fw-bold fs-2 text-dark mb-4">
                                    Designed for Distinct Presence. Tailored Without Compromise.
                                </h2>

                                {paragraphs.length > 0 ? (
                                    paragraphs.map((p, idx) => (
                                        <p key={idx} className="text-secondary font-size-15 leading-relaxed mb-3">
                                            {p}
                                        </p>
                                    ))
                                ) : (
                                    <>
                                        <p className="text-secondary font-size-15 leading-relaxed mb-3">
                                            Founded with a singular vision to redefine luxury fashion in Bangladesh, ORIO STYLE blends heritage tailoring with modern, forward-thinking silhouettes.
                                        </p>
                                        <p className="text-secondary font-size-15 leading-relaxed mb-3">
                                            Each garment is an embodiment of precision—from hand-selected Egyptian Giza cottons to rich jacquard silks and authentic selvedge denim. We believe luxury should be tactile, enduring, and effortlessly versatile.
                                        </p>
                                    </>
                                )}

                                <div className="mt-4 pt-2">
                                    <Link href="/shop" className="btn btn-dark px-4 py-2.5 fw-bold text-uppercase font-size-13 rounded-1 shadow-sm">
                                        Explore Our Catalog <i className="ri-arrow-right-line ms-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="position-relative">
                                <div className="rounded-3 overflow-hidden shadow-lg border border-light">
                                    <img
                                        src="/storefront/img/common/about-1.png"
                                        alt="About ORIO STYLE Tailoring"
                                        className="img-fluid w-100 object-fit-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '/storefront/img/banner/1.jpg';
                                        }}
                                    />
                                </div>
                                <div className="position-absolute bottom-0 start-0 bg-dark text-white p-3 p-sm-4 rounded-3 m-3 shadow-lg border border-secondary" style={{ maxWidth: '320px' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-warning text-dark p-2 rounded-2 fs-4 fw-bold">
                                            <i className="ri-medal-line" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1 text-white font-size-14">100% Guaranteed Quality</h6>
                                            <p className="mb-0 text-white-50 font-size-12">Bespoke construction & handpicked textiles</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Split Cards */}
            <section className="py-5 bg-light border-top border-bottom">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="bg-white p-4 p-md-5 rounded-3 border border-light shadow-sm h-100">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-center fs-3 p-3">
                                        <i className="ri-compass-3-line" />
                                    </div>
                                    <h4 className="fw-bold mb-0 text-dark">Our Mission</h4>
                                </div>
                                <p className="text-secondary font-size-15 leading-relaxed mb-0">
                                    {mission || 'To deliver uncompromising sartorial excellence and authentic contemporary design, empowering our patrons to express understated elegance with confidence.'}
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="bg-white p-4 p-md-5 rounded-3 border border-light shadow-sm h-100">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-center fs-3 p-3">
                                        <i className="ri-eye-line" />
                                    </div>
                                    <h4 className="fw-bold mb-0 text-dark">Our Vision</h4>
                                </div>
                                <p className="text-secondary font-size-15 leading-relaxed mb-0">
                                    {vision || 'To become South Asia’s benchmark luxury lifestyle house, celebrated globally for ethical craftsmanship, fabric innovation, and timeless sophistication.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4 Pillars of Excellence */}
            <section className="py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="text-warning fw-bold text-uppercase font-size-12 tracking-wider d-block mb-1">
                            The ORIO Standard
                        </span>
                        <h2 className="fw-black text-dark text-uppercase fs-3">
                            Pillars of Craftsmanship
                        </h2>
                    </div>

                    <div className="row g-4 text-center">
                        <div className="col-lg-3 col-sm-6">
                            <div className="p-4 rounded-3 border border-light bg-white shadow-xs h-100">
                                <div className="fs-1 text-dark mb-3">
                                    <i className="ri-t-shirt-air-line" />
                                </div>
                                <h5 className="fw-bold font-size-16 mb-2">Egyptian Giza Cottons</h5>
                                <p className="text-muted font-size-13 mb-0">
                                    Extra-long staple cotton yarns woven to high-density counts for breathability and silky drape.
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-sm-6">
                            <div className="p-4 rounded-3 border border-light bg-white shadow-xs h-100">
                                <div className="fs-1 text-dark mb-3">
                                    <i className="ri-scissors-2-line" />
                                </div>
                                <h5 className="fw-bold font-size-16 mb-2">Master Tailoring</h5>
                                <p className="text-muted font-size-13 mb-0">
                                    Calibrated shoulder tapers, clean French seams, and resilient collar architecture engineered to last.
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-sm-6">
                            <div className="p-4 rounded-3 border border-light bg-white shadow-xs h-100">
                                <div className="fs-1 text-dark mb-3">
                                    <i className="ri-plant-line" />
                                </div>
                                <h5 className="fw-bold font-size-16 mb-2">Ethical Production</h5>
                                <p className="text-muted font-size-13 mb-0">
                                    Fair artisan compensation, zero sweatshop policy, and minimal-waste fabric pattern cutting.
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-sm-6">
                            <div className="p-4 rounded-3 border border-light bg-white shadow-xs h-100">
                                <div className="fs-1 text-dark mb-3">
                                    <i className="ri-shield-star-line" />
                                </div>
                                <h5 className="fw-bold font-size-16 mb-2">Lifetime Trust</h5>
                                <p className="text-muted font-size-13 mb-0">
                                    Every garment inspected by master QA specialists before sealed dispatch to your doorstep.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
