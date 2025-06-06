<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;            
use Illuminate\Auth\EloquentUserProvider;          

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Ya no llamamos a registerPolicies() porque no existe aquí.
        // $this->registerPolicies();

        // Ahora sí podemos usar Auth::provider(...) sin que falle.
        Auth::provider('usuarios-custom', function($app, array $config) {
            return new class($app['hash'], $config['model']) extends EloquentUserProvider {
                public function retrieveByCredentials(array $credentials)
                {
                    if (isset($credentials['email'])) {
                        $credentials['correo'] = $credentials['email'];
                        unset($credentials['email']);
                    }
                    return parent::retrieveByCredentials($credentials);
                }
            };
        });
    }
}
