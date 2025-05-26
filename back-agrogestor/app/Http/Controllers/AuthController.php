<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;

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

    public function logout(Request $req)
    {
        Auth::logout();
        $req->session()->invalidate();
        $req->session()->regenerateToken();
        return response()->json(['message'=>'Sesión cerrada'], 200);
    }

    public function sendResetLinkEmail(Request $req) {
  $req->validate(['correo' => 'required|email|exists:usuarios,correo']);
  $status = Password::sendResetLink(
    $req->only('correo')
  );
  return $status === Password::RESET_LINK_SENT
    ? response()->json(['message' => 'Link enviado'])
    : response()->json(['message' => 'Error enviando link'], 500);
}

public function resetPassword(Request $req) {
  $req->validate([
    'token'    => 'required',
    'correo'   => 'required|email',
    'contrasena' => 'required|min:6|confirmed',
  ]);
  $status = Password::reset(
    [
      'email'                 => $req->correo,
      'password'              => $req->contrasena,
      'password_confirmation' => $req->contrasena_confirmation,
      'token'                 => $req->token,
    ],
    function ($user, $password) {
      $user->contrasena = Hash::make($password);
      $user->save();
    }
  );
  return $status === Password::PASSWORD_RESET
    ? response()->json(['message' => 'Contraseña restablecida'])
    : response()->json(['message' => 'Error restableciendo'], 500);
}

}
