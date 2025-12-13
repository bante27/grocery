<?php
// database/migrations/xxxx_add_admin_fields_to_contact_messages_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            if (!Schema::hasColumn('contact_messages', 'is_read')) {
                $table->boolean('is_read')->default(false)->after('message');
            }
            if (!Schema::hasColumn('contact_messages', 'status')) {
                $table->enum('status', ['pending', 'replied', 'archived'])->default('pending')->after('is_read');
            }
            if (!Schema::hasColumn('contact_messages', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('status');
            }
            if (!Schema::hasColumn('contact_messages', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('admin_notes');
            }
        });
    }

    public function down()
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            if (Schema::hasColumn('contact_messages', 'read_at')) $table->dropColumn('read_at');
            if (Schema::hasColumn('contact_messages', 'admin_notes')) $table->dropColumn('admin_notes');
            if (Schema::hasColumn('contact_messages', 'status')) $table->dropColumn('status');
            if (Schema::hasColumn('contact_messages', 'is_read')) $table->dropColumn('is_read');
        });
    }
};
