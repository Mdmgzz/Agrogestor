<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use Illuminate\Http\Request;

class ActividadController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA') {
            // Solo devuelve actividades cuyo cultivo pertenece a una parcela de este técnico
            return Actividad::with('cultivo.parcela', 'usuario', 'adjuntos')
                ->whereHas('cultivo.parcela', fn($q) => $q->where('usuario_id', $user->id))
                ->get();
        }

        return Actividad::with('cultivo.parcela', 'usuario', 'adjuntos')->get();
    }

   public function store(Request $request)
{
    $user = $request->user();

    if ($user->rol === 'INSPECTOR') {
        abort(403, 'No tienes permiso para crear actividades.');
    }

    // Validación de campos (ya teníamos esta parte)
    $data = $request->validate([
        'usuario_id'      => 'required|exists:usuarios,id',
        'cultivo_id'      => 'required|exists:cultivos,id',
        'tipo_actividad'  => 'required|string|max:100',
        'fecha_actividad' => 'required|date',
        'detalles'        => 'nullable|json',
        // NOTA: No validamos archivos aquí (se validarán más adelante)
    ]);

    // Si el rol es TECNICO_AGRICOLA, chequear permiso…
    if ($user->rol === 'TECNICO_AGRICOLA') {
        $pertenece = $user->parcelas()
            ->whereHas('cultivos', fn($q) => $q->where('id', $data['cultivo_id']))
            ->exists();
        if (! $pertenece) {
            abort(403, 'No puedes crear actividades en cultivos ajenos.');
        }
    }

    // Creamos la actividad (los campos ya están en $data)
    $actividad = Actividad::create($data);

    // Ahora, guardamos los archivos adjuntos (si llegan)
    // Supongamos que en el HTML el input file tiene name="adjuntos[]" y multiple
    if ($request->hasFile('adjuntos')) {
        foreach ($request->file('adjuntos') as $archivo) {
            // Validar cada archivo: tamaño, tipo, etc. Aquí un ejemplo simple:
            $path = $archivo->store('adjuntos', 'public');

            // Creamos un registro en la tabla adjuntos:
            $actividad->adjuntos()->create([
                'ruta_archivo' => $path,
                'tipo_archivo' => $archivo->extension() === 'jpg' || $archivo->extension() === 'png'
                                  ? 'imagen'
                                  : 'documento',
            ]);
        }
    }

    return $actividad->load('usuario', 'cultivo.parcela', 'adjuntos');
}

public function show(Request $request, Actividad $actividad)
{
    $user = $request->user();

    // 1) Comprueba permisos igual que antes
    if ($user->rol === 'TECNICO_AGRICOLA' && $actividad->usuario_id !== $user->id) {
        abort(403, 'No tienes permiso para ver esta actividad.');
    }

    // 2) Ahora traemos TODO el modelo + relaciones con with(...):
    $actividadConRelaciones = Actividad::with('cultivo.parcela', 'usuario', 'adjuntos')
                                       ->findOrFail($actividad->id);

    // 3) Devolvemos un JSON explícito que incluya atributos + relaciones
    return response()->json($actividadConRelaciones);
}

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
