<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('administrative_regions', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('name');
            $table->string('name_en');
            $table->string('code_name')->nullable();
            $table->string('code_name_en')->nullable();
        });

        Schema::create('administrative_units', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('full_name')->nullable();
            $table->string('full_name_en')->nullable();
            $table->string('short_name')->nullable();
            $table->string('short_name_en')->nullable();
            $table->string('code_name')->nullable();
            $table->string('code_name_en')->nullable();
        });

        Schema::create('provinces', function (Blueprint $table) {
            $table->string('code', 20)->primary();
            $table->string('name');
            $table->string('name_en')->nullable();
            $table->string('full_name');
            $table->string('full_name_en')->nullable();
            $table->string('code_name')->nullable();
            $table->integer('administrative_unit_id')->nullable();

            $table->foreign('administrative_unit_id')->references('id')->on('administrative_units');
            $table->index('administrative_unit_id', 'idx_provinces_unit');
        });

        Schema::create('wards', function (Blueprint $table) {
            $table->string('code', 20)->primary();
            $table->string('name');
            $table->string('name_en')->nullable();
            $table->string('full_name')->nullable();
            $table->string('full_name_en')->nullable();
            $table->string('code_name')->nullable();
            $table->string('province_code', 20)->nullable();
            $table->integer('administrative_unit_id')->nullable();

            $table->foreign('administrative_unit_id')->references('id')->on('administrative_units');
            $table->foreign('province_code')->references('code')->on('provinces');
            $table->index('province_code', 'idx_wards_province');
            $table->index('administrative_unit_id', 'idx_wards_unit');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('address_detail')->nullable()->after('address');
            $table->string('province_code', 20)->nullable()->after('address_detail')->index();
            $table->string('province_name')->nullable()->after('province_code');
            $table->string('ward_code', 20)->nullable()->after('province_name')->index();
            $table->string('ward_name')->nullable()->after('ward_code');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_address_detail')->nullable()->after('customer_address');
            $table->string('customer_province_code', 20)->nullable()->after('customer_address_detail')->index();
            $table->string('customer_province_name')->nullable()->after('customer_province_code');
            $table->string('customer_ward_code', 20)->nullable()->after('customer_province_name')->index();
            $table->string('customer_ward_name')->nullable()->after('customer_ward_code');
            $table->string('recipient_address_detail')->nullable()->after('recipient_address');
            $table->string('recipient_province_code', 20)->nullable()->after('recipient_address_detail')->index();
            $table->string('recipient_province_name')->nullable()->after('recipient_province_code');
            $table->string('recipient_ward_code', 20)->nullable()->after('recipient_province_name')->index();
            $table->string('recipient_ward_name')->nullable()->after('recipient_ward_code');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_address_detail',
                'customer_province_code',
                'customer_province_name',
                'customer_ward_code',
                'customer_ward_name',
                'recipient_address_detail',
                'recipient_province_code',
                'recipient_province_name',
                'recipient_ward_code',
                'recipient_ward_name',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'address_detail',
                'province_code',
                'province_name',
                'ward_code',
                'ward_name',
            ]);
        });

        Schema::dropIfExists('wards');
        Schema::dropIfExists('provinces');
        Schema::dropIfExists('administrative_units');
        Schema::dropIfExists('administrative_regions');
    }
};
