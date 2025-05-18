<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use Illuminate\Http\Request;

class ActividadController extends Controller
{
    /**
     * GET /api/actividades
     * - ADMINISTRADOR e INSPECTOR pueden ver todas las actividades.
     * - TECNICO_AGRICOLA ve solo las de sus propias parcelas.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA') {
            return Actividad::with('parcela', 'usuario', 'adjuntos')
                ->where('usuario_id', $user->id)
                ->get();
        }

        // ADMINISTRADOR e INSPECTOR ven todo
        return Actividad::with('parcela', 'usuario', 'adjuntos')->get();
    }

    /**
     * POST /api/actividades
     * - ADMINISTRADOR puede crear cualquier actividad.
     * - TECNICO_AGRICOLA solo puede crear actividades para sus parcelas.
     * - INSPECTOR no puede crear.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para crear actividades.');
        }

        $data = $request->validate([
            'parcela_id'      => 'required|exists:parcelas,id',
            'usuario_id'      => 'required|exists:usuarios,id',
            'tipo_actividad'  => 'required|in:tratamiento,fertilizacion,riego,siembra,cultural',
            'fecha_actividad' => 'required|date',
            'detalles'        => 'required|json',
        ]);

        if ($user->rol === 'TECNICO_AGRICOLA') {
            // Solo permitir crear con su propio usuario y parcela
            if ($data['usuario_id'] !== $user->id) {
                abort(403, 'No puedes crear actividades para otro usuario.');
            }
        }

        return Actividad::create($data);
    }

    /**
     * GET /api/actividades/{actividad}
     * - ADMINISTRADOR e INSPECTOR pueden ver cualquier actividad.
     * - TECNICO_AGRICOLA solo puede ver sus propias actividades.
     */
    public function show(Request $request, Actividad $actividad)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA' && $actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para ver esta actividad.');
        }

        return $actividad->load('parcela', 'usuario', 'adjuntos');
    }

    /**
     * PUT /api/actividades/{actividad}
     * - ADMINISTRADOR puede actualizar cualquier actividad.
     * - TECNICO_AGRICOLA solo puede actualizar sus propias actividades.
     * - INSPECTOR no puede actualizar.
     */
    public function update(Request $request, Actividad $actividad)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para editar actividades.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA' && $actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para editar esta actividad.');
        }

        $data = $request->validate([
            'parcela_id'      => 'sometimes|required|exists:parcelas,id',
            'usuario_id'      => 'sometimes|required|exists:usuarios,id',
            'tipo_actividad'  => 'sometimes|required|in:tratamiento,fertilizacion,riego,siembra,cultural',
            'fecha_actividad' => 'sometimes|required|date',
            'detalles'        => 'sometimes|required|json',
        ]);

        $actividad->update($data);
        return $actividad;
    }

    /**
     * DELETE /api/actividades/{actividad}
     * - ADMINISTRADOR puede borrar cualquier actividad.
     * - TECNICO_AGRICOLA solo puede borrar sus propias actividades.
     * - INSPECTOR no puede borrar.
     */
    public function destroy(Request $request, Actividad $actividad)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para borrar actividades.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA' && $actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para borrar esta actividad.');
        }

        $actividad->delete();
        return response()->noContent();
    }
}
