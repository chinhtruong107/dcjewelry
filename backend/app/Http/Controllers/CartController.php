<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class CartController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($this->cartPayload($this->resolveCart($request)));
    }

    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);
        $product = Product::findOrFail($validated['product_id']);
        $quantity = (int) ($validated['quantity'] ?? 1);

        $this->ensureProductCanBeAdded($product, $quantity);
        $cart = $this->resolveCart($request);
        $item = $cart->items()->firstOrNew(['product_id' => $product->id]);
        $item->quantity = min($product->stock, ($item->exists ? $item->quantity : 0) + $quantity);
        $item->save();

        return response()->json($this->cartPayload($cart->fresh()), 201);
    }

    public function updateItem(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);
        $quantity = (int) $validated['quantity'];
        $this->ensureProductCanBeAdded($product, $quantity);
        $cart = $this->resolveCart($request);
        $item = $cart->items()->where('product_id', $product->id)->firstOrFail();
        $item->update(['quantity' => min($quantity, $product->stock)]);

        return response()->json($this->cartPayload($cart->fresh()));
    }

    public function destroyItem(Request $request, Product $product)
    {
        $cart = $this->resolveCart($request);
        $cart->items()->where('product_id', $product->id)->delete();

        return response()->json($this->cartPayload($cart->fresh()));
    }

    public function clear(Request $request)
    {
        $cart = $this->resolveCart($request);
        $cart->items()->delete();

        return response()->json($this->cartPayload($cart->fresh()));
    }

    public function merge(Request $request)
    {
        $validated = $request->validate([
            'guest_token' => ['required', 'string', 'min:16', 'max:64', 'regex:/^[A-Za-z0-9-]+$/'],
        ]);
        $user = $request->user();

        $cart = DB::transaction(function () use ($user, $validated) {
            $userCart = Cart::firstOrCreate(['user_id' => $user->id], ['guest_token' => null]);
            $guestCart = Cart::where('guest_token', $validated['guest_token'])->lockForUpdate()->first();

            if (! $guestCart || $guestCart->id === $userCart->id) {
                return $userCart;
            }

            $guestCart->load('items.product');
            foreach ($guestCart->items as $guestItem) {
                if (! $guestItem->product || $guestItem->product->status !== 'active' || $guestItem->product->stock < 1) {
                    continue;
                }

                $userItem = $userCart->items()->firstOrNew(['product_id' => $guestItem->product_id]);
                $userItem->quantity = min(
                    $guestItem->product->stock,
                    ($userItem->exists ? $userItem->quantity : 0) + $guestItem->quantity
                );
                $userItem->save();
            }

            $guestCart->delete();

            return $userCart;
        });

        return response()->json($this->cartPayload($cart->fresh()));
    }

    public static function clearForRequest(Request $request, $user = null): void
    {
        if ($user) {
            Cart::where('user_id', $user->id)->first()?->items()->delete();

            return;
        }

        $guestToken = $request->header('X-Cart-Token');
        if ($guestToken) {
            Cart::where('guest_token', $guestToken)->first()?->items()->delete();
        }
    }

    private function resolveCart(Request $request): Cart
    {
        $user = $this->resolveUser($request);
        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id], ['guest_token' => null]);
        }

        $guestToken = (string) $request->header('X-Cart-Token');
        if (! preg_match('/^[A-Za-z0-9-]{16,64}$/', $guestToken)) {
            throw ValidationException::withMessages([
                'guest_token' => ['Thiếu mã giỏ hàng khách hợp lệ.'],
            ]);
        }

        return Cart::firstOrCreate(['guest_token' => $guestToken], ['user_id' => null]);
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

    private function ensureProductCanBeAdded(Product $product, int $quantity): void
    {
        if ($product->status !== 'active' || $product->stock < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => ["Sản phẩm {$product->name} chỉ còn {$product->stock} sản phẩm."],
            ]);
        }
    }

    private function cartPayload(Cart $cart): array
    {
        $cart->load(['items.product']);
        $items = $cart->items
            ->filter(fn ($item) => $item->product && $item->product->status === 'active' && $item->product->stock > 0)
            ->map(fn ($item) => [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'price' => $item->product->price,
                'image' => $item->product->image,
                'stock' => $item->product->stock,
                'quantity' => min($item->quantity, $item->product->stock),
            ])
            ->values();

        return [
            'id' => $cart->id,
            'items' => $items,
            'item_count' => $items->sum('quantity'),
            'subtotal' => $items->sum(fn ($item) => $item['price'] * $item['quantity']),
        ];
    }
}
