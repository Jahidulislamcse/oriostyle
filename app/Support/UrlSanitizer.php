<?php

namespace App\Support;

class UrlSanitizer
{
    /**
     * Sanitize image or file URLs so they never expose loopback/localhost ports to browsers.
     * Prevents browser "Local Network Access" / "Apps on device" permission prompts.
     */
    public static function sanitize(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        $trimmed = trim($path);

        // Strip any localhost / 127.0.0.1 origin (with any port or protocol)
        // e.g. "http://localhost:8000/storage/categories/abc.jpg" -> "/storage/categories/abc.jpg"
        if (preg_match('/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(.*)$/i', $trimmed, $matches)) {
            $subPath = $matches[1];
            if (str_starts_with($subPath, 'storage/')) {
                return '/' . $subPath;
            }
            return '/storage/' . ltrim($subPath, '/');
        }

        // If it's already an external HTTPS/HTTP URL (e.g. S3, Cloudinary, CDN)
        if (str_starts_with($trimmed, 'https://') || (str_starts_with($trimmed, 'http://') && !str_contains($trimmed, 'localhost') && !str_contains($trimmed, '127.0.0.1'))) {
            return $trimmed;
        }

        // Root-relative path (e.g. "/storefront/img/..." or "/storage/...")
        if (str_starts_with($trimmed, '/')) {
            return $trimmed;
        }

        // Relative storage path (e.g. "categories/abc.jpg")
        return '/storage/' . ltrim($trimmed, '/');
    }

    /**
     * Strip any localhost / 127.0.0.1 prefix from raw stored relative paths.
     * e.g. "http://localhost:8000/storage/categories/abc.jpg" -> "categories/abc.jpg"
     */
    public static function cleanRawPath(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        $trimmed = trim($path);

        if (preg_match('/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(?:storage\/)?(.*)$/i', $trimmed, $matches)) {
            return ltrim($matches[1], '/');
        }

        return $trimmed;
    }
}
