<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Define la ruta home de tu aplicación (si la necesitas).
     */
    public const HOME = '/home';

    /**
     * Aquí configuramos los rate limits de la API.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60);
        });
    }

    /**
     * Registra las rutas de web y api.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            // 1) Carga las rutas de tu API desde routes/api.php
            Route::prefix('api')
                 ->middleware('api')
                 ->group(base_path('routes/api.php'));

            // 2) Carga las rutas web desde routes/web.php
            Route::middleware('web')
                 ->group(base_path('routes/web.php'));
        });
    }
}
