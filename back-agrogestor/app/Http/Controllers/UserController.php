<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * GET /api/usuarios
     */
    public function index()
    {
        // Simplemente devolvemos todos los usuarios (ya incluyen el campo 'rol')
        return Usuario::all();
    }

    /**
     * POST /api/usuarios
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'     => 'required|string|max:100',
            'apellidos'  => 'required|string|max:100',
            'correo'     => 'required|email|unique:usuarios,correo',
            'contrasena' => 'required|string|min:6',
            // Validamos el enum directamente:
            'rol'        => 'required|in:ADMINISTRADOR,TECNICO_AGRICOLA,INSPECTOR',
        ]);

        // Hasheamos la contraseña
        $data['contrasena'] = Hash::make($data['contrasena']);

        // Creamos y devolvemos el usuario
        return Usuario::create($data);
    }

    /**
     * GET /api/usuarios/{usuario}
     */
    public function show(Usuario $usuario)
    {
        // Devuelve el usuario; ya trae el campo 'rol'
        return $usuario;
    }

    /**
     * PUT /api/usuarios/{usuario}
     */
    public function update(Request $request, Usuario $usuario)
    {
        $data = $request->validate([
            'nombre'     => 'sometimes|required|string|max:100',
            'apellidos'  => 'sometimes|required|string|max:100',
            'correo'     => 'sometimes|required|email|unique:usuarios,correo,' . $usuario->id,
            'contrasena' => 'nullable|string|min:6',
            'rol'        => 'sometimes|required|in:ADMINISTRADOR,TECNICO_AGRICOLA,INSPECTOR',
        ]);

        // Si viene contraseña, la hasheamos; si no, la quitamos del array
        if (!empty($data['contrasena'])) {
            $data['contrasena'] = Hash::make($data['contrasena']);
        } else {
            unset($data['contrasena']);
        }

        // Actualizamos y devolvemos
        $usuario->update($data);
        return $usuario;
    }

    /**
     * DELETE /api/usuarios/{usuario}
     */
    public function destroy(Usuario $usuario)
    {
        $usuario->delete();
        return response()->noContent();
    }
}
