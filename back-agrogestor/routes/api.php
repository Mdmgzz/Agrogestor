<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ParcelaController;
use App\Http\Controllers\CultivoController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\AdjuntoController;

// 1) Login público
Route::post('login', [AuthController::class, 'login']);
Route::post('password/email',    [AuthController::class, 'sendResetLinkEmail']);
Route::post('password/reset',    [AuthController::class, 'resetPassword']);
Route::post('register',[AuthController::class, 'register']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user',     [AuthController::class,'me']);        
    Route::post('logout',  [AuthController::class,'logout']);    


    Route::apiResource('usuarios',     UserController::class);
    Route::apiResource('parcelas',     ParcelaController::class);
    Route::apiResource('cultivos',     CultivoController::class);
    Route::apiResource('actividades',  ActividadController::class);
    Route::apiResource('adjuntos',     AdjuntoController::class);
});
