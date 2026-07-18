import ProductCard from "@/components/home/ProductCard";
import type { Product } from "@/types/product";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

async function searchProducts(query: string): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    return await response.json();
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q;
  const query = typeof q === "string" ? q : "";
  const searchResults = query ? await searchProducts(query) : [];

  return (
    <div className="bg-background min-h-[calc(100vh-160px)] py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-3xl font-bold text-foreground">
            Kết quả tìm kiếm cho: <span className="text-primary">&quot;{query}&quot;</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Tìm thấy {searchResults.length} sản phẩm phù hợp.
          </p>
        </div>

        {searchResults.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border shadow-sm">
            <SearchIcon />
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              Không tìm thấy sản phẩm nào
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Không có kết quả phù hợp với từ khóa &quot;<span className="font-medium text-foreground">{query}</span>&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return <div className="text-6xl mb-6">🔍</div>;
}
