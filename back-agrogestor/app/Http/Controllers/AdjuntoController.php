<?php

namespace App\Http\Controllers;

use App\Models\Adjunto;
use Illuminate\Http\Request;

class AdjuntoController extends Controller
{
    public function index()
    {
        return Adjunto::with('actividad')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'actividad_id'=> 'required|exists:actividades,id',
            'ruta_archivo'=> 'required|string|max:255',
            'tipo_archivo'=> 'required|in:imagen,documento',
        ]);

        return Adjunto::create($data);
    }

    public function show(Adjunto $adjunto)
    {
        return $adjunto->load('actividad');
    }

    public function update(Request $request, Adjunto $adjunto)
    {
        $data = $request->validate([
            'actividad_id'=> 'sometimes|required|exists:actividades,id',
            'ruta_archivo'=> 'sometimes|required|string|max:255',
            'tipo_archivo'=> 'sometimes|required|in:imagen,documento',
        ]);

        $adjunto->update($data);
        return $adjunto;
    }

    public function destroy(Adjunto $adjunto)
    {
        $adjunto->delete();
        return response()->noContent();
    }
}
