"use client";

import { useMemo } from "react";
import { AlertTriangle, Boxes, CalendarDays, CalendarRange, CircleDollarSign, Download } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { RevenueMode, DashboardData, formatCompactVND, orderDateInRange, downloadExcel, orderExportRows, revenueOverviewRows, SectionCard } from "./shared";

export default function OverviewView({
  data,
  stats,
  revenueBars,
  revenueTicks,
  selectedRevenue,
  revenueMode,
  setRevenueMode,
  revenueStartDate,
  revenueEndDate,
  setRevenueStartDate,
  setRevenueEndDate,
}: {
  data: DashboardData;
  stats: Array<{ label: string; value: string; change: string; icon: typeof CircleDollarSign }>;
  revenueBars: Array<{ label: string; total: number; value: number }>;
  revenueTicks: number[];
  selectedRevenue: number;
  revenueMode: RevenueMode;
  setRevenueMode: (mode: RevenueMode) => void;
  revenueStartDate: string;
  revenueEndDate: string;
  setRevenueStartDate: (value: string) => void;
  setRevenueEndDate: (value: string) => void;
}) {
  const lowStockProducts = useMemo(
    () =>
      [...data.products]
        .filter((product) => (product.stock ?? 0) <= 10 || product.status === "inactive")
        .sort((left, right) => (left.stock ?? 0) - (right.stock ?? 0))
        .slice(0, 5),
    [data.products]
  );

  const handleExportRevenueExcel = () => {
    const revenueOrders = data.orders
      .filter((order) => order.status !== "cancelled")
      .filter((order) => orderDateInRange(order, revenueStartDate, revenueEndDate));

    downloadExcel(`ducchinh-bao-cao-doanh-thu-${revenueStartDate || "start"}-${revenueEndDate || "end"}.xls`, [
      {
        title: "Tổng quan doanh thu",
        rows: revenueOverviewRows(
          data.orders.filter((order) => orderDateInRange(order, revenueStartDate, revenueEndDate)),
          revenueStartDate,
          revenueEndDate
        ),
      },
      {
        title: revenueMode === "day" ? "Doanh thu theo ngày" : "Doanh thu theo tháng",
        rows: [
          ["Kỳ", "Doanh thu"],
          ...revenueBars.map((bar) => [bar.label, bar.total]),
        ],
      },
      {
        title: "Chi tiết đơn hàng",
        rows: orderExportRows(revenueOrders),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 truncate text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-200">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-orange-600 dark:text-orange-300">{stat.change}</p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <SectionCard className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">Biểu đồ doanh thu</h2>
              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Doanh thu (VND)</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] lg:max-w-xl">
              <div className="inline-flex h-9 w-full items-center rounded-full border border-slate-300 bg-white p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-950 sm:w-fit">
                <button
                  type="button"
                  onClick={() => setRevenueMode("day")}
                  className={`flex h-8 flex-1 items-center justify-center rounded-full transition sm:w-11 sm:flex-none ${
                    revenueMode === "day" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-orange-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  aria-label="Xem doanh thu theo ngày"
                  title="Theo ngày"
                >
                  <CalendarDays className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setRevenueMode("month")}
                  className={`flex h-8 flex-1 items-center justify-center rounded-full transition sm:w-11 sm:flex-none ${
                    revenueMode === "month" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-orange-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  aria-label="Xem doanh thu theo tháng"
                  title="Theo tháng"
                >
                  <CalendarRange className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Từ ngày
                  <input
                    type="date"
                    value={revenueStartDate}
                    onChange={(event) => setRevenueStartDate(event.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                </label>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Đến ngày
                  <input
                    type="date"
                    value={revenueEndDate}
                    onChange={(event) => setRevenueEndDate(event.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleExportRevenueExcel}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 dark:border-orange-500/30 dark:bg-slate-950 dark:text-orange-200 dark:hover:bg-orange-500/10 sm:w-fit"
                title="Xuất báo cáo doanh thu Excel"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tổng doanh thu trong khoảng chọn</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{formatVND(selectedRevenue)}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {revenueMode === "day" ? "Đang xem theo ngày" : "Đang xem theo tháng"}
            </p>
          </div>

          <div className="admin-scroll-strip mt-6 overflow-x-auto pb-1">
            <div className="grid h-[340px] min-w-[560px] grid-cols-[52px_minmax(0,1fr)] gap-2">
              <div className="flex h-[292px] flex-col justify-between text-right text-xs text-slate-700 dark:text-slate-300">
                {revenueTicks.map((tick, index) => (
                  <span key={`${tick}-${index}`}>{formatCompactVND(tick)}</span>
                ))}
              </div>
              <div className="min-w-0">
                <div className="relative h-[292px] border-b border-slate-300 dark:border-slate-700">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div
                      key={line}
                      className="absolute left-0 right-0 border-t border-slate-200 dark:border-slate-800"
                      style={{ top: `${line * 25}%` }}
                    />
                  ))}
                  {revenueBars.length > 0 ? (
                    <div className="absolute inset-0 flex items-end gap-2 px-2 sm:gap-3 sm:px-4">
                      {revenueBars.map((bar) => (
                        <div key={bar.label} className="group flex h-full min-w-0 flex-1 items-end justify-center">
                          <div
                            className="relative w-full max-w-8 rounded-t-sm bg-orange-300 transition group-hover:bg-orange-500 dark:bg-orange-400"
                            style={{ height: `${bar.value}%` }}
                          >
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-medium text-white shadow group-hover:block">
                              {formatVND(bar.total)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                      Chưa có doanh thu trong khoảng ngày đã chọn.
                    </div>
                  )}
                </div>
                <div className="flex gap-2 px-2 pt-3 sm:px-4">
                  {revenueBars.map((bar) => (
                    <div key={bar.label} className="min-w-0 flex-1 truncate text-center text-xs text-slate-700 dark:text-slate-300">
                      {bar.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">Kho hàng</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tổng quan dữ liệu hiện tại</p>
            </div>
            <Boxes className="h-5 w-5 text-orange-500" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Sản phẩm</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{data.products.length}</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Bán chạy</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{data.summary.best_sellers}</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-orange-100 p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Đơn đã hoàn thành</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{data.summary.orders_completed}</p>
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-200" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-100">Cảnh báo tồn kho thấp</p>
                {lowStockProducts.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-amber-900 dark:text-amber-50">{product.name}</span>
                        <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-slate-900 dark:text-amber-200">
                          {product.status === "inactive" ? "Tạm ẩn" : `${product.stock ?? 0} còn`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-amber-700 dark:text-amber-100/80">Chưa có sản phẩm nào cần bổ sung gấp.</p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
