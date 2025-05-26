<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middleware = [
        // Cors global si quieres (HandleCors lee config/cors.php)
        \Illuminate\Http\Middleware\HandleCors::class,
        \App\Http\Middleware\TrustProxies::class,
        \App\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

       'api' => [
        // 1) Para encriptar y encolar cookies en TODAS las respuestas API
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,

        // 2) Arranca la sesión PHP (sin esto no hay session store)
        \Illuminate\Session\Middleware\StartSession::class,

        // 3) Sanctum “stateful” para tus rutas SPA
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,

        // 4) CSRF: valida el header X-XSRF-TOKEN utilizando la sesión
        \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,

        // 5) Límite de peticiones y bindings normales de API
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
    ];

    protected $routeMiddleware = [
        'auth'  => \App\Http\Middleware\Authenticate::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    ];
}
