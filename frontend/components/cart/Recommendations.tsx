"use client";

import ProductCard from "@/components/home/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function Recommendations() {
  const { token } = useAuth();
  const { cart, guestToken, isCartReady } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isCartReady || !guestToken) return;
    const controller = new AbortController();
    const exclude = cart.map((item) => item.id).join(",");
    setIsLoading(true);
    setError("");

    fetch(`/api/recommendations?limit=4&exclude=${encodeURIComponent(exclude)}`, {
      headers: {
        Accept: "application/json",
        "X-Cart-Token": guestToken,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "Không thể tải gợi ý.");
        setProducts(payload);
      })
      .catch((fetchError) => {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Không thể tải gợi ý.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [cart, guestToken, isCartReady, token]);

  return (
    <section className="mt-14 bg-[#f5f0e7] px-5 py-10 text-[#28171a] sm:px-8" aria-labelledby="recommendation-title">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#7a2130]">
            <Sparkles className="h-4 w-4" /> Dành riêng cho bạn
          </p>
          <h2 id="recommendation-title" className="mt-3 font-serif text-3xl font-normal text-[#28171a] sm:text-4xl">
            Có thể bạn sẽ thích
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-[#756568]">
          Gợi ý được xếp hạng từ sản phẩm bạn đã xem, yêu thích và từng mua.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Đang tải sản phẩm gợi ý">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="aspect-[4/5] bg-[#e8dfd1]" />
              <div className="mt-4 h-4 w-2/3 bg-[#e8dfd1]" />
              <div className="mt-3 h-6 bg-[#e8dfd1]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700" role="alert">{error}</div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-[#28171a]/20 px-5 py-10 text-center text-sm text-[#756568]">
          Chưa có đủ dữ liệu để tạo gợi ý phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
              {product.recommendation_reason && (
                <p className="mt-3 border-l-2 border-[#d6bd7a] pl-3 text-xs leading-5 text-[#756568]">
                  {product.recommendation_reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
