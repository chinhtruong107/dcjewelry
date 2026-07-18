"use client";

import CartItemList from "@/components/cart/CartItemList";
import EmptyCart from "@/components/cart/EmptyCart";
import OrderSummary from "@/components/cart/OrderSummary";
import Recommendations from "@/components/cart/Recommendations";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Cart() {
  const { cart, isCartReady, cartError, refreshCart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!isCartReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070607] px-5 text-center text-[#f7efe1]">
        <div>
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#d6bd7a]/30 border-t-[#d6bd7a]" />
          <p className="mt-4 text-sm text-[#cfc4ad]/75">Đang đồng bộ giỏ hàng...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0 && cartError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070607] px-5 text-center text-[#f7efe1]">
        <div className="max-w-lg border border-rose-400/30 bg-rose-950/30 p-6">
          <h1 className="font-serif text-3xl">Chưa tải được giỏ hàng</h1>
          <p className="mt-3 text-sm leading-6 text-rose-100/80">{cartError}</p>
          <button type="button" onClick={() => refreshCart().catch(() => undefined)} className="mt-5 h-11 border border-[#d6bd7a] px-5 text-xs font-bold uppercase tracking-[0.16em] text-[#d6bd7a] hover:bg-[#d6bd7a] hover:text-black">Thử lại</button>
        </div>
      </main>
    );
  }

  if (cart.length === 0) return <EmptyCart />;

  return (
    <div className="min-h-screen bg-[#070607] text-[#f7efe1]">
      <div className="mx-auto max-w-[1500px] border-x border-[#d6bd7a]/15 px-5 py-12 sm:px-8 lg:px-14">
        <div className="mb-10 flex flex-col gap-5 border-b border-[#d6bd7a]/18 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d6bd7a]">Shopping bag</p>
            <h1 className="mt-3 font-serif text-5xl font-light text-[#f7efe1]">Giỏ hàng</h1>
            <p className="mt-3 text-[#cfc4ad]/75">{itemCount} sản phẩm trong giỏ hàng của bạn</p>
          </div>
          <Button variant="ghost" asChild className="h-11 rounded-none border border-[#d6bd7a]/30 px-5 text-[#f7efe1] hover:bg-[#d6bd7a] hover:text-black">
            <Link href="/" className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Tiếp tục mua sắm</Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {cartError && (
            <p className="border border-rose-400/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-100 lg:col-span-2" role="alert">
              {cartError}
            </p>
          )}
          <div className="space-y-6"><CartItemList /></div>
          <OrderSummary />
        </div>

        <Recommendations />
      </div>
    </div>
  );
}
