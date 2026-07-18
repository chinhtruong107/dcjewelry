<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Validation\ValidationException;

class DemoShippingService
{
    public const CARRIERS = ['ghn', 'ghtk'];

    public function createShipment(Order $order, string $carrier): Order
    {
        $carrier = strtolower($carrier);

        if (! in_array($carrier, self::CARRIERS, true)) {
            throw ValidationException::withMessages([
                'carrier' => ['Đơn vị vận chuyển chỉ hỗ trợ GHN hoặc GHTK.'],
            ]);
        }

        if ($order->status === 'cancelled') {
            throw ValidationException::withMessages([
                'carrier' => ['Không thể tạo vận đơn cho đơn hàng đã hủy.'],
            ]);
        }

        if ($order->tracking_number) {
            return $order->fresh(['items', 'shipmentEvents']);
        }

        if ($order->status !== 'processing') {
            throw ValidationException::withMessages([
                'carrier' => ['Chỉ tạo vận đơn sau khi đơn hàng đã được xác nhận và đang xử lý.'],
            ]);
        }

        $trackingNumber = strtoupper($carrier).'-DEMO-'.now()->format('ymd').'-'.str_pad((string) $order->id, 6, '0', STR_PAD_LEFT);
        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:3002'), '/');

        $order->forceFill([
            'shipping_carrier' => $carrier,
            'tracking_number' => $trackingNumber,
            'tracking_url' => $frontendUrl.'/tracking/'.rawurlencode($trackingNumber),
            'status' => 'shipping',
            'shipped_at' => now(),
        ])->save();

        $this->recordEvent($order, 'confirmed', 'Đã tiếp nhận đơn hàng', 'Đức Chính Jewelry đã bàn giao thông tin cho đơn vị vận chuyển.', 'Hà Nội');
        $this->recordEvent(
            $order,
            'shipping',
            'Đã bàn giao cho '.strtoupper($carrier),
            'Vận đơn demo đã được tạo và đang trên đường giao tới khách hàng.',
            'Trung tâm khai thác Hà Nội'
        );

        return $order->fresh(['items', 'shipmentEvents']);
    }

    public function syncOrderStatus(Order $order, string $status): Order
    {
        if ($status === 'processing') {
            $this->recordEvent($order, 'processing', 'Đơn hàng đang được chuẩn bị', 'Sản phẩm đang được kiểm tra và đóng gói.', 'Đức Chính Jewelry - Hà Nội');
        }

        if ($status === 'completed') {
            $order->forceFill(['delivered_at' => $order->delivered_at ?? now()])->save();
            $this->recordEvent($order, 'completed', 'Giao hàng thành công', 'Khách hàng đã nhận được đơn hàng.', 'Địa chỉ người nhận');
        }

        if ($status === 'cancelled') {
            $this->recordEvent($order, 'cancelled', 'Đơn hàng đã hủy', 'Vận đơn demo đã dừng xử lý.', null);
        }

        return $order->fresh(['items', 'shipmentEvents']);
    }

    public function carrierLabel(?string $carrier): ?string
    {
        return match ($carrier) {
            'ghn' => 'Giao Hàng Nhanh (demo)',
            'ghtk' => 'Giao Hàng Tiết Kiệm (demo)',
            default => null,
        };
    }

    private function recordEvent(Order $order, string $status, string $title, ?string $description, ?string $location): void
    {
        $exists = $order->shipmentEvents()
            ->where('status', $status)
            ->where('title', $title)
            ->exists();

        if ($exists) {
            return;
        }

        $order->shipmentEvents()->create([
            'status' => $status,
            'title' => $title,
            'description' => $description,
            'location' => $location,
            'event_at' => now(),
        ]);
    }
}
