<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cultivo extends Model
{
    protected $table = 'cultivos';
    protected $fillable = [
        'parcela_id',
        'variedad',
        'fecha_siembra',
        'superficie_ha',
        'latitud',
        'longitud',
    ];

    /**
     * Un cultivo pertenece a una sola parcela.
     */
    public function parcela()
    {
        return $this->belongsTo(Parcela::class, 'parcela_id');
    }
}
