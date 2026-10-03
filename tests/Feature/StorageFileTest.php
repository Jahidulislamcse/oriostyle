<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StorageFileTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_stream_file_from_public_storage(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('test_logo.png', 100, 100);
        $path = $file->store('brands', 'public');

        $response = $this->get('/storage/' . $path);

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/png');
        $this->assertStringContainsString('max-age=31536000', (string) $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('public', (string) $response->headers->get('Cache-Control'));
    }

    public function test_returns_404_for_non_existent_storage_file(): void
    {
        Storage::fake('public');

        $response = $this->get('/storage/brands/non_existent.png');

        $response->assertNotFound();
    }
}
