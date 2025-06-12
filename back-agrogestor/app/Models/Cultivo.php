<?php

// App/Models/Cultivo.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cultivo extends Model
{
    protected $table = 'cultivos';
    protected $fillable = [
      'parcela_id',
      'usuario_id',
      'variedad',
      'fecha_siembra',
      'superficie_ha',
      'latitud',
      'longitud',
    ];

    public function parcela()
    {
        return $this->belongsTo(Parcela::class, 'parcela_id');
    }


    /**
     * Si deseas navegar de Cultivo → Actividades en un futuro:
     * 
     * public function actividades()
     * {
     *     return $this->hasMany(Actividad::class, 'cultivo_id');
     * }
     */
}
