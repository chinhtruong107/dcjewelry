import type { Metadata } from "next";
import ProductPageClient from "@/components/product/ProductPageClient";
import { fixVietnameseText, productImageUrl } from "@/lib/utils";
import type { Product } from "@/types/product";

const API_BASE_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8002/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcjewelry.duckdns.org";

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    return { title: "Sản phẩm" };
  }

  const name = fixVietnameseText(product.name);
  const description = fixVietnameseText(product.description).slice(0, 160)
    || `Khám phá ${name} tại Đức Chính Jewelry.`;
  const image = productImageUrl(product.image);
  const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: name,
    description,
    alternates: { canonical: `/product/${productId}` },
    openGraph: {
      type: "website",
      title: name,
      description,
      url: `${SITE_URL}/product/${productId}`,
      images: [{ url: absoluteImage, alt: name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = await getProduct(productId);
  const productName = product ? fixVietnameseText(product.name) : "Sản phẩm";
  const image = product ? productImageUrl(product.image) : "/images/NoImage.jpg";
  const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const structuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productName,
        image: [absoluteImage],
        description: fixVietnameseText(product.description),
        sku: String(product.id),
        brand: { "@type": "Brand", name: "Đức Chính Jewelry" },
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          price: product.price,
          availability: (product.stock ?? 0) > 0 && product.status !== "inactive"
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/product/${productId}`,
        },
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      )}
      <ProductPageClient />
    </>
  );
}
