<?php

namespace App\Http\Controllers;

use App\Models\Adjunto;
use App\Models\Actividad;
use Illuminate\Http\Request;

class AdjuntoController extends Controller
{
    /**
     * GET /api/adjuntos
     * - ADMINISTRADOR e INSPECTOR pueden ver todos los adjuntos.
     * - TECNICO_AGRICOLA ve solo los adjuntos de sus propias actividades.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA') {
            return Adjunto::with('actividad')
                ->whereHas('actividad', function ($q) use ($user) {
                    $q->where('usuario_id', $user->id);
                })
                ->get();
        }

        // ADMINISTRADOR e INSPECTOR ven todo
        return Adjunto::with('actividad')->get();
    }

    /**
     * POST /api/adjuntos
     * - ADMINISTRADOR puede crear adjuntos en cualquier actividad.
     * - TECNICO_AGRICOLA solo puede crear adjuntos para sus actividades.
     * - INSPECTOR no puede crear.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para crear adjuntos.');
        }

        $data = $request->validate([
            'actividad_id' => 'required|exists:actividades,id',
            'ruta_archivo' => 'required|string|max:255',
            'tipo_archivo' => 'required|in:imagen,documento',
        ]);

        if ($user->rol === 'TECNICO_AGRICOLA') {
            $actividad = Actividad::find($data['actividad_id']);
            if (! $actividad || $actividad->usuario_id !== $user->id) {
                abort(403, 'No puedes crear adjuntos para actividades ajenas.');
            }
        }

        return Adjunto::create($data);
    }

    /**
     * GET /api/adjuntos/{adjunto}
     * - ADMINISTRADOR e INSPECTOR pueden ver cualquier adjunto.
     * - TECNICO_AGRICOLA solo puede ver adjuntos de sus actividades.
     */
    public function show(Request $request, Adjunto $adjunto)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA' && $adjunto->actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para ver este adjunto.');
        }

        return $adjunto->load('actividad');
    }

    /**
     * PUT /api/adjuntos/{adjunto}
     * - ADMINISTRADOR puede actualizar cualquier adjunto.
     * - TECNICO_AGRICOLA solo puede actualizar adjuntos de sus actividades.
     * - INSPECTOR no puede actualizar.
     */
    public function update(Request $request, Adjunto $adjunto)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para editar adjuntos.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA' && $adjunto->actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para editar este adjunto.');
        }

        $data = $request->validate([
            'actividad_id' => 'sometimes|required|exists:actividades,id',
            'ruta_archivo' => 'sometimes|required|string|max:255',
            'tipo_archivo' => 'sometimes|required|in:imagen,documento',
        ]);

        if (isset($data['actividad_id']) && $user->rol === 'TECNICO_AGRICOLA') {
            $newActividad = Actividad::find($data['actividad_id']);
            if (! $newActividad || $newActividad->usuario_id !== $user->id) {
                abort(403, 'No puedes re-asignar adjunto a una actividad ajena.');
            }
        }

        $adjunto->update($data);
        return $adjunto;
    }

    /**
     * DELETE /api/adjuntos/{adjunto}
     * - ADMINISTRADOR puede borrar cualquier adjunto.
     * - TECNICO_AGRICOLA solo puede borrar adjuntos de sus actividades.
     * - INSPECTOR no puede borrar.
     */
    public function destroy(Request $request, Adjunto $adjunto)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para borrar adjuntos.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA' && $adjunto->actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para borrar este adjunto.');
        }

        $adjunto->delete();
        return response()->noContent();
    }
}
