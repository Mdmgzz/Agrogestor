<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Actividad extends Model
{
    protected $table = 'actividades';

    protected $fillable = [
        'usuario_id',
        'cultivo_id',
        'tipo_actividad',
        'fecha_actividad',
        'detalles',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function cultivo()
    {
        return $this->belongsTo(Cultivo::class);
    }

    public function adjuntos()
    {
        return $this->hasMany(Adjunto::class, 'actividad_id');
    }
}
