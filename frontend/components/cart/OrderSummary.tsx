"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatVND } from "@/lib/utils";
import { CreditCard, Shield, Tag, Truck } from "lucide-react";
import Link from "next/link";

export default function OrderSummary() {
  const { cart } = useCart();
  const { user } = useAuth();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const tax = subtotal * 0.08;
  const discount = user ? subtotal * 0.05 : 0;
  const total = subtotal + shipping + tax - discount;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="sticky top-24 border border-[#d6bd7a]/25 bg-[#0d0b0a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d6bd7a]">Order summary</p>
      <h2 className="mt-3 font-serif text-3xl font-light text-[#f7efe1]">Tóm tắt đơn hàng</h2>

      <div className="mt-7 space-y-4 border-t border-[#d6bd7a]/18 pt-6">
        <Row label={`Tạm tính (${itemCount} sản phẩm)`} value={formatVND(subtotal)} />
        <div className="flex justify-between gap-4 text-sm"><span className="text-[#cfc4ad]/75">Vận chuyển</span><span className="font-medium text-[#f7efe1]">{shipping === 0 ? <Badge className="rounded-none bg-[#d6bd7a] text-black hover:bg-[#d6bd7a]">Miễn phí</Badge> : formatVND(shipping)}</span></div>
        <Row label="Thuế" value={formatVND(tax)} />
        {user ? (
          <div className="flex justify-between gap-4 border border-[#d6bd7a]/20 bg-[#d6bd7a]/8 p-3 text-sm font-medium text-[#d6bd7a]"><span className="flex items-center gap-2"><Tag className="h-4 w-4" /> Thành viên (giảm 5%)</span><span>-{formatVND(discount)}</span></div>
        ) : (
          <div className="flex items-start gap-2 border border-[#d6bd7a]/16 bg-black/22 p-3 text-xs leading-6 text-[#cfc4ad]/75"><Tag className="mt-1 h-4 w-4 shrink-0 text-[#d6bd7a]" /><span>Đăng nhập để nhận ưu đãi thành viên.</span></div>
        )}
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-[#d6bd7a]/18 pt-6">
        <span className="text-sm uppercase tracking-[0.2em] text-[#cfc4ad]/70">Tổng cộng</span>
        <span className="text-3xl font-bold text-[#d6bd7a]">{formatVND(total)}</span>
      </div>

      {shipping > 0 && (
        <div className="mt-6 border border-[#d6bd7a]/16 bg-black/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#f7efe1]"><Truck className="h-4 w-4 text-[#d6bd7a]" /> Miễn phí vận chuyển từ {formatVND(500000)}</div>
          <p className="text-xs text-[#cfc4ad]/70">Thêm {formatVND(Math.max(0, 500000 - subtotal))} để nhận ưu đãi.</p>
        </div>
      )}

      <Button size="lg" className="mt-6 h-12 w-full rounded-none border border-[#d6bd7a] bg-[#d6bd7a] text-xs font-bold uppercase tracking-[0.22em] text-black shadow-none hover:bg-[#f4df9b]" asChild>
        <Link href="/checkout"><CreditCard className="h-4 w-4" /> Tiến hành thanh toán</Link>
      </Button>

      <div className="mt-6 space-y-3 border-t border-[#d6bd7a]/18 pt-5 text-sm text-[#cfc4ad]/75">
        <div className="flex items-center gap-3"><Shield className="h-4 w-4 text-[#d6bd7a]" /> Thanh toán an toàn</div>
        <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-[#d6bd7a]" /> Giao hàng nhanh và cẩn trọng</div>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 text-sm"><span className="text-[#cfc4ad]/75">{label}</span><span className="font-medium text-[#f7efe1]">{value}</span></div>;
}
