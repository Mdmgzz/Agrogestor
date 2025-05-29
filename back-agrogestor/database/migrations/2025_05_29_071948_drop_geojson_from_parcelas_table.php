<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('parcelas', function (Blueprint $table) {
            // Eliminamos la columna geojson
            $table->dropColumn('geojson');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parcelas', function (Blueprint $table) {
            // En caso de rollback, volvemos a añadirla como JSON nullable
            $table->json('geojson')->nullable();
        });
    }
};
