<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SyncProductImages extends Command
{
    protected $signature = 'products:sync-images';

    protected $description = 'Sync product image paths to storage/app/public/products/product-XX.jpg files.';

    public function handle(): int
    {
        $updated = 0;
        $missing = 0;

        Product::orderBy('id')->each(function (Product $product) use (&$updated, &$missing) {
            $path = 'products/product-'.str_pad((string) $product->id, 2, '0', STR_PAD_LEFT).'.jpg';

            if (! Storage::disk('public')->exists($path)) {
                $missing++;
                $this->warn("Missing image for product {$product->id}: {$path}");

                return;
            }

            $product->forceFill(['image' => $path])->save();
            $updated++;
        });

        $this->info("Synced {$updated} product images. Missing: {$missing}.");

        return self::SUCCESS;
    }
}
