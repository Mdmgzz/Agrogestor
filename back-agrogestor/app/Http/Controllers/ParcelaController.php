<?php

namespace App\Http\Controllers;

use App\Models\Parcela;
use Illuminate\Http\Request;

class ParcelaController extends Controller
{
    public function index()
    {
        return Parcela::with('usuario')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'usuario_id'   => 'required|exists:usuarios,id',
            'propietario'  => 'required|string|max:100',
            'superficie_ha'=> 'required|numeric',
            'geojson'      => 'required|json',
        ]);

        return Parcela::create($data);
    }

    public function show(Parcela $parcela)
    {
        return $parcela->load('usuario','cultivos','actividades');
    }

    public function update(Request $request, Parcela $parcela)
    {
        $data = $request->validate([
            'usuario_id'   => 'sometimes|required|exists:usuarios,id',
            'propietario'  => 'sometimes|required|string|max:100',
            'superficie_ha'=> 'sometimes|required|numeric',
            'geojson'      => 'sometimes|required|json',
        ]);

        $parcela->update($data);
        return $parcela;
    }

    public function destroy(Parcela $parcela)
    {
        $parcela->delete();
        return response()->noContent();
    }
}
