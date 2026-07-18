"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, ShoppingBag, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { formatVND } from "@/lib/utils";
import { removeStoredValue, STORAGE_KEYS } from "@/lib/storageKeys";

function VnpayResultContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const status = searchParams.get("status");
  const orderNumber = searchParams.get("order");
  const code = searchParams.get("code");
  const amount = Number(searchParams.get("amount") || 0);
  const message = searchParams.get("message");
  const isSuccess = status === "success";
  const isFailed = status === "failed";

  useEffect(() => {
    if (isSuccess) {
      clearCart();
      removeStoredValue(STORAGE_KEYS.pendingVnpayOrder);
    }
  }, [clearCart, isSuccess]);

  const Icon = isSuccess ? CheckCircle2 : isFailed ? XCircle : AlertTriangle;
  const tone = isSuccess
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isFailed
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
  const title = isSuccess
    ? "Thanh toán VNPay thành công"
    : isFailed
      ? "Thanh toán VNPay chưa thành công"
      : "Không xác thực được giao dịch";
  const description = isSuccess
    ? "Đức Chính Jewelry đã ghi nhận thanh toán và đang xử lý đơn hàng của bạn."
    : isFailed
      ? "Giao dịch chưa được thanh toán. Bạn có thể quay lại giỏ hàng hoặc liên hệ Đức Chính Jewelry để được hỗ trợ."
      : message || "Thông tin trả về từ VNPay không hợp lệ hoặc đơn hàng không tồn tại.";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-3xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full border-border bg-card shadow-lg">
        <CardContent className="p-8 text-center sm:p-10">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${tone}`}>
            <Icon className="h-8 w-8" />
          </div>

          <div className="mt-6 space-y-3">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mt-7 grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-left text-sm">
            {orderNumber && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Mã đơn hàng</span>
                <span className="font-semibold text-foreground">{orderNumber}</span>
              </div>
            )}
            {amount > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-semibold text-primary">{formatVND(amount)}</span>
              </div>
            )}
            {code && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Mã phản hồi VNPay</span>
                <span className="font-semibold text-foreground">{code}</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="h-11 rounded-lg">
              <Link href="/">
                <ShoppingBag className="h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </Button>
            {!isSuccess && (
              <Button asChild variant="outline" className="h-11 rounded-lg">
                <Link href="/cart">Quay lại giỏ hàng</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VnpayResultPage() {
  return (
    <Suspense fallback={null}>
      <VnpayResultContent />
    </Suspense>
  );
}
