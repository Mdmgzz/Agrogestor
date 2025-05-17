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
| Aquí definimos las rutas para tu API REST. Todo lo que pongas aquí
| se cargará bajo el prefijo /api y usando el middleware 'api'.
|
*/

// 1) Rutas públicas de autenticación
Route::post('register', [AuthController::class, 'register']); // Registro de usuario
Route::post('login',    [AuthController::class, 'login']);    // Login y obtención de token

// 2) Rutas protegidas por token Sanctum
Route::middleware('auth:sanctum')->group(function () {
    //Logout
    Route::post('logout', [AuthController::class, 'logout']);

    //CRUD Usuarios
    Route::apiResource('usuarios', UserController::class);

    //CRUD Parcelas
    Route::apiResource('parcelas', ParcelaController::class);

    //CRUD Cultivos
    Route::apiResource('cultivos', CultivoController::class);

    //CRUD Actividades
    Route::apiResource('actividades', ActividadController::class);

    //CRUD Adjuntos
    Route::apiResource('adjuntos', AdjuntoController::class);
});
