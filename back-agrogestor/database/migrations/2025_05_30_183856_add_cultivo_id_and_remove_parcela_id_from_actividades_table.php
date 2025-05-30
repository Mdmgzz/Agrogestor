<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('actividades', function (Blueprint $table) {
            // 1) Agregamos cultivo_id justo después de usuario_id
            $table->foreignId('cultivo_id')
                  ->after('usuario_id')
                  ->constrained('cultivos')
                  ->onDelete('cascade');

            // 2) Eliminamos la llave foránea y columna parcela_id
            $table->dropForeign(['parcela_id']);
            $table->dropColumn('parcela_id');
        });
    }

    public function down(): void
    {
        Schema::table('actividades', function (Blueprint $table) {
            // 1) Restauramos parcela_id
            $table->foreignId('parcela_id')
                  ->after('usuario_id')
                  ->constrained('parcelas')
                  ->onDelete('cascade');

            // 2) Eliminamos cultivo_id
            $table->dropForeign(['cultivo_id']);
            $table->dropColumn('cultivo_id');
        });
    }
};
