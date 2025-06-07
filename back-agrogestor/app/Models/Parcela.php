<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parcela extends Model
{
    protected $table = 'parcelas';

    protected $fillable = [
        'usuario_id',
        'nombre',
        'propietario',
        'superficie_ha',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function cultivos()
    {
        return $this->hasMany(Cultivo::class, 'parcela_id');
    }

    // Agregar este método para que ->load('actividades') funcione
    public function actividades()
    {
        // Ajusta el namespace y la FK si tu modelo Actividad está en otra ruta/clase
        return $this->hasMany(\App\Models\Actividad::class, 'parcela_id');
    }
}
