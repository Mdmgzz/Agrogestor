<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cultivos', function (Blueprint $table) {
            $table->decimal('superficie_ha', 10, 2)->after('fecha_siembra');
            $table->double('latitud')->nullable()->after('superficie_ha');
            $table->double('longitud')->nullable()->after('latitud');
        });
    }

    public function down(): void
    {
        Schema::table('cultivos', function (Blueprint $table) {
            $table->dropColumn(['superficie_ha', 'latitud', 'longitud']);
        });
    }
};
