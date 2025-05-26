<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    /**
     * Orígenes permitidos, sin comodines.
     */
    protected array $allowedOrigins = [
        'http://localhost:4200',
    ];

    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');

        // Siempre retornamos un response object para poder inyectar headers
        if ($request->getMethod() === 'OPTIONS') {
            $response = response()->noContent(204);
        } else {
            $response = $next($request);
        }

        // Sólo añadimos CORS si viene de un origen que conozcamos
        if ($origin && in_array($origin, $this->allowedOrigins, true)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
        }

        return $response;
    }
}
