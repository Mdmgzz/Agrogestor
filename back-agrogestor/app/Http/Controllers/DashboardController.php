<?php
namespace App\Http\Controllers;
use App\Models\Usuario;
use App\Models\Parcela;
use App\Models\Cultivo;
use App\Models\Actividad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{

public function adminStats(): JsonResponse
{
    return response()->json([
        'usuarios'    => Usuario::count(),
        'parcelas'    => Parcela::count(),
        'cultivos'    => Cultivo::count(),
        'actividades' => Actividad::count(),
    ]);
}
}