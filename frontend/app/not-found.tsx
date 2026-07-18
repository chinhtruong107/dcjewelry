import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100vh-160px)] place-items-center bg-[#070607] px-6 py-20 text-center text-[#f7efe1]">
      <div className="max-w-2xl border border-[#d6bd7a]/24 bg-[#0d0b0a] p-8 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d6bd7a]">404 · Not found</p>
        <h1 className="mt-5 font-serif text-5xl font-light sm:text-6xl">Không tìm thấy trang</h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#cfc4ad]/75">Nội dung có thể đã được di chuyển hoặc đường dẫn chưa chính xác. Hãy quay lại bộ sưu tập để tiếp tục khám phá.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="luxury-button inline-flex h-12 items-center justify-center gap-2 px-6"><ArrowLeft className="h-4 w-4" /> Về trang chủ</Link>
          <Link href="/search" className="luxury-button-outline inline-flex h-12 items-center justify-center gap-2 px-6"><Search className="h-4 w-4" /> Tìm sản phẩm</Link>
        </div>
      </div>
    </main>
  );
}
