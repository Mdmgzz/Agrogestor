<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Registro de usuarios (solo Administradores autenticados).
     * POST /api/register
     */
   /**
     * Registro público de técnicos e inspectores.
     * POST /api/register
     */
    public function register(Request $req)
{
    $data = $req->validate([
        'nombre'     => 'required|string|max:100',
        'apellidos'  => 'required|string|max:100',
        'correo'     => 'required|email|unique:usuarios,correo',
        'contrasena' => 'required|string|min:6',
        'rol'        => 'required|in:TECNICO_AGRICOLA,INSPECTOR',
    ]);

    // DEBUG 1: log del payload
    \Log::info('Register payload: ' . json_encode($data));

    // Intentamos crear el usuario dentro de un try/catch para capturar errores
    try {
        $newUser = Usuario::create($data);
        // DEBUG 2: log del usuario creado
        \Log::info('New user created: ' . json_encode($newUser));
    } catch (\Exception $e) {
        \Log::error('Error creating user: ' . $e->getMessage());
        return response()->json(['message' => 'Error interno'], 500);
    }

    // DEBUG 3: si quieres ver el objeto en Postman, descomenta dd():
    // dd($newUser);

    $token = $newUser->createToken('api_token')->plainTextToken;

    return response()->json([
        'user'  => $newUser,
        'token' => $token,
    ], 201);
}


    /**
     * Login de usuarios.
     * POST /api/login
     */
 public function login(Request $req)
    {
        $data = $req->validate([
            'correo'     => 'required|email',
            'contrasena' => 'required|string',
        ]);

        $user = Usuario::where('correo', $data['correo'])->first();
        if (! $user || ! Hash::check($data['contrasena'], $user->contrasena)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Creamos token personal
        $token = $user->createToken('api_token')->plainTextToken;

        // Devolvemos user + token
        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $req)
    {
        return response()->json($req->user());
    }

    public function logout(Request $request)
    {
        // Obtiene y borra únicamente el token que usó esta petición
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada'], 200);
    }

public function sendResetLinkEmail(Request $request)
{
    // Validamos como antes, el front manda 'email'
    $request->validate(['email' => 'required|email']);

    // Llamamos al broker 'usuarios' y le pasamos 'correo' en lugar de 'email'
    $status = Password::broker('usuarios')->sendResetLink([
        'correo' => $request->input('email'),
    ]);

    // Log para depurar siempre el status
    Log::info("Password reset status for {$request->input('email')}: {$status}");

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json([
            'message' => 'Te hemos enviado un enlace de restablecimiento a tu correo'
        ], 200);
    }

    if ($status === Password::RESET_THROTTLED) {
        return response()->json([
            'message' => __($status),
            'retry_after_seconds' => config('auth.passwords.usuarios.throttle', 60),
        ], 429);
    }

    return response()->json(['message' => __($status)], 400);
}

    public function resetPassword(Request $req)
    {
        // 1) validamos todos los campos
        $req->validate([
            'token'                 => 'required',
            'email'                 => 'required|email|exists:usuarios,correo',
            'contrasena'            => 'required|min:6|confirmed',
        ]);

        // 2) mapeamos de nuevo a 'correo' + resto de credenciales
        $credentials = [
            'correo'                 => $req->input('email'),
            'password'               => $req->input('contrasena'),
            'password_confirmation'  => $req->input('contrasena_confirmation'),
            'token'                  => $req->input('token'),
        ];

        // 3) ejecutamos el reset
        $status = Password::broker('usuarios')->reset(
            $credentials,
            function (Usuario $user, string $password) {
                $user->contrasena = Hash::make($password);
                $user->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Contraseña restablecida'])
            : response()->json(['message' => 'Error restableciendo'], 500);
    }


}
