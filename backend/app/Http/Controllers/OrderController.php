<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Services\DemoShippingService;
use App\Services\ResendEmailService;
use App\Services\VnpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['items.review', 'shipmentEvents'])
            ->when($request->user(), function ($query, $user) {
                $query->where('user_id', $user->id);
            })
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function store(Request $request, VnpayService $vnpay, ResendEmailService $email)
    {
        $user = $this->resolveUser($request);

        $validated = $request->validate([
            'customer.name' => ['required', 'string', 'max:255'],
            'customer.email' => ['required', 'email', 'max:255'],
            'customer.phone' => ['required', 'string', 'max:20'],
            'customer.address' => ['required', 'string'],
            'customer.address_detail' => ['nullable', 'string', 'max:500'],
            'customer.province_code' => ['nullable', 'string', 'exists:provinces,code'],
            'customer.ward_code' => ['nullable', 'string', 'exists:wards,code'],
            'recipient.name' => ['nullable', 'string', 'max:255'],
            'recipient.phone' => ['nullable', 'string', 'max:20'],
            'recipient.address' => ['nullable', 'string'],
            'recipient.address_detail' => ['nullable', 'string', 'max:500'],
            'recipient.province_code' => ['nullable', 'string', 'exists:provinces,code'],
            'recipient.ward_code' => ['nullable', 'string', 'exists:wards,code'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'payment_method' => ['nullable', 'string', 'in:cod,vnpay'],
            'note' => ['nullable', 'string'],
        ]);

        if (($validated['payment_method'] ?? 'cod') === 'vnpay' && ! $vnpay->isConfigured()) {
            return response()->json([
                'message' => 'VNPay chưa được cấu hình. Vui lòng bổ sung VNPAY_TMN_CODE và VNPAY_HASH_SECRET.',
            ], 422);
        }

        $order = DB::transaction(function () use ($user, $validated) {
            $subtotal = 0;
            $items = collect($validated['items'])->map(function ($item) use (&$subtotal) {
                $product = Product::whereKey($item['id'])->lockForUpdate()->firstOrFail();
                $quantity = (int) $item['quantity'];

                if (($product->status ?? 'active') !== 'active' || $product->stock < $quantity) {
                    abort(response()->json([
                        'message' => "Sản phẩm {$product->name} không đủ hàng. Hiện còn {$product->stock} sản phẩm.",
                    ], 422));
                }

                $lineTotal = $product->price * $quantity;
                $subtotal += $lineTotal;
                $product->decrement('stock', $quantity);
                $warrantyStartsAt = now();
                $warrantyMonths = max(1, (int) ($product->warranty_months ?? 12));

                return [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->image,
                    'price' => $product->price,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                    'certificate_code' => 'DCJ-'.Str::upper(Str::random(12)),
                    'warranty_months' => $warrantyMonths,
                    'warranty_starts_at' => $warrantyStartsAt,
                    'warranty_expires_at' => $warrantyStartsAt->copy()->addMonths($warrantyMonths),
                ];
            });

            $shippingFee = $subtotal > 500000 ? 0 : 30000;
            $tax = (int) round($subtotal * 0.08);
            $discount = $user ? (int) round($subtotal * 0.05) : 0;
            $total = $subtotal + $shippingFee + $tax - $discount;

            $customerLocation = $this->resolveLocation(
                $validated['customer']['province_code'] ?? null,
                $validated['customer']['ward_code'] ?? null
            );
            $recipientLocation = $this->resolveLocation(
                $validated['recipient']['province_code'] ?? null,
                $validated['recipient']['ward_code'] ?? null
            );
            $customerAddress = $this->formatAddress(
                $validated['customer']['address_detail'] ?? $validated['customer']['address'],
                $customerLocation['ward_name'],
                $customerLocation['province_name']
            ) ?? $validated['customer']['address'];
            $recipientAddress = isset($validated['recipient']['address'])
                ? ($this->formatAddress(
                    $validated['recipient']['address_detail'] ?? $validated['recipient']['address'],
                    $recipientLocation['ward_name'],
                    $recipientLocation['province_name']
                ) ?? $validated['recipient']['address'])
                : null;

            $order = Order::create([
                'order_number' => 'DH'.now()->format('ymdHis').Str::upper(Str::random(3)),
                'user_id' => $user?->id,
                'customer_name' => $validated['customer']['name'],
                'customer_email' => $validated['customer']['email'],
                'customer_phone' => $validated['customer']['phone'],
                'customer_address' => $customerAddress,
                'customer_address_detail' => $validated['customer']['address_detail'] ?? null,
                'customer_province_code' => $customerLocation['province_code'],
                'customer_province_name' => $customerLocation['province_name'],
                'customer_ward_code' => $customerLocation['ward_code'],
                'customer_ward_name' => $customerLocation['ward_name'],
                'recipient_name' => $validated['recipient']['name'] ?? null,
                'recipient_phone' => $validated['recipient']['phone'] ?? null,
                'recipient_address' => $recipientAddress,
                'recipient_address_detail' => $validated['recipient']['address_detail'] ?? null,
                'recipient_province_code' => $recipientLocation['province_code'],
                'recipient_province_name' => $recipientLocation['province_name'],
                'recipient_ward_code' => $recipientLocation['ward_code'],
                'recipient_ward_name' => $recipientLocation['ward_name'],
                'payment_method' => $validated['payment_method'] ?? 'cod',
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'note' => $validated['note'] ?? null,
            ]);

            $order->items()->createMany($items->all());

            return $order->load('items');
        });

        CartController::clearForRequest($request, $user);
        $this->sendOrderEmail($email, $order);

        if ($order->payment_method === 'vnpay') {
            return response()->json([
                ...$order->toArray(),
                'payment_url' => $vnpay->createPaymentUrl($order, $request),
            ], 201);
        }

        return response()->json($order, 201);
    }

    public function show(Request $request, Order $order)
    {
        $user = $this->resolveUser($request);

        if ($user && $order->user_id && $order->user_id !== $user->id) {
            abort(403);
        }

        return response()->json($order->load(['items', 'shipmentEvents']));
    }

    public function updateStatus(Request $request, Order $order, DemoShippingService $shipping, ResendEmailService $email)
    {
        if (! $request->user() || $order->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:cancelled'],
        ]);

        if (! $order->canBeCancelledByCustomer()) {
            throw ValidationException::withMessages([
                'status' => ['Đơn hàng này không thể hủy ở trạng thái hiện tại.'],
            ]);
        }

        $order = $shipping->syncOrderStatus($order->cancelAndRestoreStock(), 'cancelled');
        $this->sendOrderEmail($email, $order);

        return response()->json($order->load(['items.review', 'shipmentEvents']));
    }

    public function cancel(Request $request, Order $order, DemoShippingService $shipping, ResendEmailService $email)
    {
        if (! $request->user() || $order->user_id !== $request->user()->id) {
            abort(403);
        }

        if (! $order->canBeCancelledByCustomer()) {
            throw ValidationException::withMessages([
                'status' => ['Đơn hàng này chỉ có thể hủy khi chưa giao và chưa thanh toán online thành công.'],
            ]);
        }

        $order = $shipping->syncOrderStatus($order->cancelAndRestoreStock(), 'cancelled');
        $this->sendOrderEmail($email, $order);

        return response()->json($order->load(['items.review', 'shipmentEvents']));
    }

    private function resolveUser(Request $request)
    {
        if ($request->user()) {
            return $request->user();
        }

        if (! $request->bearerToken()) {
            return null;
        }

        return PersonalAccessToken::findToken($request->bearerToken())?->tokenable;
    }

    private function resolveLocation(?string $provinceCode, ?string $wardCode): array
    {
        $province = $provinceCode
            ? DB::table('provinces')->where('code', $provinceCode)->first()
            : null;
        $ward = $wardCode
            ? DB::table('wards')->where('code', $wardCode)->first()
            : null;

        if ($ward && $province && $ward->province_code !== $province->code) {
            abort(response()->json([
                'message' => 'Phường/xã không thuộc tỉnh/thành đã chọn.',
            ], 422));
        }

        return [
            'province_code' => $province?->code,
            'province_name' => $province?->full_name,
            'ward_code' => $ward?->code,
            'ward_name' => $ward?->full_name,
        ];
    }

    private function formatAddress(?string $detail, ?string $wardName, ?string $provinceName): ?string
    {
        $parts = array_filter([$detail, $wardName, $provinceName]);

        return $parts === [] ? null : implode(', ', $parts);
    }

    private function sendOrderEmail(ResendEmailService $email, Order $order): void
    {
        try {
            $email->sendOrderStatusNotification($order);
        } catch (\Throwable $exception) {
            Log::warning('Order email could not be sent.', [
                'order_id' => $order->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
