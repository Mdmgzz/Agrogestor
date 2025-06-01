<?php

// App/Models/Adjunto.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Adjunto extends Model
{
    protected $table = 'adjuntos';

    protected $fillable = [
        'actividad_id',
        'ruta_archivo',
        'tipo_archivo',
    ];

    public function actividad()
    {
        return $this->belongsTo(Actividad::class);
    }
}

