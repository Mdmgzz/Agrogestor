<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\EloquentUserProvider;
//use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
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

    \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function ($user, string $token) {
        $frontend = env('FRONTEND_URL', 'http://localhost:4200');
        return "{$frontend}/reset-password?token={$token}&email={$user->correo}";
    });
    }
}
