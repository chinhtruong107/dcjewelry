"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Trash2 } from "lucide-react";
import CartItem from "./CartItem";
import { useState } from "react";

export default function CartItemList() {
  const { cart, clearCart } = useCart();
  const [isClearing, setIsClearing] = useState(false);
  const handleClear = async () => {
    setIsClearing(true);
    try {
      await clearCart();
    } catch {
      // CartContext displays the request error.
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <section className="border border-[#d6bd7a]/22 bg-[#0d0b0a] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#d6bd7a]/18 pb-5">
        <h2 className="font-serif text-2xl text-[#f7efe1]">Sản phẩm trong giỏ</h2>
        <Button variant="ghost" size="sm" onClick={handleClear} disabled={isClearing} className="rounded-none border border-[#d6bd7a]/18 text-[#cfc4ad] hover:border-[#d6bd7a] hover:bg-[#d6bd7a] hover:text-black">
          <Trash2 className="mr-2 h-4 w-4" /> {isClearing ? "Đang xóa..." : "Xóa tất cả"}
        </Button>
      </div>
      <div className="space-y-5">{cart.map((item, index) => <CartItem key={`${item.id}-${index}`} item={item} isLast={index === cart.length - 1} />)}</div>
    </section>
  );
}
