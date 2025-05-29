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
        'geojson'
    ];

    /**
     * La parcela pertenece a un usuario (quien la registró).
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * La parcela puede tener muchos cultivos.
     */
    public function cultivos()
    {
        return $this->hasMany(Cultivo::class, 'parcela_id');
    }

    /**
     * La parcela puede tener muchas actividades.
     */
    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'parcela_id');
    }
}
