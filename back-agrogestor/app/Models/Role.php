<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // Indica la tabla asociada (opcional si pluraliza bien)
    protected $table = 'roles';

    // Columnas que podemos asignar en masa
    protected $fillable = ['nombre', 'descripcion'];

    /**
     * Relación 1:N: Un rol tiene muchos usuarios.
     */
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'rol_id');
    }
}
