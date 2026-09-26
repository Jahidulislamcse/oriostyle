<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => app()->version(),
        'phpVersion' => PHP_VERSION,
        'dbStatus' => 'connected',
        'antiN1Status' => Model::preventsLazyLoading() ? 'enforced' : 'inactive',
    ]);
});
