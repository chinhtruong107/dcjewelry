import CategoryProductBrowser from "@/components/category/CategoryProductBrowser";
import { fixVietnameseText } from "@/lib/utils";
import type { Product } from "@/types/product";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

const categoryMap: Record<string, { name: string; sourceNames: string[]; eyebrow: string; intro: string }> = {
  "day-chuyen": {
    name: "Dây chuyền",
    sourceNames: ["Dây chuyền"],
    eyebrow: "Necklace edit",
    intro:
      "Những mẫu dây chuyền thanh mảnh, nữ tính và dễ đeo mỗi ngày, được hoàn thiện với vàng 14K, 18K, Moissanite, CZ và ngọc trai.",
  },
  "bong-tai": {
    name: "Bông tai",
    sourceNames: ["Bông tai"],
    eyebrow: "Earring selection",
    intro:
      "Bộ sưu tập bông tai nụ, khoen và thả với phom dáng gọn gàng, bắt sáng vừa đủ để tôn khuôn mặt mà không quá phô trương.",
  },
  "vong-tay": {
    name: "Vòng tay",
    sourceNames: ["Vòng tay"],
    eyebrow: "Bracelet stories",
    intro:
      "Những thiết kế lắc tay và vòng kiềng mềm mại, cân bằng giữa vẻ tinh xảo của trang sức vàng và cảm giác hiện đại khi phối hằng ngày.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryMap[slug];
  if (!category) return { title: "Bộ sưu tập" };

  return {
    title: category.name,
    description: category.intro,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${category.name} | Đức Chính Jewelry`,
      description: category.intro,
      url: `/category/${slug}`,
    },
  };
}

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Không tải được sản phẩm.");
    return await response.json();
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryMap[slug];

  if (!category) notFound();

  const products = await getProducts();
  const categoryProducts = products.filter((product) => {
    const productCategory = fixVietnameseText(product.category).toLowerCase();
    return category.sourceNames.some((sourceName) => productCategory === sourceName.toLowerCase());
  });

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#070607] text-[#f7efe1]">
      <div className="mx-auto max-w-[1500px] border-x border-[#d6bd7a]/18 bg-[linear-gradient(180deg,#0b0908_0%,#120e0c_48%,#070607_100%)] px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
        <section className="border-b border-[#d6bd7a]/20 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d6bd7a]">{category.eyebrow}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl font-light leading-tight text-[#f7efe1] sm:text-5xl lg:text-6xl">
                {category.name}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#cfc4ad]/78 sm:text-base">{category.intro}</p>
            </div>
            <div className="border border-[#d6bd7a]/24 bg-black/24 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d6bd7a]">Curated selection</p>
              <p className="mt-3 font-serif text-3xl text-[#f7efe1]">{categoryProducts.length}</p>
              <p className="mt-1 text-sm text-[#cfc4ad]/72">thiết kế đang có trong bộ sưu tập</p>
            </div>
          </div>
        </section>

        <CategoryProductBrowser products={categoryProducts} categoryName={category.name} />
      </div>
    </div>
  );
}
