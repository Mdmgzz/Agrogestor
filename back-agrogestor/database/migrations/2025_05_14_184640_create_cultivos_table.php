<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('cultivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcela_id')
                  ->constrained('parcelas')
                  ->onDelete('cascade');
            $table->string('variedad', 100);
            $table->date('fecha_siembra');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cultivos');
    }
};
