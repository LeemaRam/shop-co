<?php

use Illuminate\Support\Facades\Route;

// Serve the single-page React app (customer + vendor + admin) for the root.
Route::view('/', 'app');

// SPA fallback: any non-API, unmatched route returns the React app so that
// client-side routes like /shop, /vendor/dashboard, /admin/dashboard work on
// direct navigation and refresh. API 404s remain JSON.
Route::fallback(function () {
    if (request()->is('api/*')) {
        abort(404);
    }

    return view('app');
});
