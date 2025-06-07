<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Support\Facades\Mail;

class Usuario extends Authenticatable implements CanResetPasswordContract
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'apellidos',
        'correo',
        'contrasena',
        'rol',
    ];

    /**
     * Obtiene la contraseña para el guard autenticado.
     */
    public function getAuthPassword()
    {
        return $this->contrasena;
    }

    /**
     * Obtiene la dirección de correo para el reset de contraseña.
     *
     * @return string
     */
    public function getEmailForPasswordReset(): string
    {
        return $this->correo;
    }

    /**
     * Sobrescribe el envío de la notificación de restablecimiento.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        // Log para depuración
        \Log::info("DEBUG: Lanzando ResetPassword para {$this->correo} con token {$token}");

        // Envío oficial de la notificación
        $this->notify(new ResetPasswordNotification($token));

        \Log::channel('single')->info("✔ Notificación oficial disparada para {$this->correo}");

    }

    // Relaciones...
    public function parcelas()
    {
        return $this->hasMany(Parcela::class, 'usuario_id');
    }

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'usuario_id');
    }
}
