<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUsuarioIdToCultivosTable extends Migration
{
    public function up()
{
    Schema::table('cultivos', function (Blueprint $table) {
        // 1) la creamos nullable
        $table->foreignId('usuario_id')
              ->nullable()
              ->after('longitud')
              ->constrained('usuarios')
              ->cascadeOnDelete();
    });

    // 2) Rellena un valor por defecto en las filas antiguas,
    //    por ejemplo, asignándolas al admin id=1:
    DB::table('cultivos')->whereNull('usuario_id')->update(['usuario_id' => 1]);

    // 3) Alteramos la columna para que ya no admita NULLs
    Schema::table('cultivos', function (Blueprint $table) {
        $table->foreignId('usuario_id')
              ->nullable(false)
              ->change();
    });
}

}
