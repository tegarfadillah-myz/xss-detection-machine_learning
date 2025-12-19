<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/', [DashboardController::class, 'index'])->name('home');

// Legacy endpoint (keep if needed, or replace)
Route::post('/check', [DashboardController::class, 'check'])->name('check');

// CRUD endpoints
Route::get('/api/posts', [App\Http\Controllers\PostController::class, 'index']);
Route::post('/api/posts', [App\Http\Controllers\PostController::class, 'store'])
    ->middleware('xss.check');

// Vulnerable Endpoints (No Middleware)
Route::post('/api/vulnerable/posts', [App\Http\Controllers\VulnerableController::class, 'store']);
Route::get('/api/vulnerable/search', [App\Http\Controllers\VulnerableController::class, 'search']);
