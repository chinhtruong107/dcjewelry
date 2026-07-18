<?php

namespace App\Services;

use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\ReturnRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class ResendEmailService
{
    public function canSendTransactionalEmail(): bool
    {
        return ! app()->environment('testing')
            && filled(config('services.resend.key'))
            && filled(config('services.resend.from'));
    }

    public function canSendContactNotification(): bool
    {
        return filled(config('services.resend.key'))
            && filled(config('services.resend.from'))
            && filled(config('services.resend.contact_to'));
    }

    public function sendTemporaryPassword(string $to, string $name, string $temporaryPassword): void
    {
        $apiKey = config('services.resend.key');
        $from = config('services.resend.from');

        if (! $apiKey || ! $from) {
            throw new RuntimeException('Resend is not configured.');
        }

        $safeName = e($name ?: 'khách hàng');
        $safePassword = e($temporaryPassword);
        $subject = 'Mật khẩu mới cho tài khoản Đức Chính Jewelry';
        $text = "Xin chào {$name},\n\n"
            ."Mật khẩu tạm thời mới của bạn là: {$temporaryPassword}\n\n"
            ."Hãy đăng nhập bằng mật khẩu này. Sau khi đăng nhập, hệ thống sẽ yêu cầu bạn đổi sang mật khẩu mới ngay.\n\n"
            .'Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng liên hệ Đức Chính Jewelry để được hỗ trợ.';

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->post('https://api.resend.com/emails', [
                'from' => $from,
                'to' => [$to],
                'subject' => $subject,
                'html' => <<<HTML
                    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px">
                        <p>Xin chào {$safeName},</p>
                        <p>Đức Chính Jewelry đã tạo mật khẩu tạm thời mới cho tài khoản của bạn:</p>
                        <p style="display:inline-block;padding:12px 16px;background:#f3f4f6;border-radius:8px;font-size:20px;font-weight:700;letter-spacing:1px;color:#111827">{$safePassword}</p>
                        <p>Hãy đăng nhập bằng mật khẩu này. Sau khi đăng nhập, hệ thống sẽ yêu cầu bạn đổi sang mật khẩu mới ngay.</p>
                        <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng liên hệ Đức Chính Jewelry để được hỗ trợ.</p>
                        <p style="margin-top:24px;color:#6b7280;font-size:13px">Đức Chính Jewelry</p>
                    </div>
                    HTML,
                'text' => $text,
            ]);

        if ($response->failed()) {
            $message = data_get($response->json(), 'message')
                ?: data_get($response->json(), 'error')
                ?: Str::limit($response->body(), 300);

            throw new RuntimeException(trim('Resend email request failed with status '.$response->status().': '.$message));
        }
    }

    public function sendContactNotification(ContactMessage $contactMessage): void
    {
        if (! $this->canSendContactNotification()) {
            throw new RuntimeException('Resend contact notification is not configured.');
        }

        $safeName = e($contactMessage->name);
        $safeEmail = e($contactMessage->email);
        $safeSubject = e($contactMessage->subject);
        $safeMessage = nl2br(e($contactMessage->message));
        $reference = 'LH-'.str_pad((string) $contactMessage->id, 6, '0', STR_PAD_LEFT);

        $this->send([
            'from' => config('services.resend.from'),
            'to' => [config('services.resend.contact_to')],
            'reply_to' => $contactMessage->email,
            'subject' => "[{$reference}] {$contactMessage->subject}",
            'html' => <<<HTML
                <div style="font-family:Arial,sans-serif;line-height:1.65;color:#28171a;max-width:640px">
                    <p style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#7a2130">Đức Chính Jewelry · Yêu cầu liên hệ mới</p>
                    <h1 style="font-size:24px">{$safeSubject}</h1>
                    <p><strong>Mã yêu cầu:</strong> {$reference}</p>
                    <p><strong>Khách hàng:</strong> {$safeName}</p>
                    <p><strong>Email:</strong> {$safeEmail}</p>
                    <div style="margin-top:20px;padding:18px;background:#fff9ef;border-left:4px solid #7a2130">{$safeMessage}</div>
                </div>
                HTML,
            'text' => "{$reference}\nKhách hàng: {$contactMessage->name}\nEmail: {$contactMessage->email}\nChủ đề: {$contactMessage->subject}\n\n{$contactMessage->message}",
        ]);
    }

    public function sendOrderStatusNotification(Order $order): void
    {
        if (! $this->canSendTransactionalEmail() || ! $order->customer_email) {
            return;
        }

        $order->loadMissing('items');
        $statusLabels = [
            'pending' => 'Đã tiếp nhận',
            'processing' => 'Đang chuẩn bị',
            'shipping' => 'Đang giao hàng',
            'completed' => 'Đã giao thành công',
            'cancelled' => 'Đã hủy',
        ];
        $statusLabel = $statusLabels[$order->status] ?? $order->status;
        $safeName = e($order->customer_name);
        $safeOrderNumber = e($order->order_number);
        $safeStatus = e($statusLabel);
        $safeTrackingNumber = e($order->tracking_number ?: 'Chưa có');
        $safeCarrier = e($order->shipping_carrier ? strtoupper($order->shipping_carrier).' (demo)' : 'Chưa chỉ định');
        $trackingLink = $order->tracking_url
            ? '<p><a href="'.e($order->tracking_url).'" style="display:inline-block;padding:12px 18px;background:#7a2130;color:#fff;text-decoration:none">Theo dõi đơn hàng</a></p>'
            : '';
        $items = $order->items
            ->map(fn ($item) => e($item->product_name).' × '.(int) $item->quantity)
            ->implode('<br>');
        $total = number_format((int) $order->total, 0, ',', '.').' đ';

        $this->send([
            'from' => config('services.resend.from'),
            'to' => [$order->customer_email],
            'subject' => "[{$order->order_number}] {$statusLabel} - Đức Chính Jewelry",
            'html' => <<<HTML
                <div style="font-family:Arial,sans-serif;line-height:1.65;color:#28171a;max-width:640px;margin:auto">
                    <p style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#7a2130">Đức Chính Jewelry · Cập nhật đơn hàng</p>
                    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:500">{$safeStatus}</h1>
                    <p>Xin chào {$safeName}, đơn hàng <strong>{$safeOrderNumber}</strong> vừa được cập nhật.</p>
                    <div style="padding:18px;background:#fff9ef;border-left:4px solid #d6bd7a">
                        <p style="margin:0 0 8px"><strong>Sản phẩm</strong><br>{$items}</p>
                        <p style="margin:0 0 8px"><strong>Tổng thanh toán:</strong> {$total}</p>
                        <p style="margin:0 0 8px"><strong>Đơn vị vận chuyển:</strong> {$safeCarrier}</p>
                        <p style="margin:0"><strong>Mã vận đơn:</strong> {$safeTrackingNumber}</p>
                    </div>
                    {$trackingLink}
                    <p style="margin-top:24px;color:#6b7280;font-size:13px">Đây là email tự động từ Đức Chính Jewelry.</p>
                </div>
                HTML,
            'text' => "Đơn hàng {$order->order_number}: {$statusLabel}\nMã vận đơn: ".($order->tracking_number ?: 'Chưa có')."\nTổng thanh toán: {$total}",
        ]);
    }

    public function sendReturnRequestNotification(ReturnRequest $returnRequest): void
    {
        if (! $this->canSendTransactionalEmail() || ! $returnRequest->user?->email) {
            return;
        }

        $typeLabels = [
            'return' => 'Trả hàng',
            'exchange' => 'Đổi hàng',
            'warranty' => 'Bảo hành',
        ];
        $statusLabels = [
            'pending' => 'Đang chờ duyệt',
            'approved' => 'Đã chấp thuận',
            'rejected' => 'Đã từ chối',
            'received' => 'Đã nhận sản phẩm',
            'refunded' => 'Đã hoàn tiền',
            'completed' => 'Đã hoàn tất',
        ];
        $type = $typeLabels[$returnRequest->type] ?? $returnRequest->type;
        $status = $statusLabels[$returnRequest->status] ?? $returnRequest->status;
        $safeName = e($returnRequest->user->name);
        $safeNumber = e($returnRequest->request_number);
        $safeProduct = e($returnRequest->orderItem?->product_name ?: 'Sản phẩm');
        $safeNote = nl2br(e($returnRequest->admin_note ?: 'Chúng tôi sẽ liên hệ khi có cập nhật mới.'));

        $this->send([
            'from' => config('services.resend.from'),
            'to' => [$returnRequest->user->email],
            'subject' => "[{$returnRequest->request_number}] {$type}: {$status}",
            'html' => <<<HTML
                <div style="font-family:Arial,sans-serif;line-height:1.65;color:#28171a;max-width:640px;margin:auto">
                    <p style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#7a2130">Đức Chính Jewelry · Hậu mãi</p>
                    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:500">{$type} · {$status}</h1>
                    <p>Xin chào {$safeName}, yêu cầu <strong>{$safeNumber}</strong> cho {$safeProduct} đã được cập nhật.</p>
                    <div style="padding:18px;background:#fff9ef;border-left:4px solid #d6bd7a">{$safeNote}</div>
                    <p style="margin-top:24px;color:#6b7280;font-size:13px">Đức Chính Jewelry · Đồng hành cùng sản phẩm của bạn.</p>
                </div>
                HTML,
            'text' => "Yêu cầu {$returnRequest->request_number}: {$type} - {$status}\n".($returnRequest->admin_note ?: ''),
        ]);
    }

    private function send(array $payload): void
    {
        $response = Http::withToken(config('services.resend.key'))
            ->acceptJson()
            ->asJson()
            ->post('https://api.resend.com/emails', $payload);

        if ($response->failed()) {
            $message = data_get($response->json(), 'message')
                ?: data_get($response->json(), 'error')
                ?: Str::limit($response->body(), 300);

            throw new RuntimeException(trim('Resend email request failed with status '.$response->status().': '.$message));
        }
    }
}
