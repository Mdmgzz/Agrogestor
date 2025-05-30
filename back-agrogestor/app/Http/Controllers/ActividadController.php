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
        // Solo cultivos del técnico
        return Actividad::with('cultivo.parcela')
            ->whereHas('cultivo.parcela', fn($q) => $q->where('usuario_id', $user->id))
            ->get();
    }

    return Actividad::with('cultivo.parcela', 'usuario')->get();
}

public function store(Request $request)
{
    $user = $request->user();

    if ($user->rol === 'INSPECTOR') {
        abort(403, 'No tienes permiso para crear actividades.');
    }

    $data = $request->validate([
        'usuario_id'      => 'required|exists:usuarios,id',
        'cultivo_id'      => 'required|exists:cultivos,id',
        'tipo_actividad'  => 'required|string|max:100',
        'fecha_actividad' => 'required|date',
        'detalles'        => 'nullable|json',
    ]);

    if ($user->rol === 'TECNICO_AGRICOLA') {
        // Verificar que el cultivo pertenece a una parcela del técnico
        $pertenece = $user->parcelas()
            ->whereHas('cultivos', fn($q) => $q->where('id', $data['cultivo_id']))
            ->exists();

        if (! $pertenece) {
            abort(403, 'No puedes crear actividades en cultivos ajenos.');
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
