<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 204)
                ->withHeaders($this->corsHeaders());
        }

        return $next($request)
            ->withHeaders($this->corsHeaders());
    }

    protected function corsHeaders(): array
    {
        return [
            'Access-Control-Allow-Origin'      => 'http://localhost:4200',
            'Access-Control-Allow-Methods'     => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers'     => 'Content-Type, X-Requested-With, Authorization',
            'Access-Control-Allow-Credentials' => 'false',
        ];
    }
}
