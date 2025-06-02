<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ParcelaController;
use App\Http\Controllers\CultivoController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\AdjuntoController;
use App\Http\Controllers\DashboardController;

// Rutas públicas de autenticación
Route::post('login', [AuthController::class, 'login']);
Route::post('password/email',    [AuthController::class, 'sendResetLinkEmail']);
Route::post('password/reset',    [AuthController::class, 'resetPassword']);
Route::post('register',[AuthController::class, 'register']);

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('dashboard/admin-stats', [DashboardController::class, 'adminStats']);
    Route::get('user',     [AuthController::class,'me']);
    Route::post('logout',  [AuthController::class,'logout']);
    Route::apiResource('usuarios',     UserController::class);
    Route::apiResource('parcelas',     ParcelaController::class);
    Route::apiResource('cultivos',     CultivoController::class);
    Route::apiResource('actividades', ActividadController::class)
     ->parameters(['actividades' => 'actividad']);
    Route::apiResource('adjuntos',     AdjuntoController::class);
});
