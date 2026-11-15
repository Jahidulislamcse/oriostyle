import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function StoreLocator({ settings = {}, locations = [] }) {
    const siteName = settings.site_name || 'ORIO STYLE';
    const title = settings.store_locator_title || 'Flagship Stores & Studios';
    const subtitle = settings.store_locator_subtitle || 'Experience ORIO STYLE collections in person at our bespoke retail spaces.';
    const mapEmbedUrl = settings.store_locator_map_embed || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.0474775463456!2d90.40428357597148!3d23.781320387570415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70c0c0587b1%3A0xc48c08182741d40c!2sBanani%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1715000000000!5m2!1sen!2sbd';

    const defaultLocations = [
        {
            name: 'Banani Flagship Studio',
            address: settings.store_address || 'House #12, Road #04, Block-B, Banani, Dhaka-1213',
            phone: settings.support_phone || '+880 1700-000001',
            hours: settings.business_hours || 'Sat - Thu: 10:00 AM - 10:00 PM | Fri: 3:00 PM - 10:00 PM',
            status: 'Open Today',
        },
        {
            name: 'Dhanmondi Experience Centre',
            address: 'Plot #27, Road #16 (New), Dhanmondi, Dhaka-1209',
            phone: '+880 1700-000002',
            hours: 'Sat - Thu: 10:00 AM - 10:00 PM | Fri: 3:00 PM - 10:00 PM',
            status: 'Open Today',
        },
        {
            name: 'Uttara Retail Lounge',
            address: 'Sector #03, Rabindra Sarani, Uttara, Dhaka-1230',
            phone: '+880 1700-000003',
            hours: 'Sat - Thu: 10:00 AM - 10:00 PM | Fri: 3:00 PM - 10:00 PM',
            status: 'Open Today',
        },
    ];

    const storeList = (locations && locations.length > 0) ? locations : defaultLocations;

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
                                Store Locator
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

            {/* Store Locator Content */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-5">
                        {/* Store Location Cards */}
                        <div className="col-lg-5">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h3 className="fw-bold fs-4 text-dark mb-0">
                                    Our Retail Locations ({storeList.length})
                                </h3>
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 font-size-12 fw-semibold rounded-pill">
                                    All Stores Open
                                </span>
                            </div>

                            <div className="space-y-4">
                                {storeList.map((store, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-3 border border-slate-200 shadow-xs hover-shadow transition">
                                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                                            <h5 className="fw-bold font-size-16 text-dark mb-0">
                                                {store.name}
                                            </h5>
                                            <span className="badge bg-warning text-dark font-size-10 text-uppercase fw-bold">
                                                {store.status || 'Active'}
                                            </span>
                                        </div>

                                        <p className="text-secondary font-size-13 mb-3 d-flex align-items-start gap-2">
                                            <i className="ri-map-pin-2-line text-warning fs-5 shrink-0 mt-0.5" />
                                            <span>{store.address}</span>
                                        </p>

                                        <div className="d-flex align-items-center gap-4 text-muted font-size-12 mb-3">
                                            <div className="d-flex align-items-center gap-1.5">
                                                <i className="ri-time-line text-muted" />
                                                <span>{store.hours}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-top d-flex align-items-center justify-content-between gap-2">
                                            <a
                                                href={`tel:${(store.phone || '').replace(/[^0-9+]/g, '')}`}
                                                className="btn btn-sm btn-outline-dark font-size-12 fw-semibold px-3 py-1.5 rounded-1"
                                            >
                                                <i className="ri-phone-line me-1" /> {store.phone}
                                            </a>
                                            <a
                                                href={`https://wa.me/${(store.phone || '').replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-success font-size-12 fw-semibold px-3 py-1.5 rounded-1"
                                            >
                                                <i className="ri-whatsapp-line me-1" /> WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stylist Appointment Notice Card */}
                            <div className="mt-4 p-4 rounded-3 bg-dark text-white shadow-sm border border-secondary">
                                <div className="d-flex items-center gap-3 mb-2">
                                    <i className="ri-vip-crown-2-line text-warning fs-3" />
                                    <h5 className="fw-bold mb-0 text-white font-size-15">Private Wardrobe Consultation</h5>
                                </div>
                                <p className="text-white-50 font-size-12 mb-3">
                                    Schedule a complimentary 1-on-1 styling appointment with our master tailors at any of our flagship branches.
                                </p>
                                <a
                                    href={`https://wa.me/${(settings.whatsapp_number || '+8801700000000').replace(/[^0-9]/g, '')}?text=Hi%20ORIO%20STYLE,%20I%20would%20like%20to%20book%20a%20private%20styling%20session.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-warning text-dark fw-bold btn-sm font-size-12 px-3 py-2 w-100 rounded-1"
                                >
                                    Book Private Consultation
                                </a>
                            </div>
                        </div>

                        {/* Interactive Google Map Column */}
                        <div className="col-lg-7">
                            <div className="bg-white p-3 rounded-3 border border-slate-200 shadow-xs h-100 d-flex flex-column">
                                <div className="d-flex align-items-center justify-content-between mb-3 px-2 pt-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="ri-compass-discover-line text-warning fs-5" />
                                        <span className="fw-bold font-size-14 text-dark">Interactive Map View</span>
                                    </div>
                                    <span className="text-muted font-size-12">Click and drag to explore area</span>
                                </div>

                                <div className="rounded-2 overflow-hidden flex-grow-1 border" style={{ minHeight: '480px' }}>
                                    <iframe
                                        src={mapEmbedUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, minHeight: '480px' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="ORIO STYLE Store Location Map"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
