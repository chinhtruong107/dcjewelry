"use client";

import { ArrowLeft, CheckCircle2, CircleDot, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type TrackingEvent = { id: number; status: string; title: string; description?: string | null; location?: string | null; event_at: string };
type TrackingData = {
  order_number: string;
  shipping_carrier: string;
  shipping_carrier_label: string;
  tracking_number: string;
  status: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  events: TrackingEvent[];
};

function formatTime(value?: string | null) {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function TrackingPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/shipments/track/${encodeURIComponent(trackingNumber)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "Không tìm thấy vận đơn.");
        setData(payload);
      })
      .catch((fetchError) => {
        if (!controller.signal.aborted) setError(fetchError instanceof Error ? fetchError.message : "Không thể tra cứu vận đơn.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [trackingNumber]);

  return (
    <main className="min-h-screen bg-[#070607] px-5 py-12 text-[#f7efe1] sm:px-8 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <Link href="/profile" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d6bd7a] hover:text-[#f4df9b]">
          <ArrowLeft className="h-4 w-4" /> Về tài khoản
        </Link>
        <div className="mt-8 border border-[#d6bd7a]/20 bg-[#0b0908] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.4)] sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d6bd7a]">Theo dõi vận chuyển</p>
          <h1 className="mt-4 font-serif text-4xl font-light sm:text-6xl">Hành trình đơn hàng</h1>

          {loading ? (
            <div className="mt-12 grid place-items-center border border-dashed border-[#d6bd7a]/25 py-16">
              <Truck className="h-12 w-12 animate-pulse text-[#d6bd7a]" />
              <p className="mt-4 text-sm text-[#cfc4ad]/75">Đang kết nối hệ thống vận chuyển demo...</p>
            </div>
          ) : error || !data ? (
            <div className="mt-10 border border-rose-400/30 bg-rose-950/30 p-5 text-rose-100" role="alert">{error}</div>
          ) : (
            <>
              <div className="mt-9 grid gap-4 border-y border-[#d6bd7a]/16 py-6 sm:grid-cols-3">
                <div><p className="text-xs uppercase tracking-wider text-[#cfc4ad]/55">Mã đơn</p><p className="mt-2 font-semibold">{data.order_number}</p></div>
                <div><p className="text-xs uppercase tracking-wider text-[#cfc4ad]/55">Đơn vị demo</p><p className="mt-2 font-semibold">{data.shipping_carrier_label}</p></div>
                <div><p className="text-xs uppercase tracking-wider text-[#cfc4ad]/55">Mã vận đơn</p><p className="mt-2 break-all font-semibold text-[#d6bd7a]">{data.tracking_number}</p></div>
              </div>
              <div className="mt-10 space-y-0">
                {data.events.map((event, index) => {
                  const isLast = index === data.events.length - 1;
                  return (
                    <div key={event.id} className="grid grid-cols-[32px_1fr] gap-4">
                      <div className="flex flex-col items-center">
                        {isLast ? <CheckCircle2 className="h-6 w-6 text-[#d6bd7a]" /> : <CircleDot className="h-6 w-6 text-[#d6bd7a]/70" />}
                        {!isLast && <span className="min-h-16 w-px flex-1 bg-[#d6bd7a]/25" />}
                      </div>
                      <div className="pb-8">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="font-semibold">{event.title}</h2>
                          <time className="text-xs text-[#cfc4ad]/60">{formatTime(event.event_at)}</time>
                        </div>
                        {event.description && <p className="mt-2 text-sm leading-6 text-[#cfc4ad]/72">{event.description}</p>}
                        {event.location && <p className="mt-1 text-xs text-[#d6bd7a]/75">{event.location}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-start gap-3 border border-[#d6bd7a]/20 bg-[#d6bd7a]/8 p-4 text-sm leading-6 text-[#cfc4ad]">
                <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#d6bd7a]" />
                Đây là tích hợp GHN/GHTK ở chế độ demo. Mã và trạng thái được hệ thống cửa hàng mô phỏng để kiểm thử luồng vận chuyển.
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
