<?php

namespace App\Http\Controllers;

use App\Models\Cultivo;
use Illuminate\Http\Request;

class CultivoController extends Controller
{
    /**
     * GET /api/cultivos
     * - ADMINISTRADOR e INSPECTOR pueden ver todos los cultivos.
     * - TECNICO_AGRICOLA ve solo los cultivos de sus propias parcelas.
     * 
     * Siempre cargamos la relación parcela.usuario para que el front
     * pueda mostrar el nombre completo del propietario.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Base query con relación anidada
        $query = Cultivo::with('parcela.usuario');

        // Si es técnico, filtramos sus propias parcelas
        if ($user->rol === 'TECNICO_AGRICOLA') {
            $query->whereHas('parcela', function($q) use ($user) {
                $q->where('usuario_id', $user->id);
            });
        }

        return $query->get();
    }

    /**
     * POST /api/cultivos
     * - ADMINISTRADOR puede crear cultivos en cualquier parcela y asignarles un usuario.
     * - TECNICO_AGRICOLA solo puede crear cultivos en sus propias parcelas, 
     *   y el usuario_id de ese cultivo será siempre el técnico mismo.
     * - INSPECTOR no puede crear.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para crear cultivos.');
        }

        $rules = [
            'parcela_id'    => 'required|exists:parcelas,id',
            'variedad'      => 'required|string|max:100',
            'fecha_siembra' => 'required|date',
            'superficie_ha' => 'required|numeric|min:0',
            'latitud'       => 'nullable|numeric',
            'longitud'      => 'nullable|numeric',
        ];

        if ($user->rol === 'ADMINISTRADOR') {
            $rules['usuario_id'] = 'required|exists:usuarios,id';
        }

        $data = $request->validate($rules);

        if ($user->rol === 'TECNICO_AGRICOLA') {
            $data['usuario_id'] = $user->id;

            $pertenece = $user->parcelas()
                ->where('id', $data['parcela_id'])
                ->exists();

            if (! $pertenece) {
                abort(403, 'No puedes crear cultivos en parcelas ajenas.');
            }
        }

        $cultivo = Cultivo::create($data);

        // Devolvemos con relación cargada
        return $cultivo->load('parcela.usuario');
    }

    /**
     * GET /api/cultivos/{cultivo}
     * - ADMINISTRADOR e INSPECTOR pueden ver cualquier cultivo.
     * - TECNICO_AGRICOLA solo puede ver cultivos de sus parcelas.
     */
    public function show(Request $request, Cultivo $cultivo)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA' 
            && $cultivo->parcela->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para ver este cultivo.');
        }

        return $cultivo->load('parcela.usuario');
    }

    /**
     * PUT /api/cultivos/{cultivo}
     * - ADMINISTRADOR puede actualizar cualquier cultivo.
     * - TECNICO_AGRICOLA solo puede actualizar cultivos de sus parcelas,
     *   pero no puede cambiar el usuario_id.
     * - INSPECTOR no puede actualizar.
     */
    public function update(Request $request, Cultivo $cultivo)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para editar cultivos.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA' 
            && $cultivo->parcela->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para editar este cultivo.');
        }

        $rules = [
            'parcela_id'    => 'sometimes|required|exists:parcelas,id',
            'variedad'      => 'sometimes|required|string|max:100',
            'fecha_siembra' => 'sometimes|required|date',
            'superficie_ha' => 'sometimes|required|numeric|min:0',
            'latitud'       => 'sometimes|nullable|numeric',
            'longitud'      => 'sometimes|nullable|numeric',
        ];

        if ($user->rol === 'ADMINISTRADOR') {
            $rules['usuario_id'] = 'sometimes|required|exists:usuarios,id';
        }

        $data = $request->validate($rules);

        if ($user->rol === 'TECNICO_AGRICOLA') {
            unset($data['usuario_id']);
        }

        $cultivo->update($data);

        return $cultivo->load('parcela.usuario');
    }

    /**
     * DELETE /api/cultivos/{cultivo}
     * - ADMINISTRADOR puede borrar cualquier cultivo.
     * - TECNICO_AGRICOLA solo puede borrar cultivos de sus parcelas.
     * - INSPECTOR no puede borrar.
     */
    public function destroy(Request $request, Cultivo $cultivo)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para borrar cultivos.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA' 
            && $cultivo->parcela->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para borrar este cultivo.');
        }

        $cultivo->delete();

        return response()->noContent();
    }
}
