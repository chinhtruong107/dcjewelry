<?php

namespace Database\Seeders;

use App\Console\Commands\SyncProductCatalog;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        foreach (SyncProductCatalog::catalog() as $id => $product) {
            Product::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $product['name'],
                    'price' => $product['price'],
                    'image' => 'products/product-'.str_pad((string) $id, 2, '0', STR_PAD_LEFT).'.jpg',
                    'description' => $product['description'],
                    'category' => $product['category'],
                    'is_best_seller' => $product['is_best_seller'],
                    'stock' => $product['stock'],
                    'status' => 'active',
                ]
            );
        }
    }
}
