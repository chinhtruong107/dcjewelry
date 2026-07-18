"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { cn, fixVietnameseText, formatVND, productImageUrl } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Check, Heart, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isLiked = isFavorite(product.id);
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState("");
  const imageUrl = productImageUrl(product.image);
  const category = fixVietnameseText(product.category);
  const stock = product.stock ?? 100;
  const isOutOfStock = stock <= 0 || product.status === "inactive";

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    setCartError("");
    try {
      await addToCart({ id: product.id, name: product.name, price: product.price, image: imageUrl, quantity: 1, stock });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng.");
      setTimeout(() => setCartError(""), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleLike = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden bg-[#ede5d9]">
        <Link href={`/product/${product.id}`} className="block aspect-[4/5] overflow-hidden">
          {!imageError ? (
            <Image src={imageUrl} alt={product.name} width={600} height={750} className={cn("h-full w-full object-cover mix-blend-multiply transition duration-700 ease-out group-hover:scale-[1.035]", isOutOfStock && "opacity-45 grayscale")} onError={() => setImageError(true)} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-[#89787a]">Chưa có hình ảnh</div>
          )}
        </Link>
        <div className="absolute left-4 top-4 flex gap-2">
          {(product.isBestSeller || product.is_best_seller) && <span className="bg-[#7a2130] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white">Bestseller</span>}
          {isOutOfStock && <span className="bg-[#28171a] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white">Hết hàng</span>}
        </div>
        <Button variant="ghost" size="icon" className={cn("absolute right-3 top-3 h-10 w-10 rounded-full bg-[#fffaf3]/90 text-[#28171a] shadow-sm backdrop-blur transition hover:bg-[#7a2130] hover:text-white", isLiked && "bg-[#7a2130] text-white")} onClick={handleToggleLike} aria-label="Yêu thích">
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </Button>
        <Button className={cn("absolute bottom-4 right-4 h-11 w-11 translate-y-3 rounded-full bg-[#fffaf3] p-0 text-[#28171a] opacity-0 shadow-[0_8px_30px_rgba(45,22,27,0.15)] transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#7a2130] hover:text-white", justAdded && "translate-y-0 bg-[#7a2130] text-white opacity-100")} onClick={handleAddToCart} disabled={isAdding || isOutOfStock} aria-label="Thêm vào giỏ">
          {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      <div className="pt-5">
        {cartError && <p className="mb-2 text-xs font-medium text-rose-700" role="alert">{cartError}</p>}
        <div className="flex items-center justify-between gap-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8a777a]">
          <span>{category || "Fine jewelry"}</span><span>{stock <= 10 && !isOutOfStock ? "Limited" : ""}</span>
        </div>
        <Link href={`/product/${product.id}`}><h2 className="mt-2 line-clamp-2 min-h-[3.5rem] font-serif text-[1.55rem] font-normal leading-7 text-[#28171a] transition group-hover:text-[#7a2130]">{product.name}</h2></Link>
        <div className="mt-3 flex items-center justify-between border-t border-[#28171a]/10 pt-3">
          <span className="text-sm font-semibold text-[#7a2130]">{formatVND(product.price)}</span>
          <button onClick={handleAddToCart} disabled={isAdding || isOutOfStock} className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#28171a] underline decoration-[#7a2130]/40 underline-offset-4 transition hover:text-[#7a2130] disabled:opacity-40">
            {isOutOfStock ? "Hết hàng" : isAdding ? "Đang thêm" : justAdded ? "Đã thêm" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </article>
  );
}
