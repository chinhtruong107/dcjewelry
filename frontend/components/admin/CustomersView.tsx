"use client";

import { useMemo, useState } from "react";
import { Eye, Trophy } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { AdminOrder, AdminUser, formatDateTime, SectionCard, StatusBadge, AdminModal } from "./shared";

export default function CustomersView({ users, orders }: { users: AdminUser[]; orders: AdminOrder[] }) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [customerSort, setCustomerSort] = useState<"orders" | "spent" | "recent">("orders");
  const customerStats = useMemo(
    () =>
      users.map((user) => {
        const userOrders = orders.filter((order) => order.customer_email?.toLowerCase() === user.email?.toLowerCase());
        const validOrders = userOrders.filter((order) => order.status !== "cancelled");
        const orderCount = validOrders.length;
        const orderTotal = validOrders.reduce((sum, order) => sum + order.total, 0);
        const itemCount = validOrders.reduce(
          (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + item.quantity, 0),
          0
        );
        const lastOrderAt = userOrders
          .map((order) => new Date(order.created_at).getTime())
          .filter((value) => !Number.isNaN(value))
          .sort((left, right) => right - left)[0] || 0;

        return { user, userOrders, orderCount, orderTotal, itemCount, lastOrderAt };
      }),
    [orders, users]
  );
  const sortedCustomerStats = useMemo(() => {
    return [...customerStats].sort((left, right) => {
      if (customerSort === "spent") return right.orderTotal - left.orderTotal;
      if (customerSort === "recent") return right.lastOrderAt - left.lastOrderAt;
      return right.orderCount - left.orderCount || right.orderTotal - left.orderTotal;
    });
  }, [customerSort, customerStats]);
  const topCustomers = useMemo(
    () =>
      [...customerStats]
        .filter((item) => item.orderCount > 0)
        .sort((left, right) => right.orderCount - left.orderCount || right.orderTotal - left.orderTotal)
        .slice(0, 3),
    [customerStats]
  );
  const selectedUserOrders = selectedUser
    ? orders.filter((order) => order.customer_email?.toLowerCase() === selectedUser.email?.toLowerCase())
    : [];
  const selectedUserTotal = selectedUserOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quản lý khách hàng</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Xem khách mua nhiều nhất, tổng chi tiêu và lịch sử đơn hàng.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {topCustomers.length > 0 ? (
          topCustomers.map((item, index) => (
            <SectionCard key={item.user.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-orange-500">Top {index + 1}</p>
                    <h3 className="truncate font-semibold text-slate-950 dark:text-white">{item.user.name}</h3>
                  </div>
                </div>
                <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                  {item.orderCount} đơn
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tổng chi tiêu</p>
                  <p className="mt-1 font-semibold text-slate-950 dark:text-white">{formatVND(item.orderTotal)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sản phẩm</p>
                  <p className="mt-1 font-semibold text-slate-950 dark:text-white">{item.itemCount}</p>
                </div>
              </div>
            </SectionCard>
          ))
        ) : (
          <SectionCard className="p-5 text-sm text-slate-500 dark:text-slate-400 lg:col-span-3">
            Chưa có khách hàng nào phát sinh đơn hàng.
          </SectionCard>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-orange-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sắp xếp danh sách khách hàng</span>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          {[
            { id: "orders", label: "Mua nhiều nhất" },
            { id: "spent", label: "Chi tiêu cao nhất" },
            { id: "recent", label: "Mua gần đây" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setCustomerSort(option.id as typeof customerSort)}
              className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition sm:w-auto ${
                customerSort === option.id
                  ? "bg-orange-500 text-white"
                  : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedCustomerStats.map(({ user, orderCount, orderTotal, itemCount, lastOrderAt }) => {
          return (
            <SectionCard key={user.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
                  {user.name?.slice(0, 2).toUpperCase() || "KH"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-950 dark:text-white">{user.name}</h3>
                  <p className="break-words text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.phone || "Chưa có SĐT"}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.province_name || user.address || "Chưa có địa chỉ"}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-orange-50 px-2 py-1 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                      {orderCount} đơn hàng
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      {formatVND(orderTotal)}
                    </span>
                    <span className="rounded-md bg-sky-50 px-2 py-1 font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                      {itemCount} sản phẩm
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {lastOrderAt ? `Mua gần nhất ${formatDateTime(new Date(lastOrderAt).toISOString())}` : formatDateTime(user.created_at)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-orange-100 px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 dark:border-orange-500/20 dark:text-orange-200 dark:hover:bg-orange-500/10 sm:w-auto"
                  >
                    <Eye className="h-4 w-4" />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
      {users.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Không tìm thấy khách hàng phù hợp.
        </SectionCard>
      )}

      {selectedUser && (
        <AdminModal
          title={`Khách hàng: ${selectedUser.name}`}
          description="Thông tin liên hệ và lịch sử đơn hàng đã mua."
          onClose={() => setSelectedUser(null)}
          size="xl"
        >
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-white">{selectedUser.email}</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Số điện thoại</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{selectedUser.phone || "Chưa có"}</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Tỉnh/Thành</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{selectedUser.province_name || "Chưa có"}</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Phường/Xã</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{selectedUser.ward_name || "Chưa có"}</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Số đơn đã mua</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{selectedUserOrders.length} đơn</p>
              </div>
              <div className="rounded-lg border border-orange-100 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Tổng giá trị</p>
                <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-300">{formatVND(selectedUserTotal)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-950 dark:text-white">Chi tiết đơn hàng</h4>
              {selectedUserOrders.length > 0 ? (
                selectedUserOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-orange-100 p-4 dark:border-slate-700">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950 dark:text-white">{order.order_number}</p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {formatDateTime(order.created_at)} - {order.payment_method?.toUpperCase()} - {order.payment_status}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Giao tới: {order.recipient_address || order.customer_address || "Chưa có địa chỉ"}
                        </p>
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-300">{formatVND(order.total)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Giá trị đơn hàng</p>
                      </div>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700">
                      {(order.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[minmax(0,1fr)_48px] gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 dark:border-slate-700 sm:grid-cols-[minmax(0,1fr)_72px_120px] sm:gap-3"
                        >
                          <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">{item.product_name}</span>
                          <span className="text-center text-slate-500 dark:text-slate-400">x{item.quantity}</span>
                          <span className="col-span-2 text-right font-semibold text-slate-900 dark:text-white sm:col-span-1">{formatVND(item.line_total)}</span>
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">Đơn hàng chưa có sản phẩm.</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-orange-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Khách hàng này chưa có đơn hàng nào.
                </div>
              )}
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
