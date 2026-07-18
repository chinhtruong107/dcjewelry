import { Button } from "@/components/ui/button";
import { Shield, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="min-h-screen bg-[#070607] text-[#f7efe1]">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1500px] items-center justify-center border-x border-[#d6bd7a]/15 px-5 py-24 sm:px-8 lg:px-14">
        <div className="max-w-2xl border border-[#d6bd7a]/22 bg-[#0d0b0a] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <ShoppingBag className="mx-auto mb-6 h-20 w-20 text-[#d6bd7a]" />
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d6bd7a]">Shopping bag</p>
          <h1 className="mt-4 font-serif text-4xl font-light text-[#f7efe1]">Giỏ hàng đang trống</h1>
          <p className="mx-auto mt-4 max-w-xl text-[#cfc4ad]/75">Bạn chưa thêm thiết kế trang sức nào vào giỏ hàng.</p>
          <Button asChild size="lg" className="mt-8 h-12 rounded-none border border-[#d6bd7a] bg-[#d6bd7a] px-8 text-xs font-bold uppercase tracking-[0.22em] text-black hover:bg-[#f4df9b]"><Link href="/">Trở lại cửa hàng</Link></Button>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm text-[#cfc4ad]/70 sm:flex-row">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#d6bd7a]" /> Miễn phí vận chuyển từ 500.000đ</div>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#d6bd7a]" /> Thanh toán an toàn</div>
          </div>
        </div>
      </div>
    </div>
  );
}
