<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\DemoShippingService;
use App\Services\ResendEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShipmentController extends Controller
{
    public function create(Request $request, Order $order, DemoShippingService $shipping, ResendEmailService $email)
    {
        $validated = $request->validate([
            'carrier' => ['required', 'string', 'in:ghn,ghtk'],
        ]);
        $order = $shipping->createShipment($order, $validated['carrier']);
        $this->sendOrderEmail($email, $order);

        return response()->json($this->payload($order, $shipping));
    }

    public function show(Request $request, Order $order, DemoShippingService $shipping)
    {
        abort_unless($request->user() && $order->user_id === $request->user()->id, 403);

        return response()->json($this->payload($order->load('shipmentEvents'), $shipping));
    }

    public function track(string $trackingNumber, DemoShippingService $shipping)
    {
        $order = Order::with('shipmentEvents')
            ->where('tracking_number', $trackingNumber)
            ->firstOrFail();

        return response()->json($this->payload($order, $shipping));
    }

    private function payload(Order $order, DemoShippingService $shipping): array
    {
        $order->loadMissing('shipmentEvents');

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'shipping_carrier' => $order->shipping_carrier,
            'shipping_carrier_label' => $shipping->carrierLabel($order->shipping_carrier),
            'tracking_number' => $order->tracking_number,
            'tracking_url' => $order->tracking_url,
            'shipped_at' => $order->shipped_at,
            'delivered_at' => $order->delivered_at,
            'estimated_delivery_at' => $order->shipped_at?->copy()->addDays(3),
            'events' => $order->shipmentEvents,
            'is_demo' => true,
        ];
    }

    private function sendOrderEmail(ResendEmailService $email, Order $order): void
    {
        try {
            $email->sendOrderStatusNotification($order);
        } catch (\Throwable $exception) {
            Log::warning('Order shipment email could not be sent.', [
                'order_id' => $order->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
