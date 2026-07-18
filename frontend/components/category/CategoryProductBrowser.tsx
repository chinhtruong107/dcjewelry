"use client";

import { useMemo, useState } from "react";
import CategoryProductGrid from "@/components/category/CategoryProductGrid";
import ProductFilterSidebar, {
  defaultProductFilters,
  ProductFilters,
} from "@/components/category/ProductFilterSidebar";
import { Product } from "@/types/product";
import Link from "next/link";
import { SearchX } from "lucide-react";

interface CategoryProductBrowserProps {
  products: Product[];
  categoryName: string;
}

function productMatchesGoldKarats(product: Product, goldKarats: ProductFilters["goldKarats"]) {
  if (goldKarats.length === 0) return true;

  const searchableText = [product.name, product.description, product.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return goldKarats.some((goldKarat) => {
    const value = goldKarat.replace("k", "");
    const pattern = new RegExp(`\\b${value}\\s*k\\b`, "i");

    return pattern.test(searchableText);
  });
}

export default function CategoryProductBrowser({
  products,
  categoryName,
}: CategoryProductBrowserProps) {
  const [filters, setFilters] = useState<ProductFilters>(defaultProductFilters);

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      const matchesPrice =
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max;
      const matchesGoldKarat = productMatchesGoldKarats(product, filters.goldKarats);
      const matchesStatus = !filters.bestSellerOnly || product.isBestSeller || product.is_best_seller;

      return matchesPrice && matchesGoldKarat && matchesStatus;
    });

    return [...nextProducts].sort((a, b) => {
      if (filters.sort === "price-asc") return a.price - b.price;
      if (filters.sort === "price-desc") return b.price - a.price;
      if (filters.sort === "name-asc") return a.name.localeCompare(b.name, "vi");
      return Number(Boolean(b.isBestSeller || b.is_best_seller)) - Number(Boolean(a.isBestSeller || a.is_best_seller));
    });
  }, [filters, products]);

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row">
      <div className="w-full shrink-0 lg:w-1/4">
        <ProductFilterSidebar filters={filters} onChange={setFilters} />
      </div>

      <div className="w-full lg:w-3/4">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#d6bd7a]/15 pb-4">
          <p className="text-sm text-[#cfc4ad]/75">
            Hiển thị <span className="font-semibold text-[#f7efe1]">{filteredProducts.length}</span> / {products.length} sản phẩm
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <CategoryProductGrid products={filteredProducts} />
        ) : (
          <div className="flex flex-col items-center justify-center border border-[#d6bd7a]/22 bg-[#0d0b0a] px-5 py-20 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <SearchX className="mb-5 h-14 w-14 text-[#d6bd7a]" />
            <h3 className="mb-3 font-serif text-3xl text-[#f7efe1]">
              Không có sản phẩm phù hợp
            </h3>
            <p className="mx-auto max-w-md text-sm leading-7 text-[#cfc4ad]/75">
              Không có sản phẩm nào trong danh mục {categoryName} khớp với bộ lọc hiện tại.
            </p>
            <Link href="/" className="luxury-button mt-7 px-6 py-3">
              Trở về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
