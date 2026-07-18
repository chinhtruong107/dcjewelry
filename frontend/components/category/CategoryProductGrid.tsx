"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/home/ProductCard";
import { Product } from "@/types/product";

interface CategoryProductGridProps {
  products: Product[];
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    setVisibleCount(9);
  }, [products]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <div className="flex flex-col items-center">
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={handleShowMore}
          className="luxury-button mt-12 px-8 py-3"
        >
          Xem thêm
        </button>
      )}
    </div>
  );
}
