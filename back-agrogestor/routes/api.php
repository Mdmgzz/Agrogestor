<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ParcelaController;
use App\Http\Controllers\CultivoController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\AdjuntoController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Definimos aquí las rutas públicas (login, register, etc.) y las rutas
| protegidas (mediate Sanctum) para usuarios, parcelas, cultivos, actividades
| y adjuntos. 
|
*/

// Rutas públicas de autenticación
Route::post('login', [AuthController::class, 'login']);
Route::post('password/email', [AuthController::class, 'sendResetLinkEmail']);
Route::post('password/reset', [AuthController::class, 'resetPassword']);
Route::post('register', [AuthController::class, 'register']);

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('dashboard/admin-stats', [DashboardController::class, 'adminStats']);
    Route::get('user', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::apiResource('usuarios', UserController::class);
    Route::apiResource('parcelas', ParcelaController::class);
    Route::apiResource('cultivos', CultivoController::class);

    // CRUD actividades
    Route::apiResource('actividades', ActividadController::class)
         ->parameters(['actividades' => 'actividad']);

    // ◀ RUTAS ANIDADAS PARA ADJUNTOS DE UNA ACTIVIDAD ▶
    // Listar todos los adjuntos de la actividad {actividad}
    Route::get(
        'actividades/{actividad}/adjuntos',
        [AdjuntoController::class, 'listarPorActividad']
    );
    // Subir uno o varios archivos PDF a la actividad {actividad}
    Route::post(
        'actividades/{actividad}/adjuntos',
        [AdjuntoController::class, 'subirPorActividad']
    );
    // ◀ FIN DE RUTAS ANIDADAS ▶

    // CRUD “plano” de adjuntos (index, store, show, update, destroy)
    Route::apiResource('adjuntos', AdjuntoController::class);
});
