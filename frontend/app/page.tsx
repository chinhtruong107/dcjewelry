import Hero from "@/components/home/Hero";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import ProductList from "@/components/home/ProductList";
import FadeIn from "@/components/ui/FadeIn";
import { fixVietnameseText } from "@/lib/utils";
import type { Product } from "@/types/product";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";

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

export default async function Home() {
  const productsData = await getProducts();
  const bestSellers = productsData.filter((product) => product.isBestSeller || product.is_best_seller).slice(0, 4);
  const necklaces = productsData.filter((product) => fixVietnameseText(product.category) === "Dây chuyền").slice(0, 4);
  const earrings = productsData.filter((product) => fixVietnameseText(product.category) === "Bông tai").slice(0, 4);
  const bracelets = productsData.filter((product) => fixVietnameseText(product.category) === "Vòng tay").slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f5f0e7] text-[#28171a]">
      <div>
        <Hero />
        <MarqueeTicker />
      </div>

      <section className="mx-auto grid max-w-[1600px] gap-10 bg-[#fffdf9] px-6 py-20 sm:px-10 lg:grid-cols-3 lg:px-16 lg:py-24 xl:px-24">
        {[
          ["01", "Tuyển chọn tinh hoa", "Mỗi thiết kế được tuyển chọn bằng tiêu chuẩn khắt khe về tỷ lệ, chất liệu và vẻ đẹp trường tồn."],
          ["02", "Chế tác tinh xảo", "Từng chi tiết hoàn thiện trên vàng và đá quý đều được chăm chút để tỏa sáng vừa đủ."],
          ["03", "Dịch vụ riêng tư", "Trải nghiệm mua sắm chỉn chu, minh bạch và tư vấn theo dấu ấn riêng của từng khách hàng."],
        ].map(([num, title, body]) => (
          <div key={num} className="grid grid-cols-[auto_1fr] gap-5 border-t border-[#28171a]/15 pt-6">
            <span className="font-serif text-2xl italic text-[#7a2130]">{num}</span>
            <div>
              <h2 className="font-serif text-3xl font-normal text-[#28171a]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#756568]">{body}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mx-auto max-w-[1600px] space-y-28 bg-[#f5f0e7] px-6 py-20 sm:px-10 lg:px-16 lg:py-28 xl:px-24">
        <FadeIn direction="up" delay={0.1}>
          <ProductList id="ban-chay" eyebrow="The signature edit" title="Thiết kế nổi bật" products={bestSellers} />
        </FadeIn>
        <FadeIn direction="up" delay={0.2}>
          <ProductList id="day-chuyen" eyebrow="Necklace edit" title="Dây chuyền" products={necklaces} viewMoreLink="/category/day-chuyen" />
        </FadeIn>
        <FadeIn direction="up" delay={0.3}>
          <ProductList id="bong-tai" eyebrow="Earring selection" title="Bông tai" products={earrings} viewMoreLink="/category/bong-tai" />
        </FadeIn>
        <FadeIn direction="up" delay={0.4}>
          <ProductList id="vong-tay" eyebrow="Bracelet stories" title="Vòng tay" products={bracelets} viewMoreLink="/category/vong-tay" />
        </FadeIn>
      </div>
    </div>
  );
}
