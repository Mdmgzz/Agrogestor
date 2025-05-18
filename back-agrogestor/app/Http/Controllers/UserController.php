<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * GET /api/usuarios
     * Sólo ADMINISTRADOR puede listar todos los usuarios.
     */
    public function index(Request $request)
    {
        if ($request->user()->rol !== 'ADMINISTRADOR') {
            abort(403, 'Sólo los administradores pueden listar usuarios.');
        }
        return Usuario::all();
    }

    /**
     * POST /api/usuarios
     * Sólo ADMINISTRADOR puede crear usuarios.
     */
    public function store(Request $request)
    {
        if ($request->user()->rol !== 'ADMINISTRADOR') {
            abort(403, 'Sólo los administradores pueden crear usuarios.');
        }

        $data = $request->validate([
            'nombre'     => 'required|string|max:100',
            'apellidos'  => 'required|string|max:100',
            'correo'     => 'required|email|unique:usuarios,correo',
            'contrasena' => 'required|string|min:6',
            'rol'        => 'required|in:ADMINISTRADOR,TECNICO_AGRICOLA,INSPECTOR',
        ]);

        $data['contrasena'] = Hash::make($data['contrasena']);

        return Usuario::create($data);
    }

    /**
     * GET /api/usuarios/{usuario}
     * Admin puede ver cualquiera; usuarios sólo su propio perfil.
     */
    public function show(Request $request, Usuario $usuario)
    {
        if ($request->user()->rol !== 'ADMINISTRADOR' && $request->user()->id !== $usuario->id) {
            abort(403, 'No tienes permiso para ver este usuario.');
        }
        return $usuario;
    }

    /**
     * PUT /api/usuarios/{usuario}
     * Admin puede actualizar cualquiera; usuarios sólo su propio perfil.
     */
    public function update(Request $request, Usuario $usuario)
    {
        if ($request->user()->rol !== 'ADMINISTRADOR' && $request->user()->id !== $usuario->id) {
            abort(403, 'No tienes permiso para editar este usuario.');
        }

        $data = $request->validate([
            'nombre'     => 'sometimes|required|string|max:100',
            'apellidos'  => 'sometimes|required|string|max:100',
            'correo'     => 'sometimes|required|email|unique:usuarios,correo,' . $usuario->id,
            'contrasena' => 'nullable|string|min:6',
            'rol'        => 'sometimes|required|in:ADMINISTRADOR,TECNICO_AGRICOLA,INSPECTOR',
        ]);

        if (!empty($data['contrasena'])) {
            $data['contrasena'] = Hash::make($data['contrasena']);
        } else {
            unset($data['contrasena']);
        }

        $usuario->update($data);
        return $usuario;
    }

    /**
     * DELETE /api/usuarios/{usuario}
     * Sólo ADMINISTRADOR puede borrar usuarios.
     */
    public function destroy(Request $request, Usuario $usuario)
    {
        if ($request->user()->rol !== 'ADMINISTRADOR') {
            abort(403, 'Sólo los administradores pueden borrar usuarios.');
        }

        $usuario->delete();
        return response()->noContent();
    }
}
