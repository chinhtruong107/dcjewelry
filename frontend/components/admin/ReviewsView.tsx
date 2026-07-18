"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { AdminReview, formatDateTime, SectionCard } from "./shared";

export default function ReviewsView({ reviews }: { reviews: AdminReview[] }) {
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));
  const filteredReviews =
    ratingFilter === "all" ? reviews : reviews.filter((review) => review.rating === ratingFilter);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Đánh giá sản phẩm</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dữ liệu đánh giá thật từ khách hàng đã mua và nhận hàng.</p>
        </div>
        <div className="w-full rounded-lg border border-orange-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:w-auto">
          <span className="font-semibold text-slate-950 dark:text-white">{reviews.length}</span>
          <span className="text-slate-500 dark:text-slate-400"> đánh giá</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-semibold text-orange-600 dark:text-orange-300">
            {averageRating ? averageRating.toFixed(1) : "0.0"} sao trung bình
          </span>
        </div>
      </div>

      <div className="admin-scroll-strip flex snap-x gap-2 overflow-x-auto rounded-lg border border-orange-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setRatingFilter("all")}
          className={`shrink-0 snap-start rounded-md px-3 py-2 text-sm font-semibold transition ${
            ratingFilter === "all"
              ? "bg-orange-500 text-white"
              : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Tất cả ({reviews.length})
        </button>
        {ratingCounts.map(({ rating, count }) => (
          <button
            key={rating}
            type="button"
            onClick={() => setRatingFilter(rating)}
            className={`flex shrink-0 snap-start items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
              ratingFilter === rating
                ? "bg-orange-500 text-white"
                : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {rating}
            <Star className={`h-4 w-4 ${ratingFilter === rating ? "fill-white text-white" : "fill-orange-400 text-orange-400"}`} />
            ({count})
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredReviews.map((review) => (
          <SectionCard key={review.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-950 dark:text-white">{review.user?.name || "Khách hàng"}</h3>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{review.product?.name || "Sản phẩm"}</p>
                {review.order?.order_number && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Đơn {review.order.order_number}</p>
                )}
              </div>
              <span className="shrink-0 rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                Đã gửi
              </span>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${index < review.rating ? "fill-orange-400 text-orange-400" : "text-slate-300"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {review.content || "Khách hàng chỉ chấm sao, chưa để lại nội dung."}
            </p>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(review.created_at)}</p>
          </SectionCard>
        ))}
      </div>
      {reviews.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Chưa có đánh giá nào từ khách hàng.
        </SectionCard>
      )}
      {reviews.length > 0 && filteredReviews.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Không có đánh giá nào ở mức {ratingFilter} sao.
        </SectionCard>
      )}
    </div>
  );
}
