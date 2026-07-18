<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    use HasFactory;

    public const TYPES = ['return', 'exchange', 'warranty'];

    public const STATUSES = ['pending', 'approved', 'rejected', 'received', 'refunded', 'completed'];

    protected $fillable = [
        'request_number', 'user_id', 'order_id', 'order_item_id', 'type', 'reason', 'details',
        'images', 'status', 'admin_note', 'requested_at', 'reviewed_at', 'resolved_at',
    ];

    protected $casts = [
        'images' => 'array',
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected $appends = ['image_urls'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function getImageUrlsAttribute(): array
    {
        return collect($this->images ?? [])
            ->map(fn (string $path) => '/api/return-images/'.ltrim($path, '/'))
            ->values()
            ->all();
    }
}
