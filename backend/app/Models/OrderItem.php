<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_image',
        'price',
        'quantity',
        'line_total',
        'certificate_code',
        'warranty_months',
        'warranty_starts_at',
        'warranty_expires_at',
    ];

    protected $casts = [
        'price' => 'integer',
        'quantity' => 'integer',
        'line_total' => 'integer',
        'warranty_months' => 'integer',
        'warranty_starts_at' => 'datetime',
        'warranty_expires_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function review()
    {
        return $this->hasOne(ProductReview::class);
    }

    public function returnRequests()
    {
        return $this->hasMany(ReturnRequest::class);
    }
}
