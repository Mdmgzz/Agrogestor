<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ParcelaController;
use App\Http\Controllers\CultivoController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\AdjuntoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Prefijo /api aplicado automáticamente y middleware 'api' por defecto.
|
*/

// 1) Login público: cualquiera puede autenticarse y obtener su token
Route::post('login', [AuthController::class, 'login']);

// 2) Grupo protegido con Sanctum: todas estas rutas requieren Bearer Token válido
Route::middleware('auth:sanctum')->group(function () {
    // 2.1) Registro: solo ADMINISTRADOR (el chequeo de rol se hace en el método)
    Route::post('register', [AuthController::class, 'register']);

    // 2.2) Logout del usuario autenticado
    Route::post('logout', [AuthController::class, 'logout']);

    // 2.3) CRUD completo de Usuarios
    Route::apiResource('usuarios', UserController::class);

    // 2.4) CRUD de Parcelas
    Route::apiResource('parcelas', ParcelaController::class);

    // 2.5) CRUD de Cultivos
    Route::apiResource('cultivos', CultivoController::class);

    // 2.6) CRUD de Actividades
    Route::apiResource('actividades', ActividadController::class);

    // 2.7) CRUD de Adjuntos
    Route::apiResource('adjuntos', AdjuntoController::class);
});
