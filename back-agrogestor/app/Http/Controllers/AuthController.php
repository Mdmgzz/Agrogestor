<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // 1) Registro
    public function register(Request $req)
    {
        $data = $req->validate([
            'nombre'     => 'required|string|max:100',
            'apellidos'  => 'required|string|max:100',
            'correo'     => 'required|email|unique:usuarios,correo',
            'contrasena' => 'required|string|min:6',
            'rol'        => 'sometimes|required|in:ADMINISTRADOR,TECNICO_AGRICOLA,INSPECTOR',
        ]);

        //$data['contrasena'] = Hash::make($data['contrasena']);
        $user = Usuario::create($data);
        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json(['user'=>$user,'token'=>$token], 201);
    }

    // 2) Login
    public function login(Request $req)
    {
        $creds = $req->validate([
            'correo'     => 'required|email',
            'contrasena' => 'required',
        ]);

        $user = Usuario::where('correo', $creds['correo'])->first();
        if (! $user || ! Hash::check($creds['contrasena'], $user->contrasena)) {
            return response()->json(['message'=>'Credenciales inválidas'], 401);
        }

        $token = $user->createToken('api_token')->plainTextToken;
        return response()->json(['user'=>$user,'token'=>$token]);
    }

    // 3) Logout
    public function logout(Request $req)
    {
        $req->user()->tokens()->delete();
        return response()->json(['message'=>'Sesión cerrada'], 200);
    }
}
