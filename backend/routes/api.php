<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CustomerEngagementController;
use App\Http\Controllers\DonHangController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\ReturnRequestController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\VnpayPaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('admin/login', [AdminController::class, 'login']);
Route::post('contact-messages', [CustomerEngagementController::class, 'contact'])->middleware('throttle:5,1');
Route::post('newsletter-subscriptions', [CustomerEngagementController::class, 'subscribe'])->middleware('throttle:5,1');
Route::get('cart', [CartController::class, 'index']);
Route::post('cart/items', [CartController::class, 'storeItem']);
Route::patch('cart/items/{product}', [CartController::class, 'updateItem']);
Route::delete('cart/items/{product}', [CartController::class, 'destroyItem']);
Route::delete('cart', [CartController::class, 'clear']);
Route::get('recommendations', [RecommendationController::class, 'index']);
Route::post('product-views', [RecommendationController::class, 'track'])->middleware('throttle:60,1');
Route::get('certificates/{certificateCode}', [CertificateController::class, 'show']);
Route::get('shipments/track/{trackingNumber}', [ShipmentController::class, 'track']);
Route::get('locations/provinces', [LocationController::class, 'provinces']);
Route::get('locations/provinces/{provinceCode}/wards', [LocationController::class, 'wards']);

Route::get('product-images/{path}', function (string $path) {
    abort_unless(Storage::disk('public')->exists($path), 404);

    return response(Storage::disk('public')->get($path), 200, [
        'Content-Type' => Storage::disk('public')->mimeType($path) ?: 'image/jpeg',
        'Access-Control-Allow-Origin' => '*',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
})->where('path', '.*');

Route::get('return-images/{path}', function (string $path) {
    abort_unless(Storage::disk('public')->exists($path), 404);

    return response(Storage::disk('public')->get($path), 200, [
        'Content-Type' => Storage::disk('public')->mimeType($path) ?: 'image/jpeg',
        'Cache-Control' => 'private, max-age=3600',
    ]);
})->where('path', '.*');

Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show']);
Route::get('products/{product}/reviews', [ProductReviewController::class, 'index']);
Route::post('orders', [OrderController::class, 'store']);
Route::get('payments/vnpay/return', [VnpayPaymentController::class, 'handleReturn']);
Route::get('payments/vnpay/ipn', [VnpayPaymentController::class, 'ipn']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('admin/dashboard', [AdminController::class, 'dashboard']);
    Route::patch('admin/orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
    Route::post('admin/orders/{order}/shipment', [ShipmentController::class, 'create']);
    Route::get('admin/return-requests', [ReturnRequestController::class, 'adminIndex']);
    Route::patch('admin/return-requests/{returnRequest}', [ReturnRequestController::class, 'adminUpdate']);
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{id}', [ProductController::class, 'update']);
    Route::patch('products/{id}', [ProductController::class, 'update']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);
    Route::apiResource('don_hangs', DonHangController::class);
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('change-password', [AuthController::class, 'changePassword']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::middleware('password.changed')->group(function () {
        Route::patch('/user', [AuthController::class, 'updateProfile']);

        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::get('orders/{order}/tracking', [ShipmentController::class, 'show']);
        Route::post('cart/merge', [CartController::class, 'merge']);
        Route::get('return-requests', [ReturnRequestController::class, 'index']);
        Route::post('return-requests', [ReturnRequestController::class, 'store']);
        Route::post('reviews', [ProductReviewController::class, 'store']);
        Route::get('favorites', [FavoriteController::class, 'index']);
        Route::post('favorites/{product}', [FavoriteController::class, 'store']);
        Route::delete('favorites/{product}', [FavoriteController::class, 'destroy']);
    });
});
