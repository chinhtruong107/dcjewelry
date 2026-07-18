<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->favoriteProducts()->latest('favorite_products.created_at')->get()
        );
    }

    public function store(Request $request, Product $product)
    {
        $request->user()->favoriteProducts()->syncWithoutDetaching([$product->id]);

        return response()->json([
            'message' => 'Added to favorites',
            'product' => $product,
        ], 201);
    }

    public function destroy(Request $request, Product $product)
    {
        $request->user()->favoriteProducts()->detach($product->id);

        return response()->json([
            'message' => 'Removed from favorites',
        ]);
    }
}
