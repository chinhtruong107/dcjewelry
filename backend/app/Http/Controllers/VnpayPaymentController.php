<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\VnpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class VnpayPaymentController extends Controller
{
    public function handleReturn(Request $request, VnpayService $vnpay)
    {
        $params = $request->query();

        if (! $vnpay->verify($params)) {
            return redirect()->away($vnpay->frontendResultUrl([
                'status' => 'invalid',
                'message' => 'Chữ ký thanh toán không hợp lệ.',
            ]));
        }

        $order = Order::where('order_number', $params['vnp_TxnRef'] ?? null)->first();

        if (! $order) {
            return redirect()->away($vnpay->frontendResultUrl([
                'status' => 'not_found',
                'message' => 'Không tìm thấy đơn hàng.',
            ]));
        }

        if ((int) ($params['vnp_Amount'] ?? 0) !== $order->total * 100) {
            return redirect()->away($vnpay->frontendResultUrl([
                'status' => 'invalid',
                'order' => $order->order_number,
                'message' => 'Số tiền thanh toán không khớp với đơn hàng.',
            ]));
        }

        if ($order->status === 'cancelled') {
            return redirect()->away($vnpay->frontendResultUrl([
                'status' => 'cancelled',
                'order' => $order->order_number,
                'message' => 'Đơn hàng đã bị hủy trước khi thanh toán hoàn tất.',
            ]));
        }

        $this->applyPaymentResult($order, $params);

        $isSuccess = ($params['vnp_ResponseCode'] ?? null) === '00'
            && ($params['vnp_TransactionStatus'] ?? null) === '00';

        return redirect()->away($vnpay->frontendResultUrl([
            'status' => $isSuccess ? 'success' : 'failed',
            'order' => $order->order_number,
            'code' => $params['vnp_ResponseCode'] ?? '',
            'amount' => $order->total,
        ]));
    }

    public function ipn(Request $request, VnpayService $vnpay)
    {
        $params = $request->query();

        if (! $vnpay->verify($params)) {
            return response()->json([
                'RspCode' => '97',
                'Message' => 'Invalid checksum',
            ]);
        }

        $order = Order::where('order_number', $params['vnp_TxnRef'] ?? null)->first();

        if (! $order) {
            return response()->json([
                'RspCode' => '01',
                'Message' => 'Order not found',
            ]);
        }

        if ((int) ($params['vnp_Amount'] ?? 0) !== $order->total * 100) {
            return response()->json([
                'RspCode' => '04',
                'Message' => 'Invalid amount',
            ]);
        }

        if ($order->status === 'cancelled') {
            return response()->json([
                'RspCode' => '02',
                'Message' => 'Order already cancelled',
            ]);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'RspCode' => '02',
                'Message' => 'Order already confirmed',
            ]);
        }

        $this->applyPaymentResult($order, $params);

        return response()->json([
            'RspCode' => '00',
            'Message' => 'Confirm Success',
        ]);
    }

    private function applyPaymentResult(Order $order, array $params): void
    {
        $isSuccess = ($params['vnp_ResponseCode'] ?? null) === '00'
            && ($params['vnp_TransactionStatus'] ?? null) === '00';

        $payDate = isset($params['vnp_PayDate'])
            ? Carbon::createFromFormat('YmdHis', $params['vnp_PayDate'], 'Asia/Ho_Chi_Minh')
            : null;

        $order->forceFill([
            'payment_status' => $isSuccess ? 'paid' : 'unpaid',
            'status' => $isSuccess ? 'processing' : $order->status,
            'vnpay_transaction_no' => $params['vnp_TransactionNo'] ?? null,
            'vnpay_bank_code' => $params['vnp_BankCode'] ?? null,
            'vnpay_response_code' => $params['vnp_ResponseCode'] ?? null,
            'vnpay_transaction_status' => $params['vnp_TransactionStatus'] ?? null,
            'vnpay_paid_at' => $isSuccess ? $payDate : null,
        ])->save();
    }
}
