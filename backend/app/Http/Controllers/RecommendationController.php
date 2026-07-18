<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $user = $this->resolveUser($request);
        $guestToken = $this->guestToken($request);
        $limit = min(max((int) $request->integer('limit', 8), 1), 12);
        $exclude = collect(explode(',', (string) $request->query('exclude', '')))
            ->filter(fn ($id) => ctype_digit($id))
            ->map(fn ($id) => (int) $id)
            ->values();
        $contextProduct = $request->filled('product_id') ? Product::find($request->integer('product_id')) : null;
        if ($contextProduct) {
            $exclude->push($contextProduct->id);
        }

        $categoryScores = collect();
        if ($contextProduct) {
            $categoryScores[$contextProduct->category] = 12;
        }

        $views = ProductView::with('product:id,category')
            ->when($user, fn ($query) => $query->where('user_id', $user->id))
            ->when(! $user && $guestToken, fn ($query) => $query->where('guest_token', $guestToken))
            ->when(! $user && ! $guestToken, fn ($query) => $query->whereRaw('1 = 0'))
            ->latest('viewed_at')
            ->limit(20)
            ->get();

        foreach ($views as $view) {
            if ($view->product) {
                $categoryScores[$view->product->category] = ($categoryScores[$view->product->category] ?? 0) + 3;
            }
        }

        if ($user) {
            $favoriteCategories = DB::table('favorite_products')
                ->join('products', 'products.id', '=', 'favorite_products.product_id')
                ->where('favorite_products.user_id', $user->id)
                ->pluck('products.category');
            foreach ($favoriteCategories as $category) {
                $categoryScores[$category] = ($categoryScores[$category] ?? 0) + 5;
            }

            $purchaseCategories = DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'products.id', '=', 'order_items.product_id')
                ->where('orders.user_id', $user->id)
                ->where('orders.status', '!=', 'cancelled')
                ->pluck('products.category');
            foreach ($purchaseCategories as $category) {
                $categoryScores[$category] = ($categoryScores[$category] ?? 0) + 7;
            }
        }

        $popularity = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', 'cancelled')
            ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as sold'))
            ->groupBy('order_items.product_id')
            ->pluck('sold', 'product_id');

        $products = Product::query()
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->when($exclude->isNotEmpty(), fn ($query) => $query->whereNotIn('id', $exclude->unique()))
            ->get()
            ->map(function (Product $product) use ($categoryScores, $popularity) {
                $categoryScore = (int) ($categoryScores[$product->category] ?? 0);
                $sold = (int) ($popularity[$product->id] ?? 0);
                $score = $categoryScore + min($sold, 20) + ($product->is_best_seller ? 6 : 0);
                $reason = $categoryScore > 0
                    ? 'Phù hợp với sở thích của bạn'
                    : ($product->is_best_seller ? 'Thiết kế được yêu thích' : 'Khách hàng thường lựa chọn');

                return ['product' => $product, 'score' => $score, 'reason' => $reason];
            })
            ->sortByDesc(fn ($item) => [$item['score'], $item['product']->updated_at?->timestamp ?? 0])
            ->take($limit)
            ->values()
            ->map(fn ($item) => array_merge($item['product']->toArray(), [
                'recommendation_reason' => $item['reason'],
            ]));

        return response()->json($products);
    }

    public function track(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);
        $user = $this->resolveUser($request);
        $guestToken = $this->guestToken($request);

        if (! $user && ! $guestToken) {
            throw ValidationException::withMessages([
                'guest_token' => ['Thiếu mã nhận diện lượt xem.'],
            ]);
        }

        ProductView::updateOrCreate([
            'user_id' => $user?->id,
            'guest_token' => $user ? null : $guestToken,
            'product_id' => $validated['product_id'],
        ], ['viewed_at' => now()]);

        return response()->json(['message' => 'Đã ghi nhận lượt xem.'], 201);
    }

    private function resolveUser(Request $request)
    {
        if ($request->user()) {
            return $request->user();
        }

        return $request->bearerToken()
            ? PersonalAccessToken::findToken($request->bearerToken())?->tokenable
            : null;
    }

    private function guestToken(Request $request): ?string
    {
        $token = (string) $request->header('X-Cart-Token');

        return preg_match('/^[A-Za-z0-9-]{16,64}$/', $token) ? $token : null;
    }
}
