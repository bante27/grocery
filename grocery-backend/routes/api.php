<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\ProductController;

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

// Public contact route
Route::post('/contact', [ContactController::class, 'store']);

// Simple API route without authentication for testing messages
Route::get('/admin/messages', function () {
    try {
        $messages = \App\Models\ContactMessage::latest()->get();
        return response()->json([
            'success' => true,
            'messages' => $messages,
            'total' => $messages->count(),
            'message' => 'Messages fetched successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
});

// Protected admin routes (require Sanctum auth)
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

    // Messages CRUD
    Route::get('messages', [MessageController::class, 'index']);
    Route::get('messages/{id}', [MessageController::class, 'show']);
    Route::put('messages/{id}', [MessageController::class, 'update']);
    Route::delete('messages/{id}', [MessageController::class, 'destroy']);

    // Reply to a user (via email only, no DB save)
    Route::post('messages/{id}/reply', [MessageController::class, 'reply']);
});
