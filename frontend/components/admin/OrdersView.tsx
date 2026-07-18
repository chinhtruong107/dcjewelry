"use client";

import { useState } from "react";
import { CircleDollarSign, Download, Search } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { ProvinceOption } from "@/lib/locations";
import { AdminOrder, toDateInputValue, formatDateTime, orderDateInRange, orderProvinceCodeForOrder, orderProvinceName, downloadExcel, orderExportRows, revenueOverviewRows, SectionCard, StatusBadge } from "./shared";

export default function OrdersView({
  orders,
  provinces,
  updatingOrderId,
  creatingShipmentOrderId,
  onUpdateOrderStatus,
  onCreateShipment,
}: {
  orders: AdminOrder[];
  provinces: ProvinceOption[];
  updatingOrderId: number | null;
  creatingShipmentOrderId: number | null;
  onUpdateOrderStatus: (orderId: number, status: AdminOrder["status"]) => void;
  onCreateShipment: (orderId: number, carrier: "ghn" | "ghtk") => void;
}) {
  const [orderStatusFilter, setOrderStatusFilter] = useState<AdminOrder["status"] | "all">("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStartDate, setOrderStartDate] = useState("");
  const [orderEndDate, setOrderEndDate] = useState("");
  const [orderProvinceCode, setOrderProvinceCode] = useState("all");
  const [carriers, setCarriers] = useState<Record<number, "ghn" | "ghtk">>({});
  const statusFilters: { id: AdminOrder["status"] | "all"; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Cần xác nhận" },
    { id: "processing", label: "Đang xử lý" },
    { id: "shipping", label: "Đang giao" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
  ];
  const statusCounts = statusFilters.reduce<Record<string, number>>((result, item) => {
    result[item.id] =
      item.id === "all" ? orders.length : orders.filter((order) => order.status === item.id).length;
    return result;
  }, {});
  const localOrderQuery = orderQuery.trim().toLowerCase();
  const visibleOrders = orders.filter((order) => {
    if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) return false;
    if (!orderDateInRange(order, orderStartDate, orderEndDate)) return false;
    if (orderProvinceCode !== "all" && orderProvinceCode !== orderProvinceCodeForOrder(order)) return false;

    if (!localOrderQuery) return true;

    return [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.recipient_phone,
      order.customer_address,
      order.recipient_address,
      orderProvinceName(order),
    ]
      .filter(Boolean)
      .some((item) => item?.toLowerCase().includes(localOrderQuery));
  });
  const visibleRevenue = visibleOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const handleExportOrdersExcel = () => {
    downloadExcel(`ducchinh-don-hang-${toDateInputValue(new Date())}.xls`, [
      {
        title: "Danh sách đơn hàng",
        rows: orderExportRows(visibleOrders),
      },
      {
        title: "Tổng quan bộ lọc",
        rows: revenueOverviewRows(visibleOrders, orderStartDate, orderEndDate),
      },
    ]);
  };
  const handleExportOrderRevenueExcel = () => {
    const revenueOrders = visibleOrders.filter((order) => order.status !== "cancelled");
    const statusBreakdown = statusFilters
      .filter((item) => item.id !== "all")
      .map((item) => [
        item.label,
        visibleOrders.filter((order) => order.status === item.id).length,
        visibleOrders
          .filter((order) => order.status === item.id && order.status !== "cancelled")
          .reduce((sum, order) => sum + order.total, 0),
      ]);
    const paymentBreakdown = Object.values(
      revenueOrders.reduce<Record<string, { method: string; count: number; total: number }>>((result, order) => {
        const key = order.payment_method || "unknown";
        result[key] = {
          method: key.toUpperCase(),
          count: (result[key]?.count || 0) + 1,
          total: (result[key]?.total || 0) + order.total,
        };
        return result;
      }, {})
    );

    downloadExcel(`ducchinh-bao-cao-doanh-thu-don-hang-${toDateInputValue(new Date())}.xls`, [
      {
        title: "Tổng quan doanh thu",
        rows: revenueOverviewRows(visibleOrders, orderStartDate, orderEndDate),
      },
      {
        title: "Doanh thu theo trạng thái",
        rows: [["Trạng thái", "Số đơn", "Doanh thu"], ...statusBreakdown],
      },
      {
        title: "Doanh thu theo thanh toán",
        rows: [
          ["Phương thức", "Số đơn", "Doanh thu"],
          ...paymentBreakdown.map((item) => [item.method, item.count, item.total]),
        ],
      },
      {
        title: "Chi tiết đơn tính doanh thu",
        rows: orderExportRows(revenueOrders),
      },
    ]);
  };
  const clearOrderFilters = () => {
    setOrderQuery("");
    setOrderStartDate("");
    setOrderEndDate("");
    setOrderStatusFilter("all");
    setOrderProvinceCode("all");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quản lý đơn hàng</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật trạng thái để khách hàng theo dõi và đánh giá khi đã nhận hàng.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {statusFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOrderStatusFilter(item.id)}
            className={`rounded-lg border p-3 text-left transition ${
              orderStatusFilter === item.id
                ? "border-orange-300 bg-orange-100 text-orange-800 shadow-sm dark:border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-100"
                : "border-orange-100 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span className="block text-xs font-semibold uppercase">{item.label}</span>
            <span className="mt-1 block text-xl font-semibold">{statusCounts[item.id] || 0}</span>
          </button>
        ))}
      </div>

      <SectionCard className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_190px_180px_180px_auto] xl:items-end">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2 xl:col-span-1">
            Tìm đơn hàng
            <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-orange-100 bg-orange-50/60 px-3 dark:border-slate-700 dark:bg-slate-950">
              <Search className="h-4 w-4 text-orange-500" />
              <input
                value={orderQuery}
                onChange={(event) => setOrderQuery(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Email, số điện thoại, mã đơn..."
              />
            </div>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Tỉnh/Thành
            <select
              value={orderProvinceCode}
              onChange={(event) => setOrderProvinceCode(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="all">Tất cả tỉnh/thành</option>
              <option value="">Chưa xác định</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.full_name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Từ ngày
            <input
              type="date"
              value={orderStartDate}
              onChange={(event) => setOrderStartDate(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Đến ngày
            <input
              type="date"
              value={orderEndDate}
              onChange={(event) => setOrderEndDate(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <button
            type="button"
            onClick={clearOrderFilters}
            className="h-10 w-full rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:col-span-2 xl:col-span-1 xl:w-auto"
          >
            Xóa lọc
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Đơn đang hiển thị</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{visibleOrders.length}</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Doanh thu trong bộ lọc</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{formatVND(visibleRevenue)}</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Đơn đã hoàn thành</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
              {visibleOrders.filter((order) => order.status === "completed").length}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-orange-100 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            File xuất theo đúng bộ lọc trạng thái, ngày và tỉnh/thành hiện tại.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleExportOrdersExcel}
              disabled={visibleOrders.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-500/30 dark:bg-slate-950 dark:text-orange-200 dark:hover:bg-orange-500/10"
              title="Xuất danh sách đơn hàng Excel"
            >
              <Download className="h-4 w-4" />
              Xuất đơn hàng
            </button>
            <button
              type="button"
              onClick={handleExportOrderRevenueExcel}
              disabled={visibleOrders.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              title="Xuất báo cáo doanh thu Excel"
            >
              <CircleDollarSign className="h-4 w-4" />
              Báo cáo doanh thu
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleOrders.map((order) => {
          const isUpdating = updatingOrderId === order.id;
          const nextAction =
            order.status === "pending"
              ? { label: "Xác nhận đơn", loading: "Đang xác nhận...", status: "processing" }
              : order.status === "shipping"
                  ? { label: "Đánh dấu đã giao", loading: "Đang hoàn tất...", status: "completed" }
                  : null;

          return (
          <SectionCard key={order.id} className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-950 dark:text-white">{order.order_number}</h3>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{order.customer_name}</p>
                <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                  {order.customer_email} - {order.customer_phone}
                </p>
                <p className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-200">
                  Giao tới: {orderProvinceName(order)}
                  {(order.recipient_ward_name || order.customer_ward_name) ? ` - ${order.recipient_ward_name || order.customer_ward_name}` : ""}
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {order.items?.map((item) => `${item.product_name} x${item.quantity}`).join(", ") || "Chưa có sản phẩm"}
                </p>
                {order.tracking_number && (
                  <div className="mt-3 rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                    <p className="font-semibold">{order.shipping_carrier?.toUpperCase()} demo · {order.tracking_number}</p>
                    <a href={`/tracking/${encodeURIComponent(order.tracking_number)}`} target="_blank" rel="noreferrer" className="mt-1 inline-block underline underline-offset-2">Mở trang theo dõi</a>
                  </div>
                )}
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{formatVND(order.total)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col items-stretch justify-between gap-3 border-t border-orange-100 pt-4 dark:border-slate-700 sm:flex-row sm:items-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Thanh toán: {order.payment_method?.toUpperCase()} - {order.payment_status}
              </span>
              {order.status === "processing" && !order.tracking_number ? (
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <select
                    value={carriers[order.id] || "ghn"}
                    onChange={(event) => setCarriers((current) => ({ ...current, [order.id]: event.target.value as "ghn" | "ghtk" }))}
                    className="h-9 w-full rounded-md border border-sky-200 bg-white px-2 text-xs font-semibold text-sky-700 outline-none dark:border-sky-500/30 dark:bg-slate-950 dark:text-sky-200 sm:w-auto"
                    aria-label={`Đơn vị vận chuyển cho ${order.order_number}`}
                  >
                    <option value="ghn">GHN demo</option>
                    <option value="ghtk">GHTK demo</option>
                  </select>
                  <button type="button" onClick={() => onCreateShipment(order.id, carriers[order.id] || "ghn")} disabled={creatingShipmentOrderId === order.id} className="h-9 w-full rounded-md bg-sky-600 px-3 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 sm:w-auto">
                    {creatingShipmentOrderId === order.id ? "Đang tạo vận đơn..." : "Tạo vận đơn & giao hàng"}
                  </button>
                </div>
              ) : nextAction ? (
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, "cancelled")}
                    disabled={isUpdating}
                    className="rounded-md border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/10"
                  >
                    {isUpdating ? "Đang hủy..." : "Hủy đơn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, nextAction.status)}
                    disabled={isUpdating}
                    className="rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdating ? nextAction.loading : nextAction.label}
                  </button>
                </div>
              ) : (
                <span className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {order.status === "completed" ? "Đã giao cho khách" : "Đã đóng"}
                </span>
              )}
            </div>
          </SectionCard>
          );
        })}
      </div>
      {visibleOrders.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Không có đơn hàng nào khớp với bộ lọc hiện tại.
        </SectionCard>
      )}
    </div>
  );
}
