<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->boolean('is_read')->default(false)->after('message'); // Add after 'message'
            $table->timestamp('read_at')->nullable()->after('is_read');    // Add after 'is_read'
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn(['is_read', 'read_at']);
        });
    }
};
