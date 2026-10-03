<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StorageFileController extends Controller
{
    /**
     * Stream public storage file if direct web server symlink fails or is forbidden.
     */
    public function show(string $path): BinaryFileResponse|Response
    {
        // Sanitize path to prevent directory traversal
        $cleanPath = ltrim(str_replace(['../', '..\\', "\0"], '', $path), '/');

        $disk = Storage::disk('public');
        if (!$disk->exists($cleanPath)) {
            abort(404, 'File not found in storage.');
        }

        $fullPath = $disk->path($cleanPath);
        $mimeType = $disk->mimeType($cleanPath) ?? 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
