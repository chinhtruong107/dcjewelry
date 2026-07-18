"use client";

import { Award, Gem, Printer, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type CertificateData = {
  certificate_code: string;
  product_name: string;
  product_image?: string | null;
  order_number: string;
  warranty_months: number;
  warranty_starts_at?: string | null;
  warranty_expires_at?: string | null;
  is_valid: boolean;
  issued_at?: string | null;
};

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(value)) : "Chưa kích hoạt";
}

export default function CertificatePage() {
  const { certificateCode } = useParams<{ certificateCode: string }>();
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/certificates/${encodeURIComponent(certificateCode)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "Không tìm thấy chứng nhận.");
        setData(payload);
      })
      .catch((fetchError) => {
        if (!controller.signal.aborted) setError(fetchError instanceof Error ? fetchError.message : "Không thể xác minh chứng nhận.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [certificateCode]);

  return (
    <main className="min-h-screen bg-[#e9e0d1] px-4 py-10 text-[#28171a] print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex justify-end print:hidden">
          <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 bg-[#28171a] px-5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-[#7a2130]">
            <Printer className="h-4 w-4" /> In chứng nhận
          </button>
        </div>
        <section className="relative overflow-hidden border-[10px] border-double border-[#9a7434] bg-[#fffaf2] px-6 py-12 shadow-[0_35px_100px_rgba(60,38,20,0.18)] sm:px-14 sm:py-16">
          <Gem className="absolute -right-12 -top-12 h-52 w-52 text-[#d6bd7a]/10" />
          <div className="relative text-center">
            <Award className="mx-auto h-12 w-12 text-[#9a7434]" />
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.38em] text-[#7a2130]">Đức Chính Jewelry</p>
            <h1 className="mt-4 font-serif text-4xl font-normal sm:text-6xl">Chứng nhận bảo hành</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#756568]">Chứng nhận điện tử xác thực sản phẩm và thời hạn bảo hành tại cửa hàng.</p>
          </div>

          {loading ? (
            <p className="relative mt-14 text-center text-[#756568]">Đang xác minh mã chứng nhận...</p>
          ) : error || !data ? (
            <div className="relative mt-12 border border-rose-200 bg-rose-50 p-5 text-center text-rose-700" role="alert">{error}</div>
          ) : (
            <div className="relative mt-12">
              <div className="border-y border-[#9a7434]/30 py-8 text-center">
                <p className="text-xs uppercase tracking-[0.22em] text-[#756568]">Sản phẩm được chứng nhận</p>
                <h2 className="mt-3 font-serif text-3xl text-[#7a2130]">{data.product_name}</h2>
                <p className="mt-4 font-mono text-sm font-bold tracking-[0.18em]">{data.certificate_code}</p>
              </div>
              <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {[
                  ["Mã đơn hàng", data.order_number],
                  ["Thời hạn", `${data.warranty_months} tháng`],
                  ["Trạng thái", data.is_valid ? "Đang hiệu lực" : "Chưa kích hoạt hoặc đã hết hạn"],
                  ["Ngày phát hành", formatDate(data.issued_at)],
                  ["Ngày kích hoạt", formatDate(data.warranty_starts_at)],
                  ["Hạn bảo hành", formatDate(data.warranty_expires_at)],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-[#28171a]/12 pb-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#756568]">{label}</dt>
                    <dd className="mt-2 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10 flex items-start gap-3 bg-[#efe4cf] p-5 text-sm leading-7 text-[#5e4d50]">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#7a2130]" />
                Thông tin được truy xuất trực tiếp từ mã chứng nhận duy nhất của từng sản phẩm trong đơn hàng.
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
