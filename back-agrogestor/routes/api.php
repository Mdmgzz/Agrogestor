<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

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
    // Cierra sesión (elimina todos los tokens del usuario)
    Route::post('logout', [AuthController::class, 'logout']);

    // CRUD completo de usuarios:
    //   GET    /api/usuarios        → index()
    //   POST   /api/usuarios        → store()
    //   GET    /api/usuarios/{id}   → show()
    //   PUT    /api/usuarios/{id}   → update()
    //   DELETE /api/usuarios/{id}   → destroy()
    Route::apiResource('usuarios', UserController::class);
});
