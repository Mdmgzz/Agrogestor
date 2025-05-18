<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Usuario Administrador de ejemplo
        Usuario::create([
            'nombre'     => 'Migue',
            'apellidos'  => 'Admmin',
            'correo'     => 'admin@gmail.com',
            'contrasena' => '123456',  // tu mutator en el modelo hará bcrypt()
            'rol'        => 'ADMINISTRADOR',
        ]);


        // Si quieres más usuarios, repite Usuario::create([...]);
    }
}
