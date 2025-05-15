<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Actividad extends Model
{
    protected $table = 'actividades';
    protected $fillable = [
        'parcela_id',
        'usuario_id',
        'tipo_actividad',
        'fecha_actividad',
        'detalles'
    ];

    public function parcela()
    {
        return $this->belongsTo(Parcela::class, 'parcela_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Una actividad puede tener múltiples adjuntos.
     */
    public function adjuntos()
    {
        return $this->hasMany(Adjunto::class, 'actividad_id');
    }
}
