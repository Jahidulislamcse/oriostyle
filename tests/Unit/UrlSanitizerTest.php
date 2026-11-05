<?php

namespace Tests\Unit;

use App\Support\UrlSanitizer;
use PHPUnit\Framework\TestCase;

class UrlSanitizerTest extends TestCase
{
    public function test_sanitizes_localhost_and_loopback_urls(): void
    {
        $this->assertEquals(
            '/storage/categories/xyz.jpg',
            UrlSanitizer::sanitize('http://localhost:8000/storage/categories/xyz.jpg')
        );

        $this->assertEquals(
            '/storage/categories/xyz.jpg',
            UrlSanitizer::sanitize('https://localhost:8000/storage/categories/xyz.jpg')
        );

        $this->assertEquals(
            '/storage/products/abc.png',
            UrlSanitizer::sanitize('http://127.0.0.1:8000/storage/products/abc.png')
        );

        $this->assertEquals(
            '/storage/products/abc.png',
            UrlSanitizer::sanitize('http://127.0.0.1/storage/products/abc.png')
        );
    }

    public function test_preserves_external_and_relative_paths(): void
    {
        $this->assertEquals(
            '/storefront/img/hero/1.jpg',
            UrlSanitizer::sanitize('/storefront/img/hero/1.jpg')
        );

        $this->assertEquals(
            '/storage/products/1.jpg',
            UrlSanitizer::sanitize('products/1.jpg')
        );

        $this->assertEquals(
            'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            UrlSanitizer::sanitize('https://res.cloudinary.com/demo/image/upload/sample.jpg')
        );
    }

    public function test_cleans_raw_storage_paths(): void
    {
        $this->assertEquals(
            'categories/xyz.jpg',
            UrlSanitizer::cleanRawPath('http://localhost:8000/storage/categories/xyz.jpg')
        );

        $this->assertEquals(
            'products/abc.png',
            UrlSanitizer::cleanRawPath('http://127.0.0.1:8000/storage/products/abc.png')
        );

        $this->assertEquals(
            'categories/clean.jpg',
            UrlSanitizer::cleanRawPath('categories/clean.jpg')
        );
    }
}
