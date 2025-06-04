<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use Illuminate\Http\Request;

class ActividadController extends Controller
{
    /**
     * GET /api/actividades
     * - ADMINISTRADOR e INSPECTOR ven todas las actividades con cultivos, parcelas, usuario y adjuntos.
     * - TÉCNICO_AGRICOLA ve sólo las actividades cuyos cultivos pertenecen a sus parcelas.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA') {
            // Sólo devuelve actividades cuyo cultivo está en una parcela de este técnico
            return Actividad::with('cultivo.parcela', 'usuario', 'adjuntos')
                ->whereHas('cultivo.parcela', fn($q) => $q->where('usuario_id', $user->id))
                ->get();
        }

        return Actividad::with('cultivo.parcela', 'usuario', 'adjuntos')->get();
    }

    /**
     * POST /api/actividades
     * Crea una nueva actividad y, si llegan archivos en "adjuntos[]", 
     * los almacena en disco y guarda sus registros vinculados.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para crear actividades.');
        }

        // Validación de campos
        $data = $request->validate([
            'usuario_id'      => 'required|exists:usuarios,id',
            'cultivo_id'      => 'required|exists:cultivos,id',
            'tipo_actividad'  => 'required|string|max:100',
            'fecha_actividad' => 'required|date',
            'detalles'        => 'nullable|json',
            // NOTA: No validamos archivos aquí (se validarán más adelante)
        ]);

        // Si el rol es TÉCNICO_AGRICOLA, chequear permiso sobre el cultivo
        if ($user->rol === 'TECNICO_AGRICOLA') {
            $pertenece = $user->parcelas()
                ->whereHas('cultivos', fn($q) => $q->where('id', $data['cultivo_id']))
                ->exists();
            if (!$pertenece) {
                abort(403, 'No puedes crear actividades en cultivos ajenos.');
            }
        }

        // Creamos la actividad
        $actividad = Actividad::create($data);

        // Si llegaron archivos en “adjuntos[]”, los guardamos
        if ($request->hasFile('adjuntos')) {
            foreach ($request->file('adjuntos') as $archivo) {
                // Validar cada archivo: tamaño y tipo
                // (Puedes mover esta validación arriba si deseas reglas más estrictas)
                $path = $archivo->store('actividades/' . $actividad->id, 'public');

                $actividad->adjuntos()->create([
                    'ruta_archivo' => $path,
                    'tipo_archivo' => in_array($archivo->extension(), ['jpg','png','jpeg'])
                                      ? 'imagen'
                                      : 'documento',
                ]);
            }
        }

        // Devolver la actividad recién creada (con relaciones)
        return $actividad->load('usuario', 'cultivo.parcela', 'adjuntos');
    }

    /**
     * GET /api/actividades/{actividad}
     * Muestra una actividad en particular con todas sus relaciones.
     */
    public function show(Request $request, Actividad $actividad)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA' && $actividad->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para ver esta actividad.');
        }

        $actividadConRelaciones = Actividad::with('cultivo.parcela', 'usuario', 'adjuntos')
                                           ->findOrFail($actividad->id);

        return response()->json($actividadConRelaciones);
    }

    /**
     * PUT /api/actividades/{actividad}
     * Actualiza los datos de la actividad (sin gestionar aquí archivos nuevos).
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
            'cultivo_id'      => 'sometimes|required|exists:cultivos,id',
            'usuario_id'      => 'sometimes|required|exists:usuarios,id',
            'tipo_actividad'  => 'sometimes|required|in:tratamiento,fertilizacion,riego,siembra,cultural',
            'fecha_actividad' => 'sometimes|required|date',
            'detalles'        => 'sometimes|required|json',
        ]);

        $actividad->update($data);

        return $actividad->load('cultivo.parcela', 'usuario', 'adjuntos');
    }

    /**
     * DELETE /api/actividades/{actividad}
     * Elimina la actividad (no elimina adjuntos físicos, pero sí registra DB).
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
