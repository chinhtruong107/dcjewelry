<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('products', 'warranty_months')) {
            Schema::table('products', function (Blueprint $table) {
                $table->unsignedSmallInteger('warranty_months')->default(12)->after('stock');
            });
        }

        $orderColumns = [
            'shipping_carrier' => fn (Blueprint $table) => $table->string('shipping_carrier', 20)->nullable()->after('payment_status'),
            'tracking_number' => fn (Blueprint $table) => $table->string('tracking_number', 64)->nullable()->after('shipping_carrier'),
            'tracking_url' => fn (Blueprint $table) => $table->text('tracking_url')->nullable()->after('tracking_number'),
            'shipped_at' => fn (Blueprint $table) => $table->timestamp('shipped_at')->nullable()->after('tracking_url'),
            'delivered_at' => fn (Blueprint $table) => $table->timestamp('delivered_at')->nullable()->after('shipped_at'),
        ];

        foreach ($orderColumns as $column => $definition) {
            if (! Schema::hasColumn('orders', $column)) {
                Schema::table('orders', fn (Blueprint $table) => $definition($table));
            }
        }

        if (! Schema::hasIndex('orders', ['tracking_number'], 'unique')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->unique('tracking_number');
            });
        }

        $orderItemColumns = [
            'certificate_code' => fn (Blueprint $table) => $table->string('certificate_code', 40)->nullable()->after('line_total'),
            'warranty_months' => fn (Blueprint $table) => $table->unsignedSmallInteger('warranty_months')->default(12)->after('certificate_code'),
            'warranty_starts_at' => fn (Blueprint $table) => $table->timestamp('warranty_starts_at')->nullable()->after('warranty_months'),
            'warranty_expires_at' => fn (Blueprint $table) => $table->timestamp('warranty_expires_at')->nullable()->after('warranty_starts_at'),
        ];

        foreach ($orderItemColumns as $column => $definition) {
            if (! Schema::hasColumn('order_items', $column)) {
                Schema::table('order_items', fn (Blueprint $table) => $definition($table));
            }
        }

        if (! Schema::hasIndex('order_items', ['certificate_code'], 'unique')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->unique('certificate_code');
            });
        }

        if (! Schema::hasTable('shipment_events')) {
            Schema::create('shipment_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->cascadeOnDelete();
                $table->string('status', 40);
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('location')->nullable();
                $table->timestamp('event_at');
                $table->timestamps();
                $table->index(['order_id', 'event_at']);
            });
        }

        DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->select(
                'order_items.id',
                'order_items.certificate_code',
                'order_items.warranty_months',
                'order_items.warranty_starts_at',
                'order_items.warranty_expires_at',
                'orders.order_number',
                'orders.created_at',
            )
            ->orderBy('order_items.id')
            ->each(function ($item) {
                $updates = [];
                $start = $item->warranty_starts_at
                    ? Carbon::parse($item->warranty_starts_at)
                    : Carbon::parse($item->created_at);

                if ($item->certificate_code === null) {
                    $updates['certificate_code'] = 'DCJ-'.strtoupper(substr(hash('sha256', $item->order_number.'-'.$item->id), 0, 12));
                }

                if ($item->warranty_starts_at === null) {
                    $updates['warranty_starts_at'] = $start;
                }

                if ($item->warranty_expires_at === null) {
                    $updates['warranty_expires_at'] = $start->copy()->addMonths(max(1, (int) $item->warranty_months));
                }

                if ($updates !== []) {
                    DB::table('order_items')->where('id', $item->id)->update($updates);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipment_events');

        if (Schema::hasIndex('order_items', ['certificate_code'], 'unique')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropUnique(['certificate_code']);
            });
        }

        $orderItemColumns = array_values(array_filter(
            ['certificate_code', 'warranty_months', 'warranty_starts_at', 'warranty_expires_at'],
            fn (string $column) => Schema::hasColumn('order_items', $column),
        ));

        if ($orderItemColumns !== []) {
            Schema::table('order_items', function (Blueprint $table) use ($orderItemColumns) {
                $table->dropColumn($orderItemColumns);
            });
        }

        if (Schema::hasIndex('orders', ['tracking_number'], 'unique')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropUnique(['tracking_number']);
            });
        }

        $orderColumns = array_values(array_filter(
            ['shipping_carrier', 'tracking_number', 'tracking_url', 'shipped_at', 'delivered_at'],
            fn (string $column) => Schema::hasColumn('orders', $column),
        ));

        if ($orderColumns !== []) {
            Schema::table('orders', function (Blueprint $table) use ($orderColumns) {
                $table->dropColumn($orderColumns);
            });
        }

        if (Schema::hasColumn('products', 'warranty_months')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('warranty_months');
            });
        }
    }
};
