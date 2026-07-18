"use client";

import ProductCard from "@/components/home/ProductCard";
import AfterSalesPanel from "@/components/profile/AfterSalesPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import {
  buildFullAddress,
  fetchProvinces,
  fetchWards,
  findProvince,
  findWard,
  type ProvinceOption,
  type WardOption,
} from "@/lib/locations";
import { formatVND, productImageUrl } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCheck2,
  Heart,
  MapPin,
  Package,
  ReceiptText,
  Save,
  ShoppingBag,
  Star,
  Truck,
  UserCircle,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OrderStatus = "Tất cả" | "Đang xử lý" | "Đang giao" | "Đã giao" | "Đã hủy";

interface OrderItem {
  id: number;
  orderItemId?: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  review?: ApiReview | null;
  certificateCode?: string | null;
  warrantyMonths?: number | null;
  warrantyExpiresAt?: string | null;
}

interface Order {
  databaseId: number;
  id: string;
  rawStatus?: string;
  date: string;
  status: Exclude<OrderStatus, "Tất cả">;
  paymentStatus: string;
  address: string;
  paymentMethod: string;
  shipping: number;
  tax: number;
  discount: number;
  items: OrderItem[];
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  deliveredAt?: string | null;
  updatedAt?: string | null;
}

interface ApiOrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  review?: ApiReview | null;
  certificate_code?: string | null;
  warranty_months?: number | null;
  warranty_expires_at?: string | null;
}

interface ApiOrder {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer_address: string;
  recipient_address: string | null;
  shipping_fee: number;
  tax: number;
  discount: number;
  items: ApiOrderItem[];
  tracking_number?: string | null;
  shipping_carrier?: string | null;
  delivered_at?: string | null;
  updated_at?: string | null;
}

interface ApiReview {
  id: number;
  rating: number;
  content?: string | null;
}

const orderStatuses: OrderStatus[] = ["Tất cả", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];
const panelClass = "border border-[#d6bd7a]/20 bg-[#0b0908] shadow-[0_30px_90px_rgba(0,0,0,0.35)]";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]";
const inputClass =
  "h-12 rounded-none border-[#d6bd7a]/25 bg-black/25 text-[#f7efe1] shadow-none placeholder:text-[#cfc4ad]/45 hover:border-[#d6bd7a]/45 focus-visible:border-[#d6bd7a] focus-visible:ring-[#d6bd7a]/25 disabled:border-[#d6bd7a]/12 disabled:bg-black/15 disabled:text-[#cfc4ad]/65";
const selectContentClass =
  "rounded-none border-[#28171a]/15 bg-[#fffdf9] p-1 text-[#28171a] shadow-[0_18px_50px_rgba(55,28,33,0.18)]";
const selectItemClass =
  "rounded-none px-3 py-2.5 text-[#28171a] focus:bg-[#7a2130] focus:text-[#fffaf2] data-[state=checked]:font-semibold";

function getOrderSubtotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getOrderTotal(order: Order) {
  return getOrderSubtotal(order) + order.shipping + order.tax - order.discount;
}

function getOrderItemCount(order: Order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function mapOrderStatus(status: string): Exclude<OrderStatus, "Tất cả"> {
  if (status === "completed") return "Đã giao";
  if (status === "cancelled") return "Đã hủy";
  if (status === "shipping") return "Đang giao";

  return "Đang xử lý";
}

function mapPaymentMethod(paymentMethod: string) {
  if (paymentMethod === "cod") return "Thanh toán khi nhận hàng";
  if (paymentMethod === "vnpay") return "VNPay";

  return paymentMethod;
}

function getStatusStyle(status: Exclude<OrderStatus, "Tất cả">) {
  if (status === "Đã hủy") return "border-rose-400/30 bg-rose-950/30 text-rose-100";
  if (status === "Đã giao") return "border-emerald-400/30 bg-emerald-950/25 text-emerald-100";
  if (status === "Đang giao") return "border-sky-400/30 bg-sky-950/25 text-sky-100";

  return "border-[#d6bd7a]/30 bg-[#d6bd7a]/12 text-[#f7e4ac]";
}

function mapApiOrder(order: ApiOrder): Order {
  return {
    databaseId: order.id,
    id: order.order_number,
    rawStatus: order.status,
    date: new Intl.DateTimeFormat("vi-VN").format(new Date(order.created_at)),
    status: mapOrderStatus(order.status),
    paymentStatus: order.payment_status,
    address: order.recipient_address || order.customer_address,
    paymentMethod: mapPaymentMethod(order.payment_method),
    shipping: order.shipping_fee,
    tax: order.tax,
    discount: order.discount,
    trackingNumber: order.tracking_number,
    shippingCarrier: order.shipping_carrier,
    deliveredAt: order.delivered_at,
    updatedAt: order.updated_at,
    items: order.items.map((item) => ({
      id: item.product_id ?? item.id,
      orderItemId: item.id,
      name: item.product_name,
      image: item.product_image || "/images/NoImage.jpg",
      price: item.price,
      quantity: item.quantity,
      review: item.review || null,
      certificateCode: item.certificate_code,
      warrantyMonths: item.warranty_months,
      warrantyExpiresAt: item.warranty_expires_at,
    })),
  };
}

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const { favorites } = useFavorites();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "favorites">("info");
  const [orderFilter, setOrderFilter] = useState<OrderStatus>("Tất cả");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [infoForm, setInfoForm] = useState({ phone: "", address: "", province_code: "", ward_code: "" });
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; item: OrderItem } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const filteredOrders = useMemo(
    () => orders.filter((order) => orderFilter === "Tất cả" || order.status === orderFilter),
    [orderFilter, orders]
  );

  const profileStats = useMemo(
    () => [
      { label: "Đơn hàng", value: orders.length },
      { label: "Yêu thích", value: favorites.length },
      { label: "Đã giao", value: orders.filter((order) => order.status === "Đã giao").length },
    ],
    [favorites.length, orders]
  );

  useEffect(() => {
    if (user) {
      setInfoForm({
        phone: user.phone || "",
        address: user.address_detail || user.address || "",
        province_code: user.province_code || "",
        ward_code: user.ward_code || "",
      });
    }
  }, [user]);

  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch(() => setSaveError("Không thể tải danh sách tỉnh/thành."));
  }, []);

  useEffect(() => {
    if (!infoForm.province_code) {
      setWards([]);
      return;
    }

    fetchWards(infoForm.province_code)
      .then((loadedWards) => {
        setWards(loadedWards);
        setInfoForm((current) =>
          current.ward_code && !loadedWards.some((ward) => ward.code === current.ward_code)
            ? { ...current, ward_code: "" }
            : current
        );
      })
      .catch(() => setSaveError("Không thể tải danh sách phường/xã."));
  }, [infoForm.province_code]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.push("/login");
    }
  }, [user, router, isMounted]);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function fetchOrders() {
      setIsOrdersLoading(true);
      setOrdersError("");

      try {
        const response = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          setOrdersError(data.message || "Không tải được đơn hàng.");
          return;
        }

        setOrders(data.map(mapApiOrder));
      } catch {
        if (!controller.signal.aborted) {
          setOrdersError("Không kết nối được tới máy chủ.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsOrdersLoading(false);
        }
      }
    }

    fetchOrders();

    return () => controller.abort();
  }, [token]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveMessage("");

    if (!token) {
      setSaveError("Phiên đăng nhập đã hết hạn.");
      return;
    }

    const province = findProvince(provinces, infoForm.province_code);
    const ward = findWard(wards, infoForm.ward_code);

    if (!province || !ward) {
      setSaveError("Vui lòng chọn đầy đủ tỉnh/thành và phường/xã.");
      return;
    }

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: infoForm.phone,
          address: buildFullAddress(infoForm.address, ward, province),
          address_detail: infoForm.address,
          province_code: province.code,
          ward_code: ward.code,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.message || "Không thể cập nhật thông tin.");
        return;
      }

      updateUser(data.user);
      setSaveMessage("Cập nhật thông tin thành công.");
      window.setTimeout(() => setSaveMessage(""), 2500);
    } catch {
      setSaveError("Không kết nối được tới máy chủ.");
    }
  };

  const toggleOrderDetail = (orderId: string) => {
    setExpandedOrderId((current) => (current === orderId ? null : orderId));
  };

  const canCancelOrder = (order: Order) =>
    ["pending", "processing"].includes(order.rawStatus || "") && order.paymentStatus !== "paid";

  const handleCancelOrder = async (order: Order) => {
    if (!token || !canCancelOrder(order)) return;

    const confirmed = window.confirm(`Bạn có chắc muốn hủy đơn ${order.id}?`);
    if (!confirmed) return;

    setCancellingOrderId(order.databaseId);
    setOrdersError("");

    try {
      const response = await fetch(`/api/orders/${order.databaseId}/cancel`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setOrdersError(data.message || "Không thể hủy đơn hàng.");
        return;
      }

      const cancelledOrder = mapApiOrder(data);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.databaseId === cancelledOrder.databaseId ? cancelledOrder : currentOrder
        )
      );
    } catch {
      setOrdersError("Không kết nối được tới máy chủ.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const openReviewModal = (orderId: string, item: OrderItem) => {
    setReviewTarget({ orderId, item });
    setReviewRating(item.review?.rating || 5);
    setReviewContent(item.review?.content || "");
    setReviewError("");
  };

  const closeReviewModal = () => {
    setReviewTarget(null);
    setReviewRating(5);
    setReviewContent("");
    setReviewError("");
  };

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !reviewTarget?.item.orderItemId) return;

    setIsSubmittingReview(true);
    setReviewError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: reviewTarget.item.id,
          order_item_id: reviewTarget.item.orderItemId,
          rating: reviewRating,
          content: reviewContent.trim() || null,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setReviewError(data.message || "Không thể gửi đánh giá.");
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === reviewTarget.orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.orderItemId === reviewTarget.item.orderItemId
                    ? {
                        ...item,
                        review: {
                          id: data.id,
                          rating: data.rating,
                          content: data.content,
                        },
                      }
                    : item
                ),
              }
            : order
        )
      );
      closeReviewModal();
    } catch {
      setReviewError("Không kết nối được tới máy chủ.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isMounted || !user) return null;

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#070607] text-[#f7efe1]">
      <div className="mx-auto max-w-[1500px] px-3 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden border border-[#e2c273]/30 bg-[#160f11] shadow-[0_35px_120px_rgba(40,23,26,0.22)]">
          <div className="absolute inset-0 bg-[url('/images/duc-chinh-jewelry-hero.png')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,12,14,0.98)_0%,rgba(18,12,14,0.9)_48%,rgba(18,12,14,0.68)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f2cf82] to-transparent" />

          <div className="relative grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-10">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#f2cf82]">Member profile</p>
              <h1 className="mt-4 font-serif text-4xl font-light leading-tight text-[#fffaf2] sm:text-6xl">
                Không gian tài khoản
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#eadfd2]">
                Quản lý thông tin giao hàng, theo dõi đơn mua và lưu lại những thiết kế bạn yêu thích.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-3 border border-[#e2c273]/25 bg-[#130f10]/70 backdrop-blur-sm sm:min-w-[300px]">
              {profileStats.map((stat) => (
                <div key={stat.label} className="border-r border-[#e2c273]/18 px-3 py-5 last:border-r-0 sm:px-4">
                  <p className="font-serif text-3xl text-[#f2cf82]">{stat.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#eadfd2] sm:text-xs sm:tracking-[0.18em]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className={`${panelClass} h-fit lg:sticky lg:top-24`}>
            <div className="border-b border-[#d6bd7a]/18 p-6 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center border border-[#d6bd7a]/35 bg-[#d6bd7a]/12 font-serif text-4xl text-[#d6bd7a]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold text-[#f7efe1]">{user.name}</h2>
              <p className="mt-1 break-words text-sm text-[#cfc4ad]/70">{user.email}</p>
            </div>

            <nav className="grid gap-2 p-4">
              {[
                { key: "info" as const, label: "Thông tin cá nhân", icon: UserCircle },
                { key: "orders" as const, label: "Đơn hàng của tôi", icon: Package },
                { key: "favorites" as const, label: "Sản phẩm yêu thích", icon: Heart },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex h-12 items-center gap-3 border px-4 text-sm font-bold uppercase tracking-[0.12em] transition ${
                      isActive
                        ? "border-[#d6bd7a]/60 bg-[#d6bd7a] text-[#100d0b]"
                        : "border-transparent text-[#cfc4ad]/76 hover:border-[#d6bd7a]/25 hover:bg-white/5 hover:text-[#f7efe1]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className={`${panelClass} min-h-[560px] p-5 sm:p-7`}>
            {activeTab === "info" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-7 border-b border-[#d6bd7a]/18 pb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#d6bd7a]">Personal details</p>
                  <h3 className="mt-3 font-serif text-4xl font-light text-[#f7efe1]">Thông tin cá nhân</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#cfc4ad]/75">
                    Cập nhật số điện thoại và địa chỉ để quá trình đặt hàng lần sau nhanh hơn.
                  </p>
                </div>

                <form onSubmit={handleSaveInfo} className="grid max-w-3xl gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className={labelClass}>Họ và tên</label>
                      <Input disabled value={user.name} className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Email</label>
                      <Input disabled value={user.email} className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Số điện thoại</label>
                    <Input
                      placeholder="Nhập số điện thoại"
                      value={infoForm.phone}
                      onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Địa chỉ giao hàng</label>
                    <Input
                      placeholder="Số nhà, tên đường..."
                      value={infoForm.address}
                      onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className={labelClass}>Tỉnh/Thành phố</label>
                      <Select
                        value={infoForm.province_code}
                        onValueChange={(value) =>
                          setInfoForm({ ...infoForm, province_code: value, ward_code: "" })
                        }
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder="Chọn tỉnh/thành" />
                        </SelectTrigger>
                        <SelectContent className={selectContentClass}>
                          {provinces.map((province) => (
                            <SelectItem className={selectItemClass} key={province.code} value={province.code}>
                              {province.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Phường/Xã</label>
                      <Select
                        value={infoForm.ward_code}
                        onValueChange={(value) => setInfoForm({ ...infoForm, ward_code: value })}
                        disabled={!infoForm.province_code}
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder={infoForm.province_code ? "Chọn phường/xã" : "Chọn tỉnh trước"} />
                        </SelectTrigger>
                        <SelectContent className={selectContentClass}>
                          {wards.map((ward) => (
                            <SelectItem className={selectItemClass} key={ward.code} value={ward.code}>
                              {ward.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                    <Button
                      type="submit"
                      className="h-12 rounded-none bg-[#d6bd7a] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#100d0b] shadow-none hover:bg-[#f4df9b]"
                    >
                      <Save className="h-4 w-4" />
                      Lưu thay đổi
                    </Button>
                    {saveError && (
                      <p className="flex items-center gap-2 text-sm font-medium text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        {saveError}
                      </p>
                    )}
                    {saveMessage && (
                      <p className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                        <CheckCircle className="h-4 w-4" />
                        {saveMessage}
                      </p>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-7 flex flex-col justify-between gap-5 border-b border-[#d6bd7a]/18 pb-5 xl:flex-row xl:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#d6bd7a]">Order history</p>
                    <h3 className="mt-3 font-serif text-4xl font-light text-[#f7efe1]">Đơn hàng của tôi</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#cfc4ad]/75">
                      Theo dõi trạng thái và xem chi tiết từng món trong đơn hàng.
                    </p>
                  </div>

                  <div className="flex w-full gap-2 overflow-x-auto border border-[#d6bd7a]/18 bg-black/20 p-1 xl:w-fit">
                    {orderStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setOrderFilter(status);
                          setExpandedOrderId(null);
                        }}
                        className={`h-9 shrink-0 px-3 text-xs font-bold uppercase tracking-[0.12em] transition ${
                          orderFilter === status
                            ? "bg-[#d6bd7a] text-[#100d0b]"
                            : "text-[#cfc4ad]/75 hover:bg-white/5 hover:text-[#f7efe1]"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {ordersError && (
                  <p className="mb-4 border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-100">
                    {ordersError}
                  </p>
                )}

                {isOrdersLoading ? (
                  <div className="border border-dashed border-[#d6bd7a]/25 bg-black/20 py-14 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 animate-pulse text-[#d6bd7a]/55" />
                    <p className="text-[#cfc4ad]/75">Đang tải đơn hàng...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="border border-dashed border-[#d6bd7a]/25 bg-black/20 py-14 text-center">
                    <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-[#d6bd7a]/55" />
                    <p className="text-[#cfc4ad]/75">Không có đơn hàng nào trong nhóm này.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredOrders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const subtotal = getOrderSubtotal(order);
                      const total = getOrderTotal(order);
                      const itemCount = getOrderItemCount(order);
                      const isCancellable = canCancelOrder(order);
                      const isCancelling = cancellingOrderId === order.databaseId;

                      return (
                        <article key={order.id} className="border border-[#d6bd7a]/18 bg-black/20 p-5 transition hover:border-[#d6bd7a]/35">
                          <div className="flex flex-col gap-4 border-b border-[#d6bd7a]/12 pb-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-lg font-semibold text-[#f7efe1]">Mã đơn: {order.id}</p>
                              <p className="mt-1 text-sm text-[#cfc4ad]/70">
                                Ngày đặt: {order.date} - {itemCount} sản phẩm
                              </p>
                              <p className="mt-1 text-sm text-[#cfc4ad]/70">Thanh toán: {order.paymentMethod}</p>
                            </div>

                            <div className="flex flex-col items-start gap-2 sm:items-end">
                              <button
                                type="button"
                                onClick={() => toggleOrderDetail(order.id)}
                                aria-expanded={isExpanded}
                                aria-label={isExpanded ? `Ẩn chi tiết đơn ${order.id}` : `Xem chi tiết đơn ${order.id}`}
                                className={`inline-flex h-10 items-center gap-2 border px-3 text-sm font-semibold transition hover:border-[#d6bd7a]/60 ${getStatusStyle(order.status)}`}
                              >
                                {order.status === "Đã hủy" ? (
                                  <XCircle className="h-4 w-4" />
                                ) : order.status === "Đã giao" ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                                {order.status}
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                              {isCancellable && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order)}
                                  disabled={isCancelling}
                                  className="inline-flex h-9 items-center gap-2 border border-rose-400/30 px-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-950/30 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <XCircle className="h-4 w-4" />
                                  {isCancelling ? "Đang hủy..." : "Hủy đơn"}
                                </button>
                              )}
                              {order.trackingNumber && (
                                <Link
                                  href={`/tracking/${encodeURIComponent(order.trackingNumber)}`}
                                  className="inline-flex h-9 items-center gap-2 border border-sky-400/30 px-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-950/30"
                                >
                                  <Truck className="h-4 w-4" /> Theo dõi vận đơn
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <span className="text-sm text-[#cfc4ad]/70">Tổng tiền</span>
                            <span className="font-serif text-2xl text-[#d6bd7a]">{formatVND(total)}</span>
                          </div>

                          {isExpanded && (
                            <div className="mt-5 animate-in fade-in slide-in-from-top-2 border border-[#d6bd7a]/15 bg-[#0b0908] p-4 duration-200">
                              <div className="mb-4 flex items-center gap-2">
                                <ReceiptText className="h-5 w-5 text-[#d6bd7a]" />
                                <h4 className="font-semibold text-[#f7efe1]">Chi tiết đơn hàng</h4>
                              </div>

                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <div key={`${order.id}-${item.orderItemId ?? item.id}`} className="grid gap-3 border border-[#d6bd7a]/12 bg-black/20 p-3 sm:grid-cols-[80px_1fr_auto] sm:items-center">
                                    <div
                                      className="h-20 w-20 bg-[#120e0c] bg-cover bg-center"
                                      style={{ backgroundImage: `url(${productImageUrl(item.image)})` }}
                                      aria-label={item.name}
                                    />
                                    <div className="min-w-0">
                                      <p className="font-medium text-[#f7efe1]">{item.name}</p>
                                      <p className="mt-1 text-sm text-[#cfc4ad]/70">
                                        Số lượng: {item.quantity} - Đơn giá: {formatVND(item.price)}
                                      </p>
                                      <Link href={`/product/${item.id}`} className="mt-1 inline-block text-sm font-semibold text-[#d6bd7a] hover:text-[#f4df9b]">
                                        Xem sản phẩm
                                      </Link>
                                      {item.certificateCode && (
                                        <Link
                                          href={`/certificate/${encodeURIComponent(item.certificateCode)}`}
                                          className="ml-0 mt-2 inline-flex h-9 items-center gap-2 border border-emerald-400/25 px-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-950/30 sm:ml-3 sm:mt-0"
                                        >
                                          <FileCheck2 className="h-4 w-4" /> Chứng nhận {item.warrantyMonths || 12} tháng
                                        </Link>
                                      )}
                                      {order.rawStatus === "completed" && (
                                        <button
                                          type="button"
                                          onClick={() => openReviewModal(order.id, item)}
                                          className="ml-0 mt-2 inline-flex h-9 items-center gap-2 border border-[#d6bd7a]/25 px-3 text-sm font-semibold text-[#d6bd7a] transition hover:bg-[#d6bd7a]/10 sm:ml-3 sm:mt-0"
                                        >
                                          <Star className="h-4 w-4" />
                                          {item.review ? "Sửa đánh giá" : "Đánh giá"}
                                        </button>
                                      )}
                                    </div>
                                    <div className="text-left sm:text-right">
                                      <p className="text-sm text-[#cfc4ad]/70">Thành tiền</p>
                                      <p className="font-semibold text-[#f7efe1]">{formatVND(item.price * item.quantity)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
                                <div className="border border-[#d6bd7a]/12 bg-black/20 p-4">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-[#f7efe1]">
                                    <MapPin className="h-4 w-4 text-[#d6bd7a]" />
                                    Địa chỉ giao hàng
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-[#cfc4ad]/75">{order.address}</p>
                                </div>

                                <div className="space-y-2 border border-[#d6bd7a]/12 bg-black/20 p-4">
                                  {[
                                    ["Tạm tính", formatVND(subtotal)],
                                    ["Phí vận chuyển", order.shipping === 0 ? "Miễn phí" : formatVND(order.shipping)],
                                    ["Ưu đãi", `-${formatVND(order.discount)}`],
                                    ["Thuế", formatVND(order.tax)],
                                  ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between text-sm">
                                      <span className="text-[#cfc4ad]/70">{label}</span>
                                      <span className={label === "Ưu đãi" ? "font-medium text-emerald-200" : "font-medium text-[#f7efe1]"}>
                                        {value}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between border-t border-[#d6bd7a]/18 pt-3">
                                    <span className="font-semibold text-[#f7efe1]">Tổng cộng</span>
                                    <span className="font-bold text-[#d6bd7a]">{formatVND(total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}

                <AfterSalesPanel token={token} orders={orders} />
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-7 border-b border-[#d6bd7a]/18 pb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#d6bd7a]">Wishlist</p>
                  <h3 className="mt-3 font-serif text-4xl font-light text-[#f7efe1]">Sản phẩm yêu thích</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#cfc4ad]/75">
                    Những thiết kế trang sức bạn đã lưu để xem lại nhanh hơn.
                  </p>
                </div>

                {favorites.length === 0 ? (
                  <div className="border border-dashed border-[#d6bd7a]/25 bg-black/20 py-14 text-center">
                    <Heart className="mx-auto mb-3 h-12 w-12 text-[#d6bd7a]/55" />
                    <p className="text-[#cfc4ad]/75">Bạn chưa có sản phẩm yêu thích nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {favorites.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-[#d6bd7a]/25 bg-[#0b0908] shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#d6bd7a]/18 px-5 py-4">
              <div>
                <h3 className="font-serif text-3xl font-light text-[#f7efe1]">Đánh giá sản phẩm</h3>
                <p className="mt-1 text-sm text-[#cfc4ad]/70">{reviewTarget.item.name}</p>
              </div>
              <button
                type="button"
                onClick={closeReviewModal}
                className="flex h-9 w-9 items-center justify-center border border-[#d6bd7a]/25 text-[#cfc4ad] transition hover:bg-white/5 hover:text-[#f7efe1]"
                aria-label="Đóng đánh giá"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewRating(rating)}
                    className="p-1 transition hover:bg-[#d6bd7a]/10"
                    aria-label={`Chọn ${rating} sao`}
                  >
                    <Star className={`h-7 w-7 ${rating <= reviewRating ? "fill-[#d6bd7a] text-[#d6bd7a]" : "text-[#cfc4ad]/35"}`} />
                  </button>
                ))}
              </div>

              <label className={`block ${labelClass}`}>
                Nội dung đánh giá
                <textarea
                  value={reviewContent}
                  onChange={(event) => setReviewContent(event.target.value)}
                  className="mt-2 min-h-28 w-full border border-[#d6bd7a]/25 bg-black/25 px-3 py-2 text-sm normal-case tracking-normal text-[#f7efe1] outline-none transition placeholder:text-[#cfc4ad]/45 focus:border-[#d6bd7a] focus:ring-2 focus:ring-[#d6bd7a]/25"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                />
              </label>

              {reviewError && (
                <p className="border border-red-400/30 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-100">
                  {reviewError}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="h-10 border border-[#d6bd7a]/25 px-4 text-sm font-semibold text-[#f7efe1] transition hover:bg-white/5"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="h-10 bg-[#d6bd7a] px-4 text-sm font-bold text-[#100d0b] transition hover:bg-[#f4df9b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
