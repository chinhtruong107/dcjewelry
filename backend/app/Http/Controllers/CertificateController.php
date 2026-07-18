<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;

class CertificateController extends Controller
{
    public function show(string $certificateCode)
    {
        $item = OrderItem::with(['order:id,order_number,status,created_at,delivered_at'])
            ->where('certificate_code', $certificateCode)
            ->firstOrFail();

        return response()->json([
            'certificate_code' => $item->certificate_code,
            'order_number' => $item->order?->order_number,
            'order_status' => $item->order?->status,
            'product_name' => $item->product_name,
            'product_image' => $item->product_image,
            'warranty_months' => $item->warranty_months,
            'warranty_starts_at' => $item->warranty_starts_at,
            'warranty_expires_at' => $item->warranty_expires_at,
            'is_valid' => $item->warranty_expires_at?->isFuture() ?? false,
            'issued_at' => $item->order?->created_at,
        ]);
    }
}
