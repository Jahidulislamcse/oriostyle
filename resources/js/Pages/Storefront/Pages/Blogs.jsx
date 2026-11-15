import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function Blogs({ settings = {}, posts = [] }) {
    const siteName = settings.site_name || 'ORIO STYLE';
    const title = settings.blogs_title || 'ORIO Journal & Style Editorial';
    const subtitle = settings.blogs_subtitle || 'Curated narratives on luxury tailoring, seasonal styling inspiration, and textile craftsmanship.';

    const defaultPosts = [
        {
            id: 1,
            title: 'The Architecture of the Perfect Executive Shirt',
            category: 'Tailoring & Craft',
            read_time: '4 min read',
            date: 'Nov 12, 2026',
            image: '/storefront/img/blog/1.jpg',
            excerpt: 'An insider look into collar spread geometry, French plackets, and 120s two-ply Egyptian cotton weaves that define boardroom dominance.',
            content: 'A luxury shirt is not merely stitched; it is engineered. The collar structure must retain its posture under a tailored blazer without wilting. At ORIO STYLE, we utilize high-density interlinings and genuine mother-of-pearl buttons, ensuring every shirt maintains its crisp architecture through countless executive meetings.\n\nFrom the precise 22-stitches-per-inch seam tension to split-yoke shoulder mobility, our master tailors preserve classical savile row techniques adapted for the contemporary Asian climate.',
        },
        {
            id: 2,
            title: 'Festive Elegance: The Heritage of Jacquard Silk Panjabi',
            category: 'Ethnic Couture',
            read_time: '5 min read',
            date: 'Nov 08, 2026',
            image: '/storefront/img/blog/2.jpg',
            excerpt: 'Exploring how traditional jacquard handloom motifs merge with contemporary slim-cut silhouettes for modern celebrations.',
            content: 'The traditional Panjabi has evolved into a global symbol of refined ethnic luxury. By combining lightweight semi-pure silk jacquard with subtle metallic threadwork along the placket, ORIO STYLE Panjabis offer royal distinction while keeping you comfortable through extended festive evenings.\n\nEach garment undergoes three rounds of steam shaping and hand-finished button loop alignment, guaranteeing unmatched grace during Eid, weddings, and grand occasions.',
        },
        {
            id: 3,
            title: 'Caring for Selvedge Denim & Premium Natural Cottons',
            category: 'Fabric Care Guide',
            read_time: '3 min read',
            date: 'Nov 02, 2026',
            image: '/storefront/img/blog/3.jpg',
            excerpt: 'Essential care rules from our textile experts to preserve natural indigo dyes and ensure your wardrobe lasts a decade.',
            content: 'Raw and selvedge denim molds to your lifestyle over time, developing unique honeycombs and whiskers. Always wash inside out with cold water and mild detergent.\n\nAvoid machine drying; instead, hang dry in a shaded, well-ventilated space to preserve fabric tension and color brilliance. For formal cotton shirts, always iron while slightly damp using medium-high heat with steam.',
        },
        {
            id: 4,
            title: 'Autumn / Winter Lookbook: The Art of Layering Modern Knitwear',
            category: 'Lookbook & Edits',
            read_time: '4 min read',
            date: 'Oct 28, 2026',
            image: '/storefront/img/blog/4.jpg',
            excerpt: 'Transition from daytime business casual to twilight evening engagements with lightweight merino knits and structured outerwear.',
            content: 'Layering is an art form of textural contrast. Pairing a textured waffle-knit polo under a tailored wool blazer creates an effortless balance of relaxed comfort and executive authority.\n\nExplore our Autumn capsule featuring muted earth tones, slate charcoals, and rich espresso shades designed to harmonize across your entire collection.',
        },
    ];

    const blogList = (posts && posts.length > 0) ? posts : defaultPosts;
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeModalPost, setActiveModalPost] = useState(null);

    // Categories extraction
    const categories = ['All', ...new Set(blogList.map(p => p.category).filter(Boolean))];

    const filteredPosts = selectedCategory === 'All'
        ? blogList
        : blogList.filter(p => p.category === selectedCategory);

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
                                Blogs & Editorial
                            </li>
                        </ol>
                    </nav>
                    <h1 className="fw-black display-6 text-uppercase tracking-tight text-dark mb-2">
                        {title}
                    </h1>
                    <p className="lead text-muted mb-0 font-size-16 max-w-2xl">
                        {subtitle}
                    </p>

                    {/* Category Filter Pills */}
                    <div className="d-flex items-center gap-2 overflow-x-auto pt-4 scrollbar-none">
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`btn btn-sm rounded-pill font-size-12 fw-bold px-3 py-1.5 transition ${
                                    selectedCategory === cat
                                        ? 'btn-dark text-white shadow-xs'
                                        : 'btn-outline-secondary bg-white text-dark'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Grid Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-4">
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="col-lg-4 col-md-6">
                                <article className="card border-0 bg-white rounded-3 overflow-hidden shadow-xs hover-shadow transition h-100 d-flex flex-column">
                                    <div className="position-relative overflow-hidden aspect-video bg-light">
                                        <img
                                            src={post.image || `/storefront/img/blog/${(post.id % 4) + 1}.jpg`}
                                            alt={post.title}
                                            className="w-100 h-100 object-fit-cover transition transform hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.src = '/storefront/img/banner/1.jpg';
                                            }}
                                        />
                                        <span className="position-absolute top-3 start-3 badge bg-dark text-white font-size-11 px-2.5 py-1 fw-bold rounded-pill shadow-xs">
                                            {post.category || 'Editorial'}
                                        </span>
                                    </div>

                                    <div className="card-body p-4 d-flex flex-column flex-grow-1">
                                        <div className="d-flex items-center justify-between text-muted font-size-12 mb-2">
                                            <span><i className="ri-calendar-line me-1" />{post.date}</span>
                                            <span><i className="ri-time-line me-1" />{post.read_time || '3 min'}</span>
                                        </div>

                                        <h4 className="fw-bold fs-5 text-dark mb-2 leading-snug">
                                            {post.title}
                                        </h4>

                                        <p className="text-secondary font-size-13 leading-relaxed mb-4 flex-grow-1">
                                            {post.excerpt}
                                        </p>

                                        <div className="pt-2 border-top">
                                            <button
                                                type="button"
                                                onClick={() => setActiveModalPost(post)}
                                                className="btn btn-link text-dark fw-bold font-size-13 p-0 text-decoration-none d-inline-flex items-center gap-1 hover:text-warning"
                                            >
                                                Read Full Story <i className="ri-arrow-right-line" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Read Article Modal */}
            {activeModalPost && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setActiveModalPost(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 border-0 shadow-2xl overflow-hidden">
                            <div className="modal-header border-bottom px-4 py-3 bg-light">
                                <div className="d-flex items-center gap-2">
                                    <span className="badge bg-warning text-dark font-size-11 fw-bold rounded-pill">
                                        {activeModalPost.category}
                                    </span>
                                    <span className="text-muted font-size-12">
                                        {activeModalPost.date} • {activeModalPost.read_time}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setActiveModalPost(null)}
                                    aria-label="Close"
                                />
                            </div>

                            <div className="modal-body p-4 p-md-5">
                                <h2 className="fw-black text-dark fs-3 mb-4">
                                    {activeModalPost.title}
                                </h2>

                                {activeModalPost.image && (
                                    <div className="rounded-3 overflow-hidden mb-4 shadow-xs" style={{ maxHeight: '380px' }}>
                                        <img
                                            src={activeModalPost.image}
                                            alt={activeModalPost.title}
                                            className="w-100 h-100 object-fit-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/storefront/img/banner/1.jpg';
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="text-secondary font-size-15 leading-relaxed space-y-3">
                                    {(activeModalPost.content || activeModalPost.excerpt || '')
                                        .split('\n\n')
                                        .map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))
                                    }
                                </div>
                            </div>

                            <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between">
                                <span className="text-muted font-size-12">Published by ORIO STYLE Editorial Desk</span>
                                <button
                                    type="button"
                                    className="btn btn-dark btn-sm px-4 py-2 font-size-12 fw-bold rounded-1"
                                    onClick={() => setActiveModalPost(null)}
                                >
                                    Close Story
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
