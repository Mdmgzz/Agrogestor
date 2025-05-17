<?php

namespace App\Http\Controllers;

use App\Models\Cultivo;
use Illuminate\Http\Request;

class CultivoController extends Controller
{
    public function index()
    {
        return Cultivo::with('parcela')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'parcela_id'   => 'required|exists:parcelas,id',
            'variedad'     => 'required|string|max:100',
            'fecha_siembra'=> 'required|date',
        ]);

        return Cultivo::create($data);
    }

    public function show(Cultivo $cultivo)
    {
        return $cultivo->load('parcela');
    }

    public function update(Request $request, Cultivo $cultivo)
    {
        $data = $request->validate([
            'parcela_id'   => 'sometimes|required|exists:parcelas,id',
            'variedad'     => 'sometimes|required|string|max:100',
            'fecha_siembra'=> 'sometimes|required|date',
        ]);

        $cultivo->update($data);
        return $cultivo;
    }

    public function destroy(Cultivo $cultivo)
    {
        $cultivo->delete();
        return response()->noContent();
    }
}
