<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use Illuminate\Http\Request;

class ActividadController extends Controller
{
    public function index()
    {
        return Actividad::with('parcela','usuario','adjuntos')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'parcela_id'      => 'required|exists:parcelas,id',
            'usuario_id'      => 'required|exists:usuarios,id',
            'tipo_actividad'  => 'required|in:tratamiento,fertilizacion,riego,siembra,cultural',
            'fecha_actividad' => 'required|date',
            'detalles'        => 'required|json',
        ]);

        return Actividad::create($data);
    }

    public function show(Actividad $actividad)
    {
        return $actividad->load('parcela','usuario','adjuntos');
    }

    public function update(Request $request, Actividad $actividad)
    {
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

    public function destroy(Actividad $actividad)
    {
        $actividad->delete();
        return response()->noContent();
    }
}
