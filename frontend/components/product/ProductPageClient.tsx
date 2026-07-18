"use client";

import Features from "@/components/product/Features";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductNotFound from "@/components/product/ProductNotFound";
import RelatedProducts from "@/components/product/RelatedProducts";
import ShareProduct from "@/components/product/ShareProduct";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { cn, fixVietnameseText, formatVND, productImageUrl } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Check, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ProductReview = {
  id: number;
  rating: number;
  content?: string | null;
  created_at: string;
  user?: {
    name?: string;
  };
};

export default function ProductPageClient() {
  const { addToCart, guestToken } = useCart();
  const { token } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | undefined>();
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/products/${productId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Không tải được sản phẩm.");
        return response.json();
      })
      .then((data: Product) => {
        if (isMounted) setProduct(data);
      })
      .catch(() => {
        if (isMounted) setProduct(undefined);
      })
      .finally(() => {
        if (isMounted) setIsLoadingProduct(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!product?.id || !guestToken) return;

    fetch("/api/product-views", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Cart-Token": guestToken,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ product_id: product.id }),
    }).catch(() => undefined);
  }, [guestToken, product?.id, token]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingReviews(true);

    fetch(`/api/products/${productId}/reviews`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Không tải được đánh giá.");
        return response.json();
      })
      .then((data: ProductReview[]) => {
        if (isMounted) setReviews(data);
      })
      .catch(() => {
        if (isMounted) setReviews([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const averageRating = useMemo(
    () => (reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0),
    [reviews]
  );

  if (isLoadingProduct) {
    return (
      <main className="min-h-screen bg-[#f5f0e7] px-6 py-24 text-center text-[#756568]">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7a2130]">Đức Chính Jewelry</p>
        <h1 className="mt-4 font-serif text-4xl font-normal text-[#28171a]">Đang tải sản phẩm...</h1>
      </main>
    );
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const stock = product.stock ?? 100;
  const isOutOfStock = stock <= 0 || product.status === "inactive";
  const isLiked = isFavorite(product.id);
  const imageUrl = productImageUrl(product.image);
  const productName = fixVietnameseText(product.name);
  const productCategory = fixVietnameseText(product.category) || "Fine jewelry";
  const productDescription =
    fixVietnameseText(product.description) ||
    "Thiết kế được tuyển chọn dành cho những khoảnh khắc cần một điểm sáng tinh tế.";

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setIsAdding(true);
    setCartError("");
    try {
      await addToCart({
        id: product.id,
        name: productName,
        price: product.price,
        image: imageUrl,
        quantity,
        stock,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      return true;
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng.");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) {
      setTimeout(() => router.push("/cart"), 300);
    }
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => Math.min(stock || 1, prev + 1));
      return;
    }

    setQuantity((prev) => Math.max(1, prev - 1));
  };

  return (
    <main className="min-h-screen bg-[#f5f0e7] text-[#28171a]">
      <div className="mx-auto max-w-[1600px] px-6 pb-20 pt-8 sm:px-10 lg:px-16 xl:px-24">
        <ProductBreadcrumb />

        <section className="grid gap-12 border-b border-[#28171a]/12 pb-16 lg:grid-cols-[minmax(0,0.94fr)_minmax(420px,0.76fr)] lg:gap-16">
          <div className="relative">
            <div className="absolute -left-3 top-7 hidden font-serif text-8xl italic text-[#7a2130]/10 lg:block">/</div>
            <div className="relative overflow-hidden bg-[#ede5d9] shadow-[0_28px_90px_rgba(55,28,33,0.08)]">
              {isOutOfStock && (
                <div className="absolute left-5 top-5 z-10 bg-[#28171a] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#fffaf2]">
                  Hết hàng
                </div>
              )}
              <Image
                src={imageUrl}
                alt={productName}
                width={980}
                height={1180}
                priority
                fetchPriority="high"
                className={cn(
                  "aspect-[4/5] h-full max-h-[780px] w-full object-cover mix-blend-multiply",
                  isOutOfStock && "opacity-55 grayscale"
                )}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#7a2130]">{productCategory}</p>
            <h1 className="mt-5 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-[#28171a] sm:text-6xl lg:text-7xl">
              {productName}
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-4 w-4",
                      index < Math.round(averageRating || 0)
                        ? "fill-[#7a2130] text-[#7a2130]"
                        : "text-[#28171a]/22"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-[#756568]">
                {reviews.length > 0
                  ? `${averageRating.toFixed(1)} / 5 từ ${reviews.length} đánh giá`
                  : "Chưa có đánh giá"}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-[#28171a]/12 py-6">
              <span className="font-serif text-4xl font-normal text-[#7a2130]">{formatVND(product.price)}</span>
              <span
                className={cn(
                  "border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]",
                  isOutOfStock
                    ? "border-[#28171a]/18 text-[#756568]"
                    : "border-[#7a2130]/30 bg-[#7a2130]/7 text-[#7a2130]"
                )}
              >
                {isOutOfStock ? "Hết hàng" : `Còn ${stock} sản phẩm`}
              </span>
              <span className="inline-flex items-center gap-2 border border-[#d6bd7a]/45 bg-[#d6bd7a]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a2130]">
                <ShieldCheck className="h-4 w-4" /> Bảo hành {product.warranty_months || 12} tháng
              </span>
            </div>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#756568]">{productDescription}</p>

            <div className="mt-8 space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7a2130]">Số lượng</span>
                <div className="grid h-12 grid-cols-[44px_64px_44px] border border-[#28171a]/16 bg-[#fffdf9]">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="grid place-items-center text-[#28171a] transition hover:bg-[#7a2130] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="grid place-items-center border-x border-[#28171a]/12 text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("increment")}
                    disabled={isOutOfStock || quantity >= stock}
                    className="grid place-items-center text-[#28171a] transition hover:bg-[#7a2130] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className={cn(
                    "inline-flex h-13 items-center justify-center gap-2 border px-5 text-[10px] font-bold uppercase tracking-[0.22em] transition disabled:cursor-not-allowed disabled:opacity-55",
                    isOutOfStock
                      ? "border-[#28171a]/18 bg-[#ddd4c8] text-[#756568]"
                      : justAdded
                        ? "border-[#7a2130] bg-[#7a2130] text-[#fffaf2]"
                        : "border-[#7a2130] bg-[#7a2130] text-[#fffaf2] hover:bg-[#55131e]"
                  )}
                >
                  {isOutOfStock ? (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      Hết hàng
                    </>
                  ) : isAdding ? (
                    <>
                      <span className="h-4 w-4 animate-spin border-2 border-current border-t-transparent" />
                      Đang thêm
                    </>
                  ) : justAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      Đã thêm vào giỏ
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      Thêm vào giỏ
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="inline-flex h-13 items-center justify-center border border-[#28171a]/22 bg-transparent px-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#28171a] transition hover:border-[#7a2130] hover:bg-[#7a2130] hover:text-[#fffaf2] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Mua ngay
                </button>
              </div>

              {cartError && (
                <p className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
                  {cartError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition hover:text-[#7a2130]",
                    isLiked ? "text-[#7a2130]" : "text-[#756568]"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  {isLiked ? "Đã yêu thích" : "Thêm yêu thích"}
                </button>

                <span className="hidden h-4 w-px bg-[#28171a]/14 sm:block" />

                <ShareProduct productId={product.id} productName={productName} productImage={imageUrl} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-10 border-b border-[#28171a]/12 py-16 lg:grid-cols-[minmax(260px,0.42fr)_1fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#7a2130]">Reviews</p>
            <h2 className="mt-3 font-serif text-4xl font-normal tracking-[-0.03em] text-[#28171a] sm:text-5xl">
              Đánh giá sản phẩm
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#756568]">
              Chỉ khách hàng đã mua và nhận hàng mới có thể gửi đánh giá.
            </p>
            {reviews.length > 0 && (
              <div className="mt-6 inline-flex items-center gap-2 border border-[#7a2130]/22 bg-[#fffdf9] px-4 py-3 text-sm font-semibold text-[#7a2130]">
                <Star className="h-4 w-4 fill-[#7a2130]" />
                {averageRating.toFixed(1)} / 5
              </div>
            )}
          </div>

          {isLoadingReviews ? (
            <div className="border-y border-[#28171a]/12 py-12 text-center text-sm text-[#756568]">
              Đang tải đánh giá...
            </div>
          ) : reviews.length === 0 ? (
            <div className="border-y border-[#28171a]/12 py-12 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7a2130]">Chưa có đánh giá</p>
              <p className="mt-3 text-sm text-[#756568]">Sản phẩm này chưa có đánh giá nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#28171a]/10 border-y border-[#28171a]/12">
              {reviews.map((review) => (
                <article key={review.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-2xl font-normal text-[#28171a]">
                        {fixVietnameseText(review.user?.name) || "Khách hàng"}
                      </p>
                      <p className="mt-1 text-xs text-[#756568]">
                        {new Intl.DateTimeFormat("vi-VN").format(new Date(review.created_at))}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            "h-4 w-4",
                            index < review.rating ? "fill-[#7a2130] text-[#7a2130]" : "text-[#28171a]/22"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {review.content && (
                    <p className="mt-4 text-sm leading-7 text-[#756568]">{fixVietnameseText(review.content)}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <Features />
        <RelatedProducts product={product} />
      </div>
    </main>
  );
}
