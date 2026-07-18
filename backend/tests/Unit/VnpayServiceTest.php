<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Services\VnpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class VnpayServiceTest extends TestCase
{
    public function test_generated_payment_signature_is_valid_and_tampering_is_rejected(): void
    {
        Config::set('services.vnpay.payment_url', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        Config::set('services.vnpay.tmn_code', 'TESTCODE');
        Config::set('services.vnpay.hash_secret', 'test-secret');
        Config::set('services.vnpay.return_url', 'https://example.com/api/payments/vnpay/return');

        $order = new Order(['order_number' => 'DH-TEST-001', 'total' => 618000]);
        $request = Request::create('/api/orders', 'POST', [], [], [], ['REMOTE_ADDR' => '127.0.0.1']);
        $service = app(VnpayService::class);
        parse_str(parse_url($service->createPaymentUrl($order, $request), PHP_URL_QUERY), $params);

        $this->assertTrue($service->verify($params));

        $params['vnp_Amount'] = '1';
        $this->assertFalse($service->verify($params));
    }
}
