<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Adjunto extends Model
{
    protected $table = 'adjuntos';
    protected $fillable = [
        'actividad_id',
        'ruta_archivo',
        'tipo_archivo'
    ];

    /**
     * Un adjunto pertenece a una sola actividad.
     */
    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }
}
