<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\OrdersController;
use Tymon\JWTAuth\Http\Middleware\Authenticate;

/*
|--------------------------------------------------------------------------
| TEST ROUTE
|--------------------------------------------------------------------------
*/
Route::get('/test', function () {
    return response()->json([
        'status' => true,
        'message' => 'API is working successfully'
    ]);
});

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/contact', [ContactController::class, 'store']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/refresh', [AuthController::class, 'refresh']);

/*
|--------------------------------------------------------------------------
| PUBLIC PRODUCT ROUTES (for viewing products)
|--------------------------------------------------------------------------
*/
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/stats', [ProductController::class, 'stats']); 
    Route::get('/{id}', [ProductController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| JWT AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware(['jwt.auth'])->group(function () {
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Order routes
    Route::post('/orders', [OrdersController::class, 'store']);
    Route::get('/orders', [OrdersController::class, 'index']);
    Route::get('/orders/{id}', [OrdersController::class, 'show']);

    // PRODUCT MANAGEMENT ROUTES
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| ADMIN MESSAGES ROUTES
|--------------------------------------------------------------------------
*/
Route::prefix('admin/messages')->group(function () {
    Route::get('/', [MessageController::class, 'index']);
    Route::get('/stats', [MessageController::class, 'stats']);
    Route::get('/{id}', [MessageController::class, 'show']);
    Route::put('/{id}/toggle-read', [MessageController::class, 'toggleRead']);
    Route::put('/mark-all-read', [MessageController::class, 'markAllRead']);
    Route::post('/{id}/reply', [MessageController::class, 'sendReply']);
    Route::delete('/{id}', [MessageController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| ADMIN PROTECTED ROUTES
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/stats', [UserController::class, 'stats']);
    Route::post('/users/{id}/make-admin', [UserController::class, 'makeAdmin']);
    Route::post('/users/{id}/remove-admin', [UserController::class, 'removeAdmin']);
    Route::post('/users/{id}/restrict', [UserController::class, 'restrict']);
    Route::post('/users/{id}/unrestrict', [UserController::class, 'unrestrict']);
    Route::post('/users/{id}/verify', [UserController::class, 'verify']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

Route::prefix('password')->group(function () {
    Route::post('/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/reset', [AuthController::class, 'resetPassword']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
});
// Admin routes
Route::prefix('admin')->group(function () {
    // Orders
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::get('/orders/stats', [AdminOrderController::class, 'stats']);
});