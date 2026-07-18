import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductBreadcrumb() {
  return (
    <nav className="mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#756568] transition hover:text-[#7a2130]"
      >
        <ArrowLeft className="h-4 w-4" />
        Trở lại cửa hàng
      </Link>
    </nav>
  );
}
