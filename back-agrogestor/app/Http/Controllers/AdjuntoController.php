<?php

namespace App\Http\Controllers;

use App\Models\Adjunto;
use App\Models\Actividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdjuntoController extends Controller
{
    /**
     * GET /api/adjuntos
     * - ADMINISTRADOR e INSPECTOR pueden ver todos los adjuntos.
     * - TÉCNICO_AGRICOLA ve solo los adjuntos de sus propias actividades.
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
     * - TÉCNICO_AGRICOLA solo puede crear adjuntos para sus actividades.
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
            if (!$actividad || $actividad->usuario_id !== $user->id) {
                abort(403, 'No puedes crear adjuntos para actividades ajenas.');
            }
        }

        return Adjunto::create($data);
    }

    /**
     * GET /api/adjuntos/{adjunto}
     * - ADMINISTRADOR e INSPECTOR pueden ver cualquier adjunto.
     * - TÉCNICO_AGRICOLA solo puede ver adjuntos de sus actividades.
     */
    public function show(Request $request, Adjunto $adjunto)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA'
            && $adjunto->actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para ver este adjunto.');
        }

        return $adjunto->load('actividad');
    }

    /**
     * PUT /api/adjuntos/{adjunto}
     * - ADMINISTRADOR puede actualizar cualquier adjunto.
     * - TÉCNICO_AGRICOLA solo puede actualizar adjuntos de sus actividades.
     * - INSPECTOR no puede actualizar.
     */
    public function update(Request $request, Adjunto $adjunto)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para editar adjuntos.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA'
            && $adjunto->actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para editar este adjunto.');
        }

        $data = $request->validate([
            'actividad_id' => 'sometimes|required|exists:actividades,id',
            'ruta_archivo' => 'sometimes|required|string|max:255',
            'tipo_archivo' => 'sometimes|required|in:imagen,documento',
        ]);

        if (isset($data['actividad_id'])
            && $user->rol === 'TECNICO_AGRICOLA') {
            $nuevaAct = Actividad::find($data['actividad_id']);
            if (!$nuevaAct || $nuevaAct->usuario_id !== $user->id) {
                abort(403, 'No puedes reasignar adjunto a una actividad ajena.');
            }
        }

        $adjunto->update($data);
        return $adjunto;
    }

    /**
     * DELETE /api/adjuntos/{adjunto}
     * - ADMINISTRADOR puede borrar cualquier adjunto.
     * - TÉCNICO_AGRICOLA solo puede borrar adjuntos de sus actividades.
     * - INSPECTOR no puede borrar.
     */
    public function destroy(Request $request, Adjunto $adjunto)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para borrar adjuntos.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA'
            && $adjunto->actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para borrar este adjunto.');
        }

        // Opcional: eliminar el archivo físico del disco
        // Storage::disk('public')->delete($adjunto->ruta_archivo);

        $adjunto->delete();
        return response()->noContent();
    }

    /**
     * ▼ NUEVO ▼
     * GET  /api/actividades/{actividad}/adjuntos
     * Lista todos los adjuntos de la actividad indicada.
     */
    public function listarPorActividad($actividadId)
    {
        $actividad = Actividad::findOrFail($actividadId);

        // Devolvemos todos los adjuntos asociados
        return response()->json(
            $actividad->adjuntos()->get(),
            200
        );
    }

    /**
     * ▼ NUEVO ▼
     * POST /api/actividades/{actividad}/adjuntos
     * Recibe uno o varios archivos PDF y los asocia a la actividad (actividadId).
     */
    public function subirPorActividad(Request $request, $actividadId)
    {
    $request->validate([
        'archivos.*' => 'required|file|mimes:pdf|max:5120',
    ]);

    $actividad = Actividad::findOrFail($actividadId);
    $guardados  = [];

    if ($request->hasFile('archivos')) {
        $folder = "actividades/{$actividad->id}";
        foreach ($request->file('archivos') as $file) {
            // Ahora usamos el nombre original sin prefijo:
            $originalName = $file->getClientOriginalName();

            // Guardamos exactamente con ese nombre en storage/app/public/actividades/{id}/
            $path = $file->storeAs($folder, $originalName, 'public');

            $adj = Adjunto::create([
                'actividad_id' => $actividad->id,
                'ruta_archivo' => $path,
                'tipo_archivo' => 'documento',
            ]);
            $guardados[] = $adj;
        }
    }

    // Devolvemos la lista completa de adjuntos tras la subida
    $todos = Adjunto::where('actividad_id', $actividad->id)->get();
    return response()->json($todos, 200);
}
}
