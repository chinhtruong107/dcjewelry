"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatVND, productImageUrl } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CartItemProps {
  item: { id: number; name: string; price: number; image: string; quantity: number; stock?: number };
  isLast: boolean;
}

export default function CartItem({ item, isLast }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();
  const stock = item.stock ?? 100;
  const isAtMaxStock = item.quantity >= stock;
  const [isMutating, setIsMutating] = useState(false);
  const mutate = async (action: () => Promise<void>) => {
    if (isMutating) return;
    setIsMutating(true);
    try {
      await action();
    } catch {
      // CartContext exposes the error on the cart page.
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className={isLast ? "" : "border-b border-[#d6bd7a]/16 pb-5"}>
      <div className="grid gap-4 sm:grid-cols-[112px_1fr]">
        <div className="relative h-28 w-28 border border-[#d6bd7a]/18 bg-[#efe7d6]">
          <Image src={productImageUrl(item.image)} alt={item.name} fill sizes="112px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="line-clamp-2 font-serif text-xl leading-7 text-[#f7efe1]">{item.name}</h2>
              <p className="mt-1 text-sm text-[#cfc4ad]/75">{formatVND(item.price)} / sản phẩm</p>
              {isAtMaxStock && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#d6bd7a]">Đã đạt số lượng tối đa</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => mutate(() => removeFromCart(item.id))} disabled={isMutating} className="h-9 w-9 rounded-none border border-[#d6bd7a]/18 text-[#cfc4ad] hover:border-[#d6bd7a] hover:bg-[#d6bd7a] hover:text-black">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center border border-[#d6bd7a]/22">
              <Button variant="ghost" size="icon" onClick={() => mutate(() => updateQuantity(item.id, Math.max(1, item.quantity - 1)))} disabled={item.quantity <= 1 || isMutating} className="h-9 w-9 rounded-none text-[#f7efe1] hover:bg-[#d6bd7a] hover:text-black"><Minus className="h-3 w-3" /></Button>
              <span className="min-w-[54px] border-x border-[#d6bd7a]/18 px-4 py-2 text-center text-sm font-semibold text-[#f7efe1]">{item.quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => mutate(() => updateQuantity(item.id, Math.min(stock, item.quantity + 1)))} disabled={isAtMaxStock || isMutating} className="h-9 w-9 rounded-none text-[#f7efe1] hover:bg-[#d6bd7a] hover:text-black"><Plus className="h-3 w-3" /></Button>
            </div>
            <p className="text-right text-lg font-bold text-[#d6bd7a]">{formatVND(item.price * item.quantity)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
