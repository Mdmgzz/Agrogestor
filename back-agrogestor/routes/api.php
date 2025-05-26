<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ParcelaController;
use App\Http\Controllers\CultivoController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\AdjuntoController;

// 1) Login público
Route::post('login', [AuthController::class, 'login']);        // → POST /api/login
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user',     [AuthController::class,'me']);        // → GET /api/user
    Route::post('logout',  [AuthController::class,'logout']);    // → POST /api/logout
    Route::post('register',[AuthController::class, 'register']);

    Route::apiResource('usuarios',     UserController::class);
    Route::apiResource('parcelas',     ParcelaController::class);
    Route::apiResource('cultivos',     CultivoController::class);
    Route::apiResource('actividades',  ActividadController::class);
    Route::apiResource('adjuntos',     AdjuntoController::class);
});
