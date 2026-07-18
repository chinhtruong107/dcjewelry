<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class JewelryOperationsDemoSeeder extends Seeder
{
    private array $contactSubjects = [
        'Tư vấn chọn quà kỷ niệm',
        'Hỏi về chính sách bảo hành',
        'Đặt lịch xem sản phẩm tại cửa hàng',
        'Tư vấn kích thước trang sức',
        'Hỏi thời gian giao hàng',
        'Yêu cầu gói quà cao cấp',
    ];

    private array $returnReasons = [
        'Kích thước sản phẩm chưa phù hợp.',
        'Muốn đổi sang mẫu có màu sắc khác.',
        'Cần kiểm tra và làm sáng sản phẩm.',
        'Sản phẩm là quà tặng và người nhận muốn đổi mẫu.',
        'Khóa cài cần được kỹ thuật viên kiểm tra.',
        'Muốn được tư vấn thêm về chính sách bảo hành.',
    ];

    public function run(): void
    {
        DB::disableQueryLog();

        $users = DB::table('users')
            ->where('email', 'like', 'khachhang%@ducchinh.test')
            ->orderBy('email')
            ->get();
        $products = DB::table('products')->where('status', 'active')->orderBy('id')->get();
        $orders = DB::table('orders')
            ->where('order_number', 'like', 'DC-DEMO-%')
            ->orderBy('order_number')
            ->get();

        if ($users->isEmpty() || $products->isEmpty() || $orders->isEmpty()) {
            $this->command?->warn('Demo users, products or orders are missing. Run JewelryDemoDataSeeder first.');

            return;
        }

        $this->seedShippingWarrantyAndTracking($orders, $products->keyBy('id'));
        $this->seedReturnRequests($orders);
        $this->seedCarts($users, $products);
        $this->seedProductViews($users, $products);
        $this->seedContactMessages();
        $this->seedNewsletterSubscribers($users);

        $this->command?->info('Seeded operations, engagement, carts and after-sales demo data.');
    }

    private function seedShippingWarrantyAndTracking(Collection $orders, Collection $products): void
    {
        foreach ($orders as $index => $order) {
            $createdAt = Carbon::parse($order->created_at);
            $isShipping = $order->status === 'shipping';
            $isCompleted = $order->status === 'completed';
            $hasShipment = $isShipping || $isCompleted;
            $carrier = $index % 2 === 0 ? 'ghn' : 'ghtk';
            $trackingNumber = $hasShipment
                ? strtoupper($carrier).'-DEMO-'.str_pad((string) $order->id, 8, '0', STR_PAD_LEFT)
                : null;
            $shippedAt = $hasShipment ? $createdAt->copy()->addDay() : null;
            $deliveredAt = $isCompleted ? $createdAt->copy()->addDays(3) : null;

            DB::table('orders')->where('id', $order->id)->update([
                'shipping_carrier' => $hasShipment ? $carrier : null,
                'tracking_number' => $trackingNumber,
                'tracking_url' => $trackingNumber ? '/tracking/'.rawurlencode($trackingNumber) : null,
                'shipped_at' => $shippedAt,
                'delivered_at' => $deliveredAt,
            ]);

            $items = DB::table('order_items')->where('order_id', $order->id)->orderBy('id')->get();

            foreach ($items as $item) {
                $product = $item->product_id ? $products->get($item->product_id) : null;
                $warrantyMonths = max(1, (int) ($product->warranty_months ?? 12));
                $warrantyStart = $isCompleted ? $deliveredAt : null;

                DB::table('order_items')->where('id', $item->id)->update([
                    'certificate_code' => 'DCJ-'.strtoupper(substr(hash('sha256', $order->order_number.'-'.$item->id), 0, 12)),
                    'warranty_months' => $warrantyMonths,
                    'warranty_starts_at' => $warrantyStart,
                    'warranty_expires_at' => $warrantyStart?->copy()->addMonths($warrantyMonths),
                ]);
            }

            if ($hasShipment) {
                $this->upsertShipmentEvent(
                    (int) $order->id,
                    'confirmed',
                    'Đã tiếp nhận đơn hàng',
                    'Đức Chính Jewelry đã xác nhận và chuẩn bị đóng gói sản phẩm.',
                    'Đức Chính Jewelry - Hà Nội',
                    $createdAt->copy()->addHours(4),
                );
                $this->upsertShipmentEvent(
                    (int) $order->id,
                    'shipping',
                    'Đã bàn giao cho '.strtoupper($carrier),
                    'Vận đơn demo đang được vận chuyển tới khách hàng.',
                    'Trung tâm khai thác Hà Nội',
                    $shippedAt,
                );
            }

            if ($isCompleted) {
                $this->upsertShipmentEvent(
                    (int) $order->id,
                    'completed',
                    'Giao hàng thành công',
                    'Khách hàng đã nhận sản phẩm và bắt đầu thời hạn bảo hành.',
                    'Địa chỉ người nhận',
                    $deliveredAt,
                );
            }
        }
    }

    private function upsertShipmentEvent(
        int $orderId,
        string $status,
        string $title,
        string $description,
        string $location,
        Carbon $eventAt,
    ): void {
        DB::table('shipment_events')->updateOrInsert(
            ['order_id' => $orderId, 'status' => $status],
            [
                'title' => $title,
                'description' => $description,
                'location' => $location,
                'event_at' => $eventAt,
                'created_at' => $eventAt,
                'updated_at' => $eventAt,
            ],
        );
    }

    private function seedReturnRequests(Collection $orders): void
    {
        $completedOrders = $orders->where('status', 'completed')->take(48)->values();
        $types = ['return', 'exchange', 'warranty'];
        $statuses = ['pending', 'approved', 'received', 'completed', 'rejected', 'refunded'];

        foreach ($completedOrders as $index => $order) {
            $item = DB::table('order_items')->where('order_id', $order->id)->orderBy('id')->first();

            if (! $item || ! $order->user_id) {
                continue;
            }

            $type = $types[$index % count($types)];
            $status = $statuses[$index % count($statuses)];

            if ($status === 'refunded' && $type !== 'return') {
                $status = 'completed';
            }

            $requestedAt = Carbon::parse($order->created_at)->addDays(5 + ($index % 8));
            $isReviewed = $status !== 'pending';
            $isResolved = in_array($status, ['completed', 'rejected', 'refunded'], true);

            DB::table('return_requests')->updateOrInsert(
                ['request_number' => 'DC-RET-DEMO-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT)],
                [
                    'user_id' => $order->user_id,
                    'order_id' => $order->id,
                    'order_item_id' => $item->id,
                    'type' => $type,
                    'reason' => $this->returnReasons[$index % count($this->returnReasons)],
                    'details' => 'Yêu cầu demo số '.($index + 1).' để kiểm thử quy trình hậu mãi trên trang quản trị.',
                    'images' => null,
                    'status' => $status,
                    'admin_note' => $isReviewed ? 'Đã tiếp nhận và hướng dẫn khách hàng theo quy trình demo.' : null,
                    'requested_at' => $requestedAt,
                    'reviewed_at' => $isReviewed ? $requestedAt->copy()->addHours(6) : null,
                    'resolved_at' => $isResolved ? $requestedAt->copy()->addDays(3) : null,
                    'created_at' => $requestedAt,
                    'updated_at' => $isResolved ? $requestedAt->copy()->addDays(3) : $requestedAt,
                ],
            );
        }
    }

    private function seedCarts(Collection $users, Collection $products): void
    {
        $productIds = $products->pluck('id')->values();

        foreach ($users->take(48)->values() as $index => $user) {
            $createdAt = now()->subDays($index % 20);

            DB::table('carts')->updateOrInsert(
                ['user_id' => $user->id],
                ['guest_token' => null, 'created_at' => $createdAt, 'updated_at' => now()],
            );

            $cartId = DB::table('carts')->where('user_id', $user->id)->value('id');

            for ($slot = 0; $slot < 2; $slot++) {
                DB::table('cart_items')->updateOrInsert(
                    [
                        'cart_id' => $cartId,
                        'product_id' => $productIds[(($index * 7) + ($slot * 13)) % $productIds->count()],
                    ],
                    [
                        'quantity' => 1 + (($index + $slot) % 2),
                        'created_at' => $createdAt,
                        'updated_at' => now(),
                    ],
                );
            }
        }

        for ($i = 1; $i <= 16; $i++) {
            $guestToken = 'demo-guest-cart-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT);

            DB::table('carts')->updateOrInsert(
                ['guest_token' => $guestToken],
                ['user_id' => null, 'created_at' => now()->subDays($i % 10), 'updated_at' => now()],
            );

            $cartId = DB::table('carts')->where('guest_token', $guestToken)->value('id');

            DB::table('cart_items')->updateOrInsert(
                ['cart_id' => $cartId, 'product_id' => $productIds[($i * 11) % $productIds->count()]],
                ['quantity' => 1 + ($i % 2), 'created_at' => now()->subDays($i % 10), 'updated_at' => now()],
            );
        }
    }

    private function seedProductViews(Collection $users, Collection $products): void
    {
        DB::table('product_views')->where('guest_token', 'like', 'demo-view-%')->delete();

        $productIds = $products->pluck('id')->values();
        $rows = [];

        for ($i = 1; $i <= 1200; $i++) {
            $viewedAt = now()->subDays($i % 90)->subMinutes(($i * 17) % 1440);
            $rows[] = [
                'user_id' => $i % 4 === 0 ? $users[($i * 3) % $users->count()]->id : null,
                'guest_token' => 'demo-view-'.str_pad((string) (($i % 160) + 1), 3, '0', STR_PAD_LEFT),
                'product_id' => $productIds[(($i * 7) + ($i % 13)) % $productIds->count()],
                'viewed_at' => $viewedAt,
                'created_at' => $viewedAt,
                'updated_at' => $viewedAt,
            ];

            if (count($rows) === 300) {
                DB::table('product_views')->insert($rows);
                $rows = [];
            }
        }

        if ($rows !== []) {
            DB::table('product_views')->insert($rows);
        }
    }

    private function seedContactMessages(): void
    {
        $statuses = ['new', 'new', 'in_progress', 'resolved'];

        for ($i = 1; $i <= 80; $i++) {
            $createdAt = now()->subDays($i % 75)->subHours($i % 24);
            $status = $statuses[$i % count($statuses)];

            DB::table('contact_messages')->updateOrInsert(
                [
                    'email' => 'lienhe'.str_pad((string) $i, 3, '0', STR_PAD_LEFT).'@ducchinh.test',
                    'subject' => $this->contactSubjects[$i % count($this->contactSubjects)],
                ],
                [
                    'name' => 'Khách liên hệ '.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                    'message' => 'Nội dung liên hệ demo số '.$i.' để kiểm thử dữ liệu chăm sóc khách hàng.',
                    'status' => $status,
                    'ip_address' => '203.0.113.'.(($i % 200) + 1),
                    'user_agent' => 'Demo browser / Đức Chính Jewelry',
                    'notified_at' => $createdAt->copy()->addMinutes(2),
                    'created_at' => $createdAt,
                    'updated_at' => $status === 'resolved' ? $createdAt->copy()->addDay() : $createdAt,
                ],
            );
        }
    }

    private function seedNewsletterSubscribers(Collection $users): void
    {
        foreach ($users->take(150)->values() as $index => $user) {
            $subscribedAt = Carbon::parse($user->created_at)->addDays(2);
            $isUnsubscribed = ($index + 1) % 17 === 0;

            DB::table('newsletter_subscribers')->updateOrInsert(
                ['email' => $user->email],
                [
                    'status' => $isUnsubscribed ? 'unsubscribed' : 'subscribed',
                    'source' => ['website_footer', 'checkout', 'contact_page'][$index % 3],
                    'subscribed_at' => $subscribedAt,
                    'unsubscribed_at' => $isUnsubscribed ? $subscribedAt->copy()->addDays(30) : null,
                    'created_at' => $subscribedAt,
                    'updated_at' => $isUnsubscribed ? $subscribedAt->copy()->addDays(30) : $subscribedAt,
                ],
            );
        }
    }
}
