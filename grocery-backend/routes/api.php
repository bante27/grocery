<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Admin\MessageController;

use App\Http\Controllers\ProductController;

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::post('/contact', [ContactController::class, 'store']);

// Admin message management (protected)


// Simple API route without authentication for testing
Route::get('/admin/messages', function () {
    try {
        // Get all messages from database
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
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/messages', [MessageController::class, 'index']);
    Route::put('/messages/{id}', [MessageController::class, 'update']);
});

Route::prefix('admin')->group(function () {
    Route::get('messages', [MessageController::class, 'index']);
    Route::get('messages/{id}', [MessageController::class, 'show']);
    Route::put('messages/{id}', [MessageController::class, 'update']);
    Route::delete('messages/{id}', [MessageController::class, 'destroy']);
});

// Or if you want to use controller
// Route::get('/admin/messages', [MessageController::class, 'index']);