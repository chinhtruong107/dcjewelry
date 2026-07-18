import type { Product } from "@/types/product";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
  title?: string;
  eyebrow?: string;
  id?: string;
  viewMoreLink?: string;
}

export default function ProductList({ products, title, eyebrow, id, viewMoreLink }: ProductListProps) {
  return (
    <section id={id} className="scroll-mt-32">
      {title && (
        <div className="mb-12 flex flex-col gap-6 border-b border-[#28171a]/12 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-5">
            <span className="hidden pb-2 font-serif text-5xl italic text-[#7a2130]/25 sm:block">/</span>
            <div>
              {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7a2130]">{eyebrow}</p>}
              <h2 className="mt-3 font-serif text-4xl font-normal tracking-[-0.04em] text-[#28171a] sm:text-5xl lg:text-6xl">{title}</h2>
            </div>
          </div>
          {viewMoreLink && <Link href={viewMoreLink} className="inline-flex items-center gap-2 self-start text-[10px] font-bold uppercase tracking-[0.22em] text-[#28171a] transition hover:text-[#7a2130] sm:self-auto">Xem tất cả <ArrowUpRight className="h-4 w-4" /></Link>}
        </div>
      )}
      <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {products.length > 0 ? products.map((product) => <ProductCard key={product.id} product={product} />) : (
          <div className="col-span-full border-y border-[#28171a]/12 py-20 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#7a2130]">Coming soon</p>
            <h3 className="mt-4 font-serif text-3xl font-normal text-[#28171a]">Bộ sưu tập đang được hoàn thiện</h3>
            <p className="mt-3 text-sm text-[#77666a]">Những thiết kế mới sẽ sớm xuất hiện tại đây.</p>
          </div>
        )}
      </div>
    </section>
  );
}
