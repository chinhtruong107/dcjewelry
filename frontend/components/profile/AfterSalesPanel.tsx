"use client";

import { AlertCircle, Camera, CheckCircle2, Clock3, RefreshCcw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type EligibleItem = {
  id: number;
  orderItemId?: number;
  name: string;
  warrantyMonths?: number | null;
  warrantyExpiresAt?: string | null;
};

type EligibleOrder = {
  databaseId: number;
  id: string;
  rawStatus?: string;
  deliveredAt?: string | null;
  updatedAt?: string | null;
  items: EligibleItem[];
};

type ReturnRequest = {
  id: number;
  request_number: string;
  type: "return" | "exchange" | "warranty";
  status: string;
  reason: string;
  details?: string | null;
  admin_note?: string | null;
  requested_at: string;
  image_urls?: string[];
  order?: { order_number?: string } | null;
  order_item?: { product_name?: string } | null;
};

const typeLabels = { return: "Trả hàng", exchange: "Đổi hàng", warranty: "Bảo hành" } as const;
const statusLabels: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  received: "Đã nhận sản phẩm",
  refunded: "Đã hoàn tiền thủ công",
  completed: "Hoàn tất",
};

export default function AfterSalesPanel({ token, orders }: { token: string | null; orders: EligibleOrder[] }) {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [type, setType] = useState<keyof typeof typeLabels>("return");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const completedOrders = useMemo(() => orders.filter((order) => order.rawStatus === "completed"), [orders]);
  const itemOptions = useMemo(() => completedOrders.flatMap((order) => order.items
    .filter((item) => {
      if (!item.orderItemId) return false;
      if (type === "warranty") return !item.warrantyExpiresAt || new Date(item.warrantyExpiresAt).getTime() >= Date.now();
      const deliveredAt = order.deliveredAt || order.updatedAt;
      return !deliveredAt || new Date(deliveredAt).getTime() + 7 * 24 * 60 * 60 * 1000 >= Date.now();
    })
    .map((item) => ({ order, item }))), [completedOrders, type]);

  useEffect(() => {
    if (selectedItem && !itemOptions.some(({ order, item }) => `${order.databaseId}:${item.orderItemId}` === selectedItem)) {
      setSelectedItem("");
    }
  }, [itemOptions, selectedItem]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    fetch("/api/return-requests", {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "Không thể tải yêu cầu hậu mãi.");
        setRequests(payload);
      })
      .catch((fetchError) => {
        if (!controller.signal.aborted) setError(fetchError instanceof Error ? fetchError.message : "Không thể tải yêu cầu hậu mãi.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token]);

  const handleFiles = (files: FileList | null) => {
    setError("");
    const nextFiles = Array.from(files || []).slice(0, 3);
    const invalid = nextFiles.find((file) => !file.type.startsWith("image/") || file.size > 4 * 1024 * 1024);
    if (invalid) {
      setError("Mỗi ảnh phải là JPG, PNG hoặc WebP và không vượt quá 4MB.");
      return;
    }
    setImages(nextFiles);
  };

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selectedItem || !reason.trim()) {
      setError("Vui lòng chọn sản phẩm và nhập lý do.");
      return;
    }
    const [orderId, orderItemId] = selectedItem.split(":");
    const formData = new FormData();
    formData.set("order_id", orderId);
    formData.set("order_item_id", orderItemId);
    formData.set("type", type);
    formData.set("reason", reason.trim());
    if (details.trim()) formData.set("details", details.trim());
    images.forEach((image) => formData.append("images[]", image));

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/return-requests", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        const validationError = payload?.errors ? Object.values(payload.errors).flat()[0] : null;
        throw new Error(String(validationError || payload?.message || "Không thể gửi yêu cầu."));
      }
      setRequests((current) => [payload, ...current]);
      setSelectedItem("");
      setReason("");
      setDetails("");
      setImages([]);
      setSuccess(`Đã tạo yêu cầu ${payload.request_number}.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 border-t border-[#d6bd7a]/18 pt-8" aria-labelledby="after-sales-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#d6bd7a]">Chăm sóc sau mua</p>
          <h3 id="after-sales-title" className="mt-3 font-serif text-3xl font-light text-[#f7efe1]">Đổi trả & bảo hành</h3>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[#cfc4ad]/70">Đổi hoặc trả trong 7 ngày sau khi giao thành công; bảo hành theo thời hạn trên chứng nhận từng sản phẩm.</p>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={submitRequest} className="space-y-4 border border-[#d6bd7a]/18 bg-black/20 p-5">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(typeLabels) as Array<keyof typeof typeLabels>).map((item) => (
              <button key={item} type="button" onClick={() => setType(item)} className={`min-h-11 border px-2 text-xs font-bold uppercase tracking-[0.1em] transition ${type === item ? "border-[#d6bd7a] bg-[#d6bd7a] text-[#100d0b]" : "border-[#d6bd7a]/20 text-[#cfc4ad] hover:border-[#d6bd7a]/50"}`}>
                {typeLabels[item]}
              </button>
            ))}
          </div>
          <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#f7efe1]">
            Sản phẩm trong đơn đã giao
            <select value={selectedItem} onChange={(event) => setSelectedItem(event.target.value)} className="mt-2 h-12 w-full border border-[#d6bd7a]/25 bg-[#0b0908] px-3 text-sm font-normal normal-case tracking-normal text-[#f7efe1] outline-none focus:border-[#d6bd7a]">
              <option value="">Chọn sản phẩm</option>
              {itemOptions.map(({ order, item }) => <option key={`${order.databaseId}-${item.orderItemId}`} value={`${order.databaseId}:${item.orderItemId}`}>{order.id} — {item.name}</option>)}
            </select>
            {itemOptions.length === 0 && <span className="mt-2 block text-xs font-normal normal-case tracking-normal text-amber-200">Không có sản phẩm còn đủ điều kiện cho loại yêu cầu này.</span>}
          </label>
          <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#f7efe1]">
            Lý do
            <input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} className="mt-2 h-12 w-full border border-[#d6bd7a]/25 bg-black/25 px-3 text-sm font-normal normal-case tracking-normal text-[#f7efe1] outline-none placeholder:text-[#cfc4ad]/40 focus:border-[#d6bd7a]" placeholder="Ví dụ: sai kích thước, cần kiểm tra khóa..." />
          </label>
          <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#f7efe1]">
            Chi tiết
            <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={2000} className="mt-2 min-h-24 w-full border border-[#d6bd7a]/25 bg-black/25 px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#f7efe1] outline-none placeholder:text-[#cfc4ad]/40 focus:border-[#d6bd7a]" placeholder="Mô tả tình trạng sản phẩm và mong muốn xử lý." />
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-[#d6bd7a]/30 px-4 py-4 text-sm font-semibold text-[#d6bd7a] hover:bg-[#d6bd7a]/8">
            <Camera className="h-5 w-5" /> {images.length ? `Đã chọn ${images.length} ảnh` : "Thêm tối đa 3 ảnh"}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => handleFiles(event.target.files)} />
          </label>
          {error && <p className="flex gap-2 border border-rose-400/30 bg-rose-950/30 p-3 text-sm text-rose-100" role="alert"><AlertCircle className="h-5 w-5 shrink-0" />{error}</p>}
          {success && <p className="flex gap-2 border border-emerald-400/30 bg-emerald-950/25 p-3 text-sm text-emerald-100"><CheckCircle2 className="h-5 w-5 shrink-0" />{success}</p>}
          <button type="submit" disabled={submitting || itemOptions.length === 0} className="h-12 w-full bg-[#d6bd7a] text-xs font-bold uppercase tracking-[0.18em] text-[#100d0b] transition hover:bg-[#f4df9b] disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? "Đang gửi..." : "Gửi yêu cầu hậu mãi"}
          </button>
        </form>

        <div className="border border-[#d6bd7a]/18 bg-black/20 p-5">
          <div className="mb-4 flex items-center gap-2"><RefreshCcw className="h-5 w-5 text-[#d6bd7a]" /><h4 className="font-semibold text-[#f7efe1]">Lịch sử yêu cầu</h4></div>
          {loading ? (
            <div className="grid min-h-40 place-items-center text-sm text-[#cfc4ad]/65"><Clock3 className="mb-2 h-8 w-8 animate-pulse text-[#d6bd7a]" />Đang tải...</div>
          ) : requests.length === 0 ? (
            <div className="grid min-h-40 place-items-center border border-dashed border-[#d6bd7a]/20 px-4 text-center text-sm text-[#cfc4ad]/65"><ShieldCheck className="mb-2 h-9 w-9 text-[#d6bd7a]/55" />Bạn chưa có yêu cầu nào.</div>
          ) : (
            <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
              {requests.map((request) => (
                <article key={request.id} className="border border-[#d6bd7a]/14 bg-[#0b0908] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#d6bd7a]">{request.request_number}</p><p className="mt-1 text-sm font-semibold text-[#f7efe1]">{typeLabels[request.type]} — {request.order_item?.product_name}</p></div>
                    <span className="border border-[#d6bd7a]/25 px-2.5 py-1 text-xs font-semibold text-[#f7e4ac]">{statusLabels[request.status] || request.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#cfc4ad]/70">{request.reason}</p>
                  {request.admin_note && <p className="mt-3 border-l-2 border-[#d6bd7a] pl-3 text-sm leading-6 text-[#f7efe1]">Phản hồi cửa hàng: {request.admin_note}</p>}
                  {!!request.image_urls?.length && <div className="mt-3 flex gap-2">{request.image_urls.map((url) => <Image key={url} src={url} alt="Ảnh yêu cầu hậu mãi" width={64} height={64} unoptimized className="h-16 w-16 object-cover" />)}</div>}
                  <time className="mt-3 block text-xs text-[#cfc4ad]/45">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.requested_at))}</time>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
