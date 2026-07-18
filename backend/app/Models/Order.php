<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Order extends Model
{
    use HasFactory;

    public const CUSTOMER_CANCELLABLE_STATUSES = ['pending', 'processing'];

    public const ADMIN_CANCELLABLE_STATUSES = ['pending', 'processing', 'shipping'];

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'customer_address_detail',
        'customer_province_code',
        'customer_province_name',
        'customer_ward_code',
        'customer_ward_name',
        'recipient_name',
        'recipient_phone',
        'recipient_address',
        'recipient_address_detail',
        'recipient_province_code',
        'recipient_province_name',
        'recipient_ward_code',
        'recipient_ward_name',
        'status',
        'payment_method',
        'payment_status',
        'shipping_carrier',
        'tracking_number',
        'tracking_url',
        'shipped_at',
        'delivered_at',
        'vnpay_transaction_no',
        'vnpay_bank_code',
        'vnpay_response_code',
        'vnpay_transaction_status',
        'vnpay_paid_at',
        'subtotal',
        'shipping_fee',
        'tax',
        'discount',
        'total',
        'note',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'shipping_fee' => 'integer',
        'tax' => 'integer',
        'discount' => 'integer',
        'total' => 'integer',
        'vnpay_paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function shipmentEvents()
    {
        return $this->hasMany(ShipmentEvent::class)->orderBy('event_at');
    }

    public function returnRequests()
    {
        return $this->hasMany(ReturnRequest::class);
    }

    public function canBeCancelledByCustomer(): bool
    {
        return in_array($this->status, self::CUSTOMER_CANCELLABLE_STATUSES, true)
            && $this->payment_status !== 'paid';
    }

    public function canBeCancelledByAdmin(): bool
    {
        return in_array($this->status, self::ADMIN_CANCELLABLE_STATUSES, true);
    }

    public function cancelAndRestoreStock()
    {
        return DB::transaction(function () {
            $order = self::whereKey($this->id)->lockForUpdate()->firstOrFail();

            if ($order->status !== 'cancelled') {
                $order->load('items');

                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::whereKey($item->product_id)->increment('stock', $item->quantity);
                    }
                }

                $order->forceFill([
                    'status' => 'cancelled',
                ])->save();
            }

            return $order->fresh()->load('items.review');
        });
    }
}
