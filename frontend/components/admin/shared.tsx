import type React from "react";
import { Boxes, LayoutDashboard, RefreshCcw, Settings, ShoppingBag, Star, Users, X } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/storageKeys";

export type AdminTab = "overview" | "products" | "orders" | "returns" | "customers" | "reviews" | "settings";
export type RevenueMode = "day" | "month";

export type AdminProduct = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  raw_image?: string | null;
  description?: string | null;
  category?: string | null;
  stock?: number | null;
  status?: string | null;
  is_best_seller?: boolean;
  isBestSeller?: boolean;
  warranty_months?: number;
};

export type ProductFormState = {
  name: string;
  price: string;
  category: string;
  stock: string;
  status: "active" | "inactive";
  image: string;
  description: string;
  is_best_seller: boolean;
  warranty_months: string;
};

export type ProductPayload = {
  name: string;
  price: number;
  category: string;
  stock: number;
  status: ProductFormState["status"];
  image: string | null;
  description: string | null;
  is_best_seller: boolean;
  warranty_months: number;
  image_data?: string;
};

export type AdminOrderItem = {
  id: number;
  product_id?: number | null;
  product_name: string;
  quantity: number;
  line_total: number;
  certificate_code?: string | null;
  warranty_months?: number | null;
  warranty_starts_at?: string | null;
  warranty_expires_at?: string | null;
};

export type ShipmentEvent = {
  id: number;
  status: string;
  title: string;
  description?: string | null;
  location?: string | null;
  event_at: string;
};

export type AdminOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string | null;
  customer_address_detail?: string | null;
  customer_province_code?: string | null;
  customer_province_name?: string | null;
  customer_ward_code?: string | null;
  customer_ward_name?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  recipient_address_detail?: string | null;
  recipient_province_code?: string | null;
  recipient_province_name?: string | null;
  recipient_ward_code?: string | null;
  recipient_ward_name?: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal?: number;
  shipping_fee?: number;
  discount?: number;
  total: number;
  note?: string | null;
  created_at: string;
  items?: AdminOrderItem[];
  shipping_carrier?: "ghn" | "ghtk" | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  shipment_events?: ShipmentEvent[];
};

export type AdminReturnRequest = {
  id: number;
  request_number: string;
  type: "return" | "exchange" | "warranty";
  status: "pending" | "approved" | "rejected" | "received" | "refunded" | "completed";
  reason: string;
  details?: string | null;
  images?: string[];
  image_urls?: string[];
  admin_note?: string | null;
  requested_at: string;
  user?: { id: number; name: string; email: string; phone?: string | null } | null;
  order?: { id: number; order_number: string; status: string; payment_status?: string } | null;
  order_item?: AdminOrderItem | null;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  address_detail?: string | null;
  province_code?: string | null;
  province_name?: string | null;
  ward_code?: string | null;
  ward_name?: string | null;
  role?: string;
  created_at: string;
};

export type AdminReview = {
  id: number;
  rating: number;
  content?: string | null;
  created_at: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
  product?: {
    name?: string;
  } | null;
  order?: {
    order_number?: string;
  } | null;
};

export type DashboardData = {
  products: AdminProduct[];
  orders: AdminOrder[];
  users: AdminUser[];
  reviews: AdminReview[];
  returns: AdminReturnRequest[];
  summary: {
    revenue_today: number;
    revenue_total: number;
    orders_pending: number;
    orders_shipping: number;
    orders_completed: number;
    new_customers: number;
    low_stock: number;
    best_sellers: number;
    return_requests_pending: number;
  };
};

export const API_URL = "/api";
export const TOKEN_KEY = STORAGE_KEYS.adminToken;
export const ADMIN_KEY = STORAGE_KEYS.adminUser;

export const emptyProductForm: ProductFormState = {
  name: "",
  price: "",
  category: "Dây chuyền",
  stock: "100",
  status: "active",
  image: "",
  description: "",
  is_best_seller: false,
  warranty_months: "12",
};

export const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "products", label: "Sản phẩm", icon: Boxes },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "returns", label: "Hậu mãi", icon: RefreshCcw },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "reviews", label: "Đánh giá", icon: Star },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

export const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
  processing: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-200 dark:border-fuchsia-500/30",
  shipping: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30",
};

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateTime(value?: string) {
  if (!value) return "Không rõ";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCompactVND(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

export function monthLabel(date: Date) {
  return `T${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh."));
    reader.readAsDataURL(file);
  });
}

export function orderDateInRange(order: AdminOrder, startDate?: string, endDate?: string) {
  const orderDate = new Date(order.created_at);
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

  if (start && orderDate < start) return false;
  if (end && orderDate > end) return false;
  return true;
}

export function orderProvinceCodeForOrder(order: AdminOrder) {
  return order.recipient_province_code || order.customer_province_code || "";
}

export function orderProvinceName(order: AdminOrder) {
  return order.recipient_province_name || order.customer_province_name || "Chưa xác định";
}

export function excelCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadExcel(filename: string, sheets: Array<{ title: string; rows: unknown[][] }>) {
  const workbook = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; }
    h2 { margin: 20px 0 8px; }
    table { border-collapse: collapse; margin-bottom: 24px; width: 100%; }
    th, td { border: 1px solid #d9d9d9; padding: 6px 8px; mso-number-format:"\\@"; }
    th { background: #f3f4f6; font-weight: 700; }
  </style>
</head>
<body>
${sheets
  .map(
    (sheet) => `<h2>${excelCell(sheet.title)}</h2>
<table>
${sheet.rows
  .map((row, rowIndex) => {
    const tag = rowIndex === 0 ? "th" : "td";
    return `<tr>${row.map((cell) => `<${tag}>${excelCell(cell)}</${tag}>`).join("")}</tr>`;
  })
  .join("\n")}
</table>`
  )
  .join("\n")}
</body>
</html>`;
  const blob = new Blob([`\uFEFF${workbook}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function productInventoryStatus(product: AdminProduct) {
  const stock = product.stock ?? 0;

  if (product.status === "inactive") {
    return {
      key: "hidden",
      label: "Tạm ẩn",
      tone: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  if (stock <= 0) {
    return {
      key: "out",
      label: "Hết hàng",
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
    };
  }

  if (stock <= 10) {
    return {
      key: "low",
      label: `Sắp hết: ${stock}`,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    };
  }

  return {
    key: "available",
    label: `Còn ${stock}`,
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  };
}

export function orderItemsText(order: AdminOrder) {
  return (
    order.items
      ?.map((item) => `${item.product_name} x${item.quantity} (${item.line_total.toLocaleString("vi-VN")} VND)`)
      .join("; ") || "Chưa có sản phẩm"
  );
}

export function orderExportRows(orders: AdminOrder[]) {
  return [
    [
      "Mã đơn",
      "Ngày tạo",
      "Khách hàng",
      "Email",
      "Số điện thoại",
      "Tỉnh/Thành",
      "Phường/Xã",
      "Địa chỉ giao",
      "Sản phẩm",
      "Trạng thái",
      "Phương thức thanh toán",
      "Trạng thái thanh toán",
      "Tạm tính",
      "Phí ship",
      "Giảm giá",
      "Tổng tiền",
      "Ghi chú",
    ],
    ...orders.map((order) => [
      order.order_number,
      formatDateTime(order.created_at),
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      orderProvinceName(order),
      order.recipient_ward_name || order.customer_ward_name || "Chưa xác định",
      order.recipient_address || order.customer_address || "Chưa có địa chỉ",
      orderItemsText(order),
      statusLabels[order.status] || order.status,
      order.payment_method?.toUpperCase(),
      order.payment_status,
      order.subtotal ?? 0,
      order.shipping_fee ?? 0,
      order.discount ?? 0,
      order.total,
      order.note || "",
    ]),
  ];
}

export function revenueOverviewRows(orders: AdminOrder[], startDate?: string, endDate?: string) {
  const validOrders = orders.filter((order) => order.status !== "cancelled");
  const completedOrders = validOrders.filter((order) => order.status === "completed");
  const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = validOrders.length ? Math.round(revenue / validOrders.length) : 0;

  return [
    ["Chỉ tiêu", "Giá trị"],
    ["Từ ngày", startDate || "Không giới hạn"],
    ["Đến ngày", endDate || "Không giới hạn"],
    ["Tổng số đơn trong bộ lọc", orders.length],
    ["Đơn hợp lệ", validOrders.length],
    ["Đơn hoàn thành", completedOrders.length],
    ["Đơn đã hủy", orders.filter((order) => order.status === "cancelled").length],
    ["Tổng doanh thu", revenue],
    ["Giá trị đơn trung bình", averageOrderValue],
  ];
}

export function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-zinc-200 bg-white shadow-sm shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20 ${className}`}>
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClasses[status] || statusClasses.pending}`}>
      {statusLabels[status] || status}
    </span>
  );
}

export function AdminModal({
  title,
  description,
  children,
  onClose,
  size = "lg",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClass = {
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  }[size];

  return (
    <div className="admin-modal-overlay fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/70 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div
        className={`admin-modal-panel max-h-[96dvh] w-full overflow-hidden rounded-t-lg border border-x-0 border-b-0 border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:max-h-[90vh] sm:rounded-lg sm:border ${sizeClass}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-900 sm:gap-4 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Đóng modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(96dvh-76px)] overflow-y-auto overscroll-contain p-4 sm:max-h-[calc(90vh-88px)] sm:p-5">{children}</div>
      </div>
    </div>
  );
}
