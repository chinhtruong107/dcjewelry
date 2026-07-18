<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class JewelryDemoDataSeeder extends Seeder
{
    private array $locations = [
        ['province_code' => '79', 'province_name' => 'Thành phố Hồ Chí Minh', 'ward_code' => '26734', 'ward_name' => 'Phường Bến Nghé', 'street' => 'Đồng Khởi'],
        ['province_code' => '01', 'province_name' => 'Thành phố Hà Nội', 'ward_code' => '00001', 'ward_name' => 'Phường Phúc Xá', 'street' => 'Tràng Tiền'],
        ['province_code' => '48', 'province_name' => 'Thành phố Đà Nẵng', 'ward_code' => '20194', 'ward_name' => 'Phường Hải Châu I', 'street' => 'Bạch Đằng'],
        ['province_code' => '56', 'province_name' => 'Tỉnh Khánh Hòa', 'ward_code' => '22531', 'ward_name' => 'Phường Lộc Thọ', 'street' => 'Trần Phú'],
        ['province_code' => '68', 'province_name' => 'Tỉnh Lâm Đồng', 'ward_code' => '24778', 'ward_name' => 'Phường 1', 'street' => 'Phan Đình Phùng'],
        ['province_code' => '92', 'province_name' => 'Thành phố Cần Thơ', 'ward_code' => '31117', 'ward_name' => 'Phường Tân An', 'street' => 'Hai Bà Trưng'],
    ];

    private array $firstNames = [
        'Minh Anh', 'Quốc Bảo', 'Phương Chi', 'Gia Dũng', 'Thu Hạnh', 'Minh Giang',
        'Khánh Linh', 'Nhật Nam', 'Hải Yến', 'Quang Huy', 'Thanh Tú', 'Ngọc Mai',
        'Tuấn Kiệt', 'Bảo Ngọc', 'Đức Long', 'Hà My', 'Gia Bảo', 'Thảo Nhi',
        'Anh Khoa', 'Bích Ngân', 'Quốc Thịnh', 'Diệu Linh', 'Minh Quân', 'Kim Oanh',
    ];

    private array $lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Mai', 'Phan', 'Lý'];

    private array $reviewContents = [
        'Thiết kế ngoài đời tinh tế hơn ảnh, đóng gói rất chỉn chu.',
        'Sản phẩm sáng đẹp, form thanh lịch và dễ phối đồ hằng ngày.',
        'Mình mua làm quà, người nhận rất thích hộp và cách tư vấn.',
        'Chất lượng hoàn thiện tốt, giao nhanh và sản phẩm đúng mô tả.',
        'Mẫu nhỏ gọn nhưng vẫn nổi bật, hợp với phong cách công sở.',
        'Tư vấn đúng nhu cầu, giá hợp lý so với chất liệu và chi tiết.',
    ];

    public function run(): void
    {
        $products = Product::query()->where('status', 'active')->orderBy('id')->get()->keyBy('id');

        if ($products->isEmpty()) {
            $this->command?->warn('No active products found. Run ProductSeeder first.');

            return;
        }

        DB::disableQueryLog();

        $users = $this->seedCustomers();
        $this->seedOrders($users, $products);
        $this->seedFavorites($users, $products);
        $this->seedReviews($users, $products);

        $this->command?->info('Seeded large Đức Chính Jewelry demo dataset.');
    }

    private function seedCustomers(): array
    {
        $password = Hash::make('password');
        $users = [];

        for ($i = 1; $i <= 180; $i++) {
            $location = $this->locations[($i - 1) % count($this->locations)];
            $name = $this->lastNames[($i - 1) % count($this->lastNames)].' '.$this->firstNames[($i - 1) % count($this->firstNames)];
            $email = 'khachhang'.str_pad((string) $i, 3, '0', STR_PAD_LEFT).'@ducchinh.test';
            $address = (12 + $i).' '.$location['street'].', '.$location['ward_name'].', '.$location['province_name'];
            $now = now();

            DB::table('users')->updateOrInsert(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone' => '09'.str_pad((string) (10000000 + $i * 3217), 8, '0', STR_PAD_LEFT),
                    'address' => $address,
                    'address_detail' => 'Nhà riêng / căn hộ '.(($i % 25) + 1),
                    'province_code' => $location['province_code'],
                    'province_name' => $location['province_name'],
                    'ward_code' => $location['ward_code'],
                    'ward_name' => $location['ward_name'],
                    'email_verified_at' => $now,
                    'password' => $password,
                    'role' => 'customer',
                    'must_change_password' => false,
                    'remember_token' => null,
                    'created_at' => $now->copy()->subDays(220 - ($i % 180)),
                    'updated_at' => $now,
                ]
            );

            if ($i % 30 === 0) {
                $this->command?->line("Seeded {$i}/180 customers...");
            }
        }

        return User::query()
            ->where('email', 'like', 'khachhang%@ducchinh.test')
            ->orderBy('email')
            ->get()
            ->values()
            ->all();
    }

    private function seedOrders(array $users, $products): void
    {
        $statuses = ['completed', 'completed', 'shipping', 'processing', 'pending', 'cancelled'];
        $paymentMethods = ['cod', 'vnpay', 'bank_transfer', 'card'];
        $productIds = $products->keys()->values()->all();

        for ($i = 1; $i <= 480; $i++) {
            $user = $users[($i - 1) % count($users)];
            $location = $this->locations[($i - 1) % count($this->locations)];
            $status = $statuses[$i % count($statuses)];
            $paymentMethod = $paymentMethods[$i % count($paymentMethods)];
            $paymentStatus = in_array($status, ['completed', 'shipping'], true) ? 'paid' : ($status === 'cancelled' ? 'refunded' : 'unpaid');
            $quantityA = 1 + ($i % 2);
            $quantityB = 1 + (($i + 1) % 2);
            $productA = $products[$productIds[($i * 3) % count($productIds)]];
            $productB = $products[$productIds[($i * 7) % count($productIds)]];
            $subtotal = ($productA->price * $quantityA) + ($productB->price * $quantityB);
            $shippingFee = $subtotal > 500000 ? 0 : 30000;
            $tax = (int) round($subtotal * 0.08);
            $discount = (int) round($subtotal * 0.05);
            $total = $subtotal + $shippingFee + $tax - $discount;
            $createdAt = now()->subDays(180 - ($i % 180))->subHours($i % 24);
            $orderNumber = 'DC-DEMO-'.str_pad((string) $i, 5, '0', STR_PAD_LEFT);

            DB::table('orders')->updateOrInsert(
                ['order_number' => $orderNumber],
                [
                    'user_id' => $user->id,
                    'customer_name' => $user->name,
                    'customer_email' => $user->email,
                    'customer_phone' => $user->phone,
                    'customer_address' => $user->address,
                    'customer_address_detail' => $user->address_detail,
                    'customer_province_code' => $user->province_code,
                    'customer_province_name' => $user->province_name,
                    'customer_ward_code' => $user->ward_code,
                    'customer_ward_name' => $user->ward_name,
                    'recipient_name' => $i % 5 === 0 ? 'Người nhận '.$user->name : null,
                    'recipient_phone' => $i % 5 === 0 ? '08'.str_pad((string) (70000000 + $i * 1493), 8, '0', STR_PAD_LEFT) : null,
                    'recipient_address' => $i % 5 === 0 ? 'Giao tại '.$location['street'].', '.$location['province_name'] : null,
                    'recipient_address_detail' => $i % 5 === 0 ? 'Gói quà và gọi trước khi giao' : null,
                    'recipient_province_code' => $i % 5 === 0 ? $location['province_code'] : null,
                    'recipient_province_name' => $i % 5 === 0 ? $location['province_name'] : null,
                    'recipient_ward_code' => $i % 5 === 0 ? $location['ward_code'] : null,
                    'recipient_ward_name' => $i % 5 === 0 ? $location['ward_name'] : null,
                    'status' => $status,
                    'payment_method' => $paymentMethod,
                    'payment_status' => $paymentStatus,
                    'vnpay_transaction_no' => $paymentMethod === 'vnpay' ? 'VNP'.date('Ymd').str_pad((string) $i, 7, '0', STR_PAD_LEFT) : null,
                    'vnpay_bank_code' => $paymentMethod === 'vnpay' ? ['NCB', 'VCB', 'TCB'][$i % 3] : null,
                    'vnpay_response_code' => $paymentMethod === 'vnpay' ? '00' : null,
                    'vnpay_transaction_status' => $paymentMethod === 'vnpay' ? '00' : null,
                    'vnpay_paid_at' => $paymentMethod === 'vnpay' && $paymentStatus === 'paid' ? $createdAt->copy()->addMinutes(10) : null,
                    'subtotal' => $subtotal,
                    'shipping_fee' => $shippingFee,
                    'tax' => $tax,
                    'discount' => $discount,
                    'total' => $total,
                    'note' => ['Gói quà màu kem.', 'Giao giờ hành chính.', 'Tư vấn thêm cách bảo quản.', null][$i % 4],
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt->copy()->addDays(min(7, $i % 9)),
                ]
            );

            $orderId = DB::table('orders')->where('order_number', $orderNumber)->value('id');
            $this->upsertOrderItem(500000 + ($i * 10) + 1, $orderId, $productA, $quantityA, $createdAt);
            $this->upsertOrderItem(500000 + ($i * 10) + 2, $orderId, $productB, $quantityB, $createdAt);

            if ($i % 60 === 0) {
                $this->command?->line("Seeded {$i}/480 orders...");
            }
        }
    }

    private function upsertOrderItem(int $id, int $orderId, Product $product, int $quantity, $createdAt): void
    {
        DB::table('order_items')->updateOrInsert(
            ['id' => $id],
            [
                'order_id' => $orderId,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_image' => $product->getRawImagePath(),
                'price' => $product->price,
                'quantity' => $quantity,
                'line_total' => $product->price * $quantity,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]
        );
    }

    private function seedFavorites(array $users, $products): void
    {
        $productIds = $products->keys()->values()->all();

        foreach ($users as $index => $user) {
            for ($slot = 0; $slot < 3; $slot++) {
                DB::table('favorite_products')->updateOrInsert(
                    [
                        'user_id' => $user->id,
                        'product_id' => $productIds[(($index * 5) + ($slot * 11)) % count($productIds)],
                    ],
                    [
                        'created_at' => now()->subDays(($index + $slot) % 90),
                        'updated_at' => now(),
                    ]
                );
            }

            if ($index % 45 === 0) {
                $this->command?->line("Seeded favorites for {$index}/180 customers...");
            }
        }
    }

    private function seedReviews(array $users, $products): void
    {
        $completedOrders = DB::table('orders')
            ->where('order_number', 'like', 'DC-DEMO-%')
            ->where('status', 'completed')
            ->orderBy('id')
            ->limit(220)
            ->get();

        foreach ($completedOrders as $index => $order) {
            $item = DB::table('order_items')
                ->where('order_id', $order->id)
                ->whereNotNull('product_id')
                ->orderBy('id')
                ->first();

            if (! $item || ! $order->user_id) {
                continue;
            }

            DB::table('product_reviews')->updateOrInsert(
                [
                    'product_id' => $item->product_id,
                    'user_id' => $order->user_id,
                ],
                [
                    'order_id' => $order->id,
                    'order_item_id' => $item->id,
                    'rating' => [5, 5, 4, 5, 4][$index % 5],
                    'content' => $this->reviewContents[$index % count($this->reviewContents)],
                    'created_at' => now()->subDays(max(1, 120 - ($index % 120))),
                    'updated_at' => now(),
                ]
            );

            if (($index + 1) % 40 === 0) {
                $this->command?->line('Seeded '.($index + 1).' reviews...');
            }
        }
    }
}
