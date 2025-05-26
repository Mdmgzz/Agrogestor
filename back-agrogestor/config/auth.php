<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | Aquí definimos el guard y broker de password por defecto.
    |
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Definimos los guards para nuestra app. El guard "api" usará Sanctum
    | y el provider "usuarios" (nuestra tabla y modelo Usuario).
    |
    */

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'usuarios',
        ],

        'api' => [
            'driver'   => 'sanctum',
            'provider' => 'usuarios',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | Cada provider indica cómo cargamos al usuario. Mantenemos "users" para
    | el guard web y creamos "usuarios" para las peticiones API con Sanctum.
    |
    */

    'providers' => [

        'usuarios' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Usuario::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table'    => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
