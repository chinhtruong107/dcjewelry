<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function index(Product $product)
    {
        return response()->json(
            $product->reviews()
                ->with(['user:id,name,email', 'order:id,order_number'])
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'content' => ['nullable', 'string', 'max:1000'],
        ]);

        $order = Order::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('items', function ($query) use ($validated) {
                $query
                    ->whereKey($validated['order_item_id'])
                    ->where('product_id', $validated['product_id']);
            })
            ->with(['items' => function ($query) use ($validated) {
                $query->whereKey($validated['order_item_id']);
            }])
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Bạn chỉ có thể đánh giá sản phẩm đã mua trong đơn đã giao.',
            ], 403);
        }

        $review = ProductReview::updateOrCreate(
            [
                'product_id' => $validated['product_id'],
                'user_id' => $user->id,
            ],
            [
                'order_id' => $order->id,
                'order_item_id' => $validated['order_item_id'],
                'rating' => $validated['rating'],
                'content' => $validated['content'] ?? null,
            ]
        );

        return response()->json(
            $review->load(['user:id,name,email', 'product:id,name,image', 'order:id,order_number']),
            $review->wasRecentlyCreated ? 201 : 200
        );
    }
}
