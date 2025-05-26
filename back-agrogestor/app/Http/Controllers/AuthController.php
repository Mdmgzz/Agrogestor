<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Registro de usuarios (solo Administradores autenticados).
     * POST /api/register
     */
    public function register(Request $req)
    {

        $authUser = $req->user();
        if (! $authUser || $authUser->rol !== 'ADMINISTRADOR') {
            abort(403, 'Solo los administradores pueden registrar nuevos usuarios.');
        }

        $data = $req->validate([
            'nombre'     => 'required|string|max:100',
            'apellidos'  => 'required|string|max:100',
            'correo'     => 'required|email|unique:usuarios,correo',
            'contrasena' => 'required|string|min:6',
            'rol'        => 'required|in:ADMINISTRADOR,TECNICO_AGRICOLA,INSPECTOR',
        ]);

        // Una sola vez hash de la contraseña
        //$data['contrasena'] = Hash::make($data['contrasena']);
        $newUser = Usuario::create($data);

        $token = $newUser->createToken('api_token')->plainTextToken;
        return response()->json(['user' => $newUser, 'token' => $token], 201);
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

}
