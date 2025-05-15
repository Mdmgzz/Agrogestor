<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    // 1) Indicar la tabla (no siempre necesario)
    protected $table = 'usuarios';

    // 2) Columnas que podemos asignar en masa
    protected $fillable = [
        'nombre',
        'apellidos',
        'correo',
        'contrasena',
        'rol_id',
    ];

    // 3) Relación con Roles → Usuario pertenece a un Rol
    public function role()
    {
        // belongsTo(ModelDestino, 'clave_foranea_en_esta_tabla')
        return $this->belongsTo(Role::class, 'rol_id');
    }

    // 4) Relación con Parcelas → Usuario tiene muchas Parcelas
    public function parcelas()
    {
        // hasMany(ModelDestino, 'clave_foranea_en_el_modelo_destino')
        return $this->hasMany(Parcela::class, 'usuario_id');
    }

    // 5) Relación con Actividades → Usuario registra muchas Actividades
    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'usuario_id');
    }
}
