<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;                    
use Illuminate\Foundation\Auth\User as Authenticatable; 
use Illuminate\Notifications\Notifiable;               
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    // Ya no hace falta este método:
    // public function setContrasenaAttribute($value) { … }

    protected $fillable = [
        'nombre',
        'apellidos',
        'correo',
        'contrasena',
        'rol',
    ];

    public function getAuthPassword()
    {
        // Laravel buscará el password aquí para el guard:
        return $this->contrasena;
    }

    // Relaciones…
    public function parcelas()    { return $this->hasMany(Parcela::class, 'usuario_id'); }
    public function actividades() { return $this->hasMany(Actividad::class, 'usuario_id'); }
}
