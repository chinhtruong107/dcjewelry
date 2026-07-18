import type { MetadataRoute } from "next";
import type { Product } from "@/types/product";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcjewelry.duckdns.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/category/day-chuyen", "/category/bong-tai", "/category/vong-tay", "/contact"];
  let products: Product[] = [];

  try {
    const response = await fetch(`${API_BASE_URL}/products`, { next: { revalidate: 3600 } });
    if (response.ok) products = await response.json();
  } catch {
    products = [];
  }

  return [
    ...staticRoutes.map((route, index) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: index === 0 ? "daily" as const : "weekly" as const,
      priority: index === 0 ? 1 : 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
