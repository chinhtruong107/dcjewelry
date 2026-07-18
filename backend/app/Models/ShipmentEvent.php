<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShipmentEvent extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'status', 'title', 'description', 'location', 'event_at'];

    protected $casts = ['event_at' => 'datetime'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
