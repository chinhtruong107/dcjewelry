"use client";

import ProductCard from "@/components/home/ProductCard";
import { fixVietnameseText } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RelatedProductsProps {
  product: Product;
}

export default function RelatedProducts({ product }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const category = fixVietnameseText(product.category);

  useEffect(() => {
    const query = product.category ? `?category=${encodeURIComponent(product.category)}` : "";

    fetch(`/api/products${query}`)
      .then(async (response) => {
        if (!response.ok) return [];
        return response.json();
      })
      .then((products: Product[]) => {
        setRelatedProducts(products.filter((item) => item.id !== product.id).slice(0, 4));
      })
      .catch(() => setRelatedProducts([]));
  }, [product.category, product.id]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="pt-16">
      <div className="mb-12 flex flex-col gap-6 border-b border-[#28171a]/12 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-5">
          <span className="hidden pb-2 font-serif text-5xl italic text-[#7a2130]/25 sm:block">/</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7a2130]">
              {category || "Related edit"}
            </p>
            <h2 className="mt-3 font-serif text-4xl font-normal tracking-[-0.04em] text-[#28171a] sm:text-5xl lg:text-6xl">
              Có thể bạn sẽ thích
            </h2>
          </div>
        </div>
        <Link
          href={category ? `/search?q=${encodeURIComponent(category)}` : "/"}
          className="inline-flex items-center gap-2 self-start text-[10px] font-bold uppercase tracking-[0.22em] text-[#28171a] transition hover:text-[#7a2130] sm:self-auto"
        >
          Xem thêm <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
        ))}
      </div>
    </section>
  );
}
