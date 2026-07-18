<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'image',
        'description',
        'category',
        'is_best_seller',
        'stock',
        'warranty_months',
        'status',
    ];

    protected $casts = [
        'price' => 'integer',
        'is_best_seller' => 'boolean',
        'stock' => 'integer',
        'warranty_months' => 'integer',
    ];

    protected $appends = ['isBestSeller'];

    public function getIsBestSellerAttribute($value): bool
    {
        return (bool) ($value ?? $this->attributes['is_best_seller'] ?? false);
    }

    public function getImageAttribute($value): ?string
    {
        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        if (str_starts_with($value, '/storage/')) {
            $value = ltrim(str_replace('/storage/', '', $value), '/');
        }

        $version = $this->updated_at?->timestamp ?? time();
        $baseUrl = rtrim((string) config('app.url'), '/');

        return $baseUrl.'/api/product-images/'.ltrim($value, '/').'?v='.$version;
    }

    public function getRawImagePath(): ?string
    {
        return $this->attributes['image'] ?? null;
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
