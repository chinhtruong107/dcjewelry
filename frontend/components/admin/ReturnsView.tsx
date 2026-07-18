"use client";

import { CheckCircle2, Clock3, ImageIcon, RefreshCcw, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { AdminReturnRequest, formatDateTime, SectionCard } from "./shared";

const typeLabels = { return: "Trả hàng", exchange: "Đổi hàng", warranty: "Bảo hành" } as const;
const statusLabels: Record<string, string> = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối", received: "Đã nhận hàng", refunded: "Đã hoàn tiền", completed: "Hoàn tất" };
const nextStatuses: Record<string, Array<{ value: string; label: string }>> = {
  pending: [{ value: "approved", label: "Duyệt" }, { value: "rejected", label: "Từ chối" }],
  approved: [{ value: "received", label: "Đã nhận sản phẩm" }],
  received: [{ value: "refunded", label: "Xác nhận hoàn tiền" }, { value: "completed", label: "Hoàn tất xử lý" }],
  refunded: [{ value: "completed", label: "Đóng yêu cầu" }],
};

export default function ReturnsView({ requests, updatingReturnId, onUpdateReturn }: { requests: AdminReturnRequest[]; updatingReturnId: number | null; onUpdateReturn: (id: number, status: string, note: string) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const visible = useMemo(() => requests.filter((request) => {
    if (status !== "all" && request.status !== status) return false;
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return [request.request_number, request.user?.name, request.user?.email, request.order?.order_number, request.order_item?.product_name, request.reason].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword));
  }), [query, requests, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Đổi trả & bảo hành</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Duyệt yêu cầu, ghi chú hướng xử lý và xác nhận hoàn tiền thủ công.</p></div>
        <div className="flex w-full items-center justify-center gap-2 rounded-md border border-orange-100 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200 sm:w-auto"><Clock3 className="h-4 w-4" />{requests.filter((item) => item.status === "pending").length} yêu cầu chờ duyệt</div>
      </div>
      <SectionCard className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="flex h-10 items-center gap-2 rounded-md border border-orange-100 bg-orange-50/60 px-3 dark:border-slate-700 dark:bg-slate-950"><Search className="h-4 w-4 text-orange-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Mã yêu cầu, khách hàng, sản phẩm..." /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-orange-100 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"><option value="all">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
      </SectionCard>
      {visible.length === 0 ? (
        <SectionCard className="grid min-h-48 place-items-center p-6 text-center text-sm text-slate-500"><ShieldCheck className="mb-2 h-10 w-10 text-orange-300" />Không có yêu cầu phù hợp.</SectionCard>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((request) => {
            const isUpdating = updatingReturnId === request.id;
            return (
              <SectionCard key={request.id} className="overflow-hidden">
                <div className="border-b border-orange-100 bg-orange-50/60 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-200">{request.request_number}</p><h3 className="mt-1 font-semibold text-slate-950 dark:text-white">{typeLabels[request.type]} — {request.order_item?.product_name || "Sản phẩm"}</h3></div><span className="rounded-md border border-orange-200 bg-white px-2.5 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-slate-950 dark:text-orange-200">{statusLabels[request.status] || request.status}</span></div>
                  <p className="mt-2 break-words text-xs text-slate-500">{request.user?.name} · {request.user?.email} · {request.order?.order_number}</p>
                </div>
                <div className="space-y-4 p-4">
                  <div><p className="text-xs font-semibold uppercase text-slate-400">Lý do</p><p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">{request.reason}</p>{request.details && <p className="mt-2 text-sm leading-6 text-slate-500">{request.details}</p>}</div>
                  {!!request.image_urls?.length && <div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-400"><ImageIcon className="h-4 w-4" />Ảnh khách gửi</p><div className="flex flex-wrap gap-2">{request.image_urls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer"><Image src={url} alt="Ảnh hậu mãi" width={80} height={80} unoptimized className="h-16 w-16 rounded-md object-cover ring-1 ring-slate-200 sm:h-20 sm:w-20" /></a>)}</div></div>}
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Ghi chú cho khách<textarea value={notes[request.id] ?? request.admin_note ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} className="mt-1.5 min-h-20 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-950" placeholder="Hướng dẫn gửi hàng, lý do từ chối, thông tin hoàn tiền..." /></label>
                  <div className="flex flex-col items-stretch justify-between gap-3 border-t border-orange-100 pt-4 dark:border-slate-700 sm:flex-row sm:items-center"><time className="text-xs text-slate-500">{formatDateTime(request.requested_at)}</time><div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">{(nextStatuses[request.status] || []).filter((action) => action.value !== "refunded" || request.type === "return").map((action) => <button key={action.value} type="button" disabled={isUpdating} onClick={() => onUpdateReturn(request.id, action.value, notes[request.id] ?? request.admin_note ?? "")} className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold text-white disabled:opacity-50 sm:w-auto ${action.value === "rejected" ? "bg-rose-600 hover:bg-rose-700" : "bg-orange-500 hover:bg-orange-600"}`}>{action.value === "approved" || action.value === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}{isUpdating ? "Đang cập nhật..." : action.label}</button>)}</div></div>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
