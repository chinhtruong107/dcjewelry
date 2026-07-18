import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="min-h-screen bg-[#f5f0e7] px-6 py-24 text-center text-[#28171a]">
      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#7a2130]">Không tìm thấy</p>
      <h1 className="mx-auto mt-5 max-w-2xl font-serif text-5xl font-normal tracking-[-0.04em] sm:text-6xl">
        Sản phẩm không tồn tại
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#756568]">
        Sản phẩm bạn đang tìm kiếm có thể đã được ẩn hoặc không còn trong bộ sưu tập.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center gap-2 border border-[#7a2130] bg-[#7a2130] px-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#fffaf2] transition hover:bg-[#55131e]"
      >
        <ArrowLeft className="h-4 w-4" />
        Trở lại cửa hàng
      </Link>
    </main>
  );
}
