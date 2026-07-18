<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->text('image')->nullable()->after('price');
            $table->text('description')->nullable()->after('image');
            $table->string('category')->default('Uncategorized')->index()->after('description');
            $table->boolean('is_best_seller')->default(false)->after('category');
            $table->unsignedInteger('stock')->default(100)->after('is_best_seller');
            $table->string('status')->default('active')->after('stock');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('address')->nullable()->after('phone');
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone', 20);
            $table->text('customer_address');
            $table->string('recipient_name')->nullable();
            $table->string('recipient_phone', 20)->nullable();
            $table->text('recipient_address')->nullable();
            $table->string('status')->default('pending');
            $table->string('payment_method')->default('cod');
            $table->string('payment_status')->default('unpaid');
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('shipping_fee')->default(0);
            $table->unsignedBigInteger('tax')->default(0);
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('total')->default(0);
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->text('product_image')->nullable();
            $table->unsignedBigInteger('price');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('line_total');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('address');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'image',
                'description',
                'category',
                'is_best_seller',
                'stock',
                'status',
            ]);
        });
    }
};
