<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use RuntimeException;

class VnpayService
{
    public function isConfigured(): bool
    {
        return filled(config('services.vnpay.payment_url'))
            && filled(config('services.vnpay.tmn_code'))
            && filled(config('services.vnpay.hash_secret'))
            && filled(config('services.vnpay.return_url'));
    }

    public function createPaymentUrl(Order $order, Request $request): string
    {
        $paymentUrl = config('services.vnpay.payment_url');
        $tmnCode = config('services.vnpay.tmn_code');
        $hashSecret = config('services.vnpay.hash_secret');

        if (! $this->isConfigured()) {
            throw new RuntimeException('VNPay chưa được cấu hình đầy đủ.');
        }

        $now = Carbon::now('Asia/Ho_Chi_Minh');
        $params = [
            'vnp_Version' => '2.1.0',
            'vnp_Command' => 'pay',
            'vnp_TmnCode' => $tmnCode,
            'vnp_Amount' => (string) ($order->total * 100),
            'vnp_CreateDate' => $now->format('YmdHis'),
            'vnp_CurrCode' => 'VND',
            'vnp_IpAddr' => $request->ip() ?: '127.0.0.1',
            'vnp_Locale' => 'vn',
            'vnp_OrderInfo' => Str::ascii('Thanh toan don hang '.$order->order_number),
            'vnp_OrderType' => 'other',
            'vnp_ReturnUrl' => config('services.vnpay.return_url'),
            'vnp_TxnRef' => $order->order_number,
            'vnp_ExpireDate' => $now->copy()->addMinutes(15)->format('YmdHis'),
        ];

        ksort($params);
        $query = http_build_query($params);
        $secureHash = hash_hmac('sha512', $query, $hashSecret);

        return $paymentUrl.'?'.$query.'&vnp_SecureHash='.$secureHash;
    }

    public function verify(array $params): bool
    {
        $secureHash = $params['vnp_SecureHash'] ?? null;
        $hashSecret = config('services.vnpay.hash_secret');

        if (! $hashSecret) {
            return false;
        }

        unset($params['vnp_SecureHash'], $params['vnp_SecureHashType']);
        ksort($params);

        $hashData = http_build_query($params);
        $expectedHash = hash_hmac('sha512', $hashData, $hashSecret);

        return is_string($secureHash) && hash_equals($expectedHash, $secureHash);
    }

    public function frontendResultUrl(array $query): string
    {
        $frontendUrl = rtrim(config('services.vnpay.frontend_url'), '/');

        return $frontendUrl.'/payment/vnpay-result?'.http_build_query($query);
    }
}
