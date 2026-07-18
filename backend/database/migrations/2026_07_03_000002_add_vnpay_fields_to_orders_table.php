<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('vnpay_transaction_no')->nullable()->after('payment_status');
            $table->string('vnpay_bank_code', 30)->nullable()->after('vnpay_transaction_no');
            $table->string('vnpay_response_code', 10)->nullable()->after('vnpay_bank_code');
            $table->string('vnpay_transaction_status', 10)->nullable()->after('vnpay_response_code');
            $table->timestamp('vnpay_paid_at')->nullable()->after('vnpay_transaction_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'vnpay_transaction_no',
                'vnpay_bank_code',
                'vnpay_response_code',
                'vnpay_transaction_status',
                'vnpay_paid_at',
            ]);
        });
    }
};
