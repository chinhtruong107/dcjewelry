<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ReturnRequest;
use App\Services\ResendEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ReturnRequestController extends Controller
{
    public function index(Request $request)
    {
        $requests = ReturnRequest::with([
            'order:id,order_number,status,delivered_at',
            'orderItem:id,order_id,product_name,product_image,certificate_code,warranty_expires_at',
        ])
            ->where('user_id', $request->user()->id)
            ->latest('requested_at')
            ->get();

        return response()->json($requests);
    }

    public function store(Request $request, ResendEmailService $email)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'type' => ['required', 'string', 'in:return,exchange,warranty'],
            'reason' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string', 'max:2000'],
            'images' => ['nullable', 'array', 'max:3'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);
        $order = Order::whereKey($validated['order_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        $item = OrderItem::whereKey($validated['order_item_id'])
            ->where('order_id', $order->id)
            ->firstOrFail();

        $this->validateEligibility($order, $item, $validated['type']);

        $hasOpenRequest = ReturnRequest::where('order_item_id', $item->id)
            ->where('type', $validated['type'])
            ->whereIn('status', ['pending', 'approved', 'received'])
            ->exists();
        if ($hasOpenRequest) {
            throw ValidationException::withMessages([
                'order_item_id' => ['Sản phẩm này đã có một yêu cầu đang được xử lý.'],
            ]);
        }

        $images = collect($request->file('images', []))
            ->map(fn ($image) => $image->store('returns/'.$request->user()->id, 'public'))
            ->values()
            ->all();
        $returnRequest = ReturnRequest::create([
            'request_number' => 'RMA'.now()->format('ymdHis').Str::upper(Str::random(3)),
            'user_id' => $request->user()->id,
            'order_id' => $order->id,
            'order_item_id' => $item->id,
            'type' => $validated['type'],
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'images' => $images,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $returnRequest->load(['order', 'orderItem', 'user']);
        $this->sendReturnEmail($email, $returnRequest);

        return response()->json($returnRequest, 201);
    }

    public function adminIndex()
    {
        return response()->json(
            ReturnRequest::with(['user:id,name,email,phone', 'order:id,order_number,status,payment_status', 'orderItem'])
                ->latest('requested_at')
                ->get()
        );
    }

    public function adminUpdate(Request $request, ReturnRequest $returnRequest, ResendEmailService $email)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,approved,rejected,received,refunded,completed'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);
        $allowedTransitions = [
            'pending' => ['approved', 'rejected'],
            'approved' => ['received'],
            'received' => $returnRequest->type === 'return' ? ['refunded', 'completed'] : ['completed'],
            'refunded' => ['completed'],
            'rejected' => [],
            'completed' => [],
        ];
        if (! in_array($validated['status'], $allowedTransitions[$returnRequest->status] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => ['Không thể chuyển yêu cầu sang trạng thái đã chọn.'],
            ]);
        }
        if ($validated['status'] === 'rejected' && blank($validated['admin_note'] ?? null)) {
            throw ValidationException::withMessages([
                'admin_note' => ['Vui lòng ghi rõ lý do từ chối để thông báo cho khách hàng.'],
            ]);
        }
        $updates = [
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? $returnRequest->admin_note,
        ];

        if (in_array($validated['status'], ['approved', 'rejected'], true)) {
            $updates['reviewed_at'] = now();
        }
        if (in_array($validated['status'], ['rejected', 'refunded', 'completed'], true)) {
            $updates['resolved_at'] = now();
        }

        $returnRequest->update($updates);
        if ($validated['status'] === 'refunded') {
            $returnRequest->order()->update(['payment_status' => 'refunded']);
        }

        $returnRequest->load(['user', 'order', 'orderItem']);
        $this->sendReturnEmail($email, $returnRequest);

        return response()->json($returnRequest);
    }

    private function validateEligibility(Order $order, OrderItem $item, string $type): void
    {
        if ($order->status !== 'completed') {
            throw ValidationException::withMessages([
                'order_id' => ['Chỉ đơn hàng đã giao thành công mới có thể tạo yêu cầu hậu mãi.'],
            ]);
        }

        if (in_array($type, ['return', 'exchange'], true)) {
            $deliveredAt = $order->delivered_at ?? $order->updated_at;
            if (! $deliveredAt || now()->greaterThan($deliveredAt->copy()->addDays(7))) {
                throw ValidationException::withMessages([
                    'type' => ['Thời hạn đổi trả 7 ngày của sản phẩm đã kết thúc.'],
                ]);
            }
        }

        if ($type === 'warranty' && (! $item->warranty_expires_at || $item->warranty_expires_at->isPast())) {
            throw ValidationException::withMessages([
                'type' => ['Sản phẩm đã hết thời hạn bảo hành.'],
            ]);
        }
    }

    private function sendReturnEmail(ResendEmailService $email, ReturnRequest $returnRequest): void
    {
        try {
            $email->sendReturnRequestNotification($returnRequest);
        } catch (\Throwable $exception) {
            Log::warning('Return request email could not be sent.', [
                'return_request_id' => $returnRequest->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
