/**
 * Client-side URL sanitizer to prevent Private/Local Network Access permission prompts in Chromium/Android.
 * Ensures loopback (localhost / 127.0.0.1) addresses are never requested from an HTTPS origin.
 */
export function sanitizeImageUrl(url, fallback = '') {
    if (!url || typeof url !== 'string') {
        return fallback;
    }

    const trimmed = url.trim();
    if (!trimmed) {
        return fallback;
    }

    // Strip localhost or 127.0.0.1 origins
    const localhostMatch = trimmed.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(.*)$/i);
    if (localhostMatch) {
        const subPath = localhostMatch[1];
        if (subPath.startsWith('storage/')) {
            return `/${subPath}`;
        }
        return `/storage/${subPath.replace(/^\/+/, '')}`;
    }

    // If it's already an external HTTPS/HTTP CDN
    if (trimmed.startsWith('https://') || (trimmed.startsWith('http://') && !trimmed.includes('localhost') && !trimmed.includes('127.0.0.1'))) {
        return trimmed;
    }

    // Root-relative path (e.g., "/storage/...", "/storefront/...")
    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    // Relative storage path
    return `/storage/${trimmed.replace(/^\/+/, '')}`;
}

export default sanitizeImageUrl;
