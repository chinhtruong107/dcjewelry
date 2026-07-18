"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-160px)] place-items-center bg-[#f5f0e7] px-6 py-20 text-center">
      <div className="max-w-xl border border-[#7a2130]/16 bg-[#fffaf3] p-8 shadow-sm sm:p-12">
        <AlertTriangle className="mx-auto h-9 w-9 text-[#7a2130]" />
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7a2130]">Có một gián đoạn nhỏ</p>
        <h1 className="mt-4 font-serif text-4xl font-normal text-[#28171a]">Trang chưa thể hiển thị</h1>
        <p className="mt-4 text-sm leading-7 text-[#756568]">Vui lòng thử tải lại. Nếu vấn đề vẫn tiếp diễn, Đức Chính Jewelry luôn sẵn sàng hỗ trợ qua hotline 0389794445.</p>
        <button type="button" onClick={reset} className="luxury-button mt-8 inline-flex h-12 items-center justify-center gap-2 px-6">
          <RefreshCw className="h-4 w-4" /> Thử lại
        </button>
      </div>
    </main>
  );
}
