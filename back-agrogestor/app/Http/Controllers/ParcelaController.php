<?php

namespace App\Http\Controllers;

use App\Models\Parcela;
use Illuminate\Http\Request;

class ParcelaController extends Controller
{
    /**
     * GET /api/parcelas
     * - ADMINISTRADOR e INSPECTOR pueden ver todas.
     * - TECNICO_AGRICOLA ve solo sus propias parcelas.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA') {
            return Parcela::with('usuario')
                ->where('usuario_id', $user->id)
                ->get();
        }

        // ADMINISTRADOR e INSPECTOR ven todo
        return Parcela::with('usuario')->get();
    }

    /**
     * POST /api/parcelas
     * - ADMINISTRADOR puede crear para cualquier usuario.
     * - TECNICO_AGRICOLA solo puede crear sus propias parcelas.
     * - INSPECTOR no puede crear.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para crear parcelas.');
        }

        $data = $request->validate([
            'usuario_id'   => 'required|exists:usuarios,id',
            'nombre'       => 'required|string|max:100',
            'propietario'  => 'required|string|max:100',
            'superficie_ha'=> 'required|numeric',
        ]);

        if ($user->rol === 'TECNICO_AGRICOLA') {
            // Forzamos usuario_id al del técnico
            $data['usuario_id'] = $user->id;
        }

        return Parcela::create($data);
    }

    /**
     * GET /api/parcelas/{parcela}
     * - ADMINISTRADOR e INSPECTOR pueden ver cualquier parcela.
     * - TECNICO_AGRICOLA solo puede ver su propia parcela.
     */
    public function show(Request $request, Parcela $parcela)
    {
        $user = $request->user();

        if ($user->rol === 'TECNICO_AGRICOLA' && $parcela->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para ver esta parcela.');
        }

        // Carga relaciones necesarias
        return $parcela->load('usuario', 'cultivos');
    }

    /**
     * PUT /api/parcelas/{parcela}
     * - ADMINISTRADOR puede actualizar cualquier parcela.
     * - TECNICO_AGRICOLA solo puede actualizar su propia parcela.
     * - INSPECTOR no puede actualizar.
     */
    public function update(Request $request, Parcela $parcela)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para editar parcelas.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA' && $parcela->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para editar esta parcela.');
        }

        $data = $request->validate([
            'usuario_id'   => 'sometimes|required|exists:usuarios,id',
            'nombre'       => 'sometimes|required|string|max:100',
            'propietario'  => 'sometimes|required|string|max:100',
            'superficie_ha'=> 'sometimes|required|numeric',
        ]);

        // Si es técnico, forzamos usuario_id
        if ($user->rol === 'TECNICO_AGRICOLA') {
            unset($data['usuario_id']);
        }

        $parcela->update($data);
        return $parcela;
    }

    /**
     * DELETE /api/parcelas/{parcela}
     * - ADMINISTRADOR puede borrar cualquier parcela.
     * - TECNICO_AGRICOLA solo puede borrar su propia parcela.
     * - INSPECTOR no puede borrar.
     */
    public function destroy(Request $request, Parcela $parcela)
    {
        $user = $request->user();

        if ($user->rol === 'INSPECTOR') {
            abort(403, 'No tienes permiso para borrar parcelas.');
        }

        if ($user->rol === 'TECNICO_AGRICOLA' && $parcela->usuario_id !== $user->id) {
            abort(403, 'No tienes permiso para borrar esta parcela.');
        }

        $parcela->delete();
        return response()->noContent();
    }
}
