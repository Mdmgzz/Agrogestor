<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;                    // <— para createToken()
use Illuminate\Foundation\Auth\User as Authenticatable; // <— para el guard de auth
use Illuminate\Notifications\Notifiable;               // <— si quieres notificaciones
use Illuminate\Database\Eloquent\Factories\HasFactory; // <— si usas factories

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'apellidos',
        'correo',
        'contrasena',
        'rol',
    ];

    /**
     * Hash de la contraseña al asignarla
     */
    public function setContrasenaAttribute($value)
    {
        $this->attributes['contrasena'] = bcrypt($value);
    }

    // Relaciones...
    public function parcelas()    { return $this->hasMany(Parcela::class, 'usuario_id'); }
    public function actividades() { return $this->hasMany(Actividad::class, 'usuario_id'); }
}
