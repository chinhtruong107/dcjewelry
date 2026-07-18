"use client";

import { BadgeCheck, Sparkles, Truck } from "lucide-react";
import Image from "next/image";

interface AuthBannerProps { title: string; description: string; badge: string; }

export default function AuthBanner({ title, description, badge }: AuthBannerProps) {
  return (
    <aside className="hidden min-h-[620px] overflow-hidden bg-[#efe7db] lg:grid lg:grid-rows-[1fr_auto]">
      <div className="relative min-h-[500px]">
        <Image src="/images/duc-chinh-editorial-hero.png" alt="Bộ sưu tập Đức Chính Jewelry" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#efe7db] to-transparent" />
        <div className="absolute left-7 top-7 inline-flex items-center gap-2 bg-[#7a2130] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-white"><Sparkles className="h-3.5 w-3.5" />{badge}</div>
        <div className="absolute bottom-8 left-8 right-8 max-w-2xl">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#7a2130]">Private client service</p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl font-normal leading-tight tracking-[-0.03em] text-[#28171a] xl:text-5xl">{title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#67575a]">{description}</p>
        </div>
      </div>
      <div className="grid gap-5 border-t border-[#28171a]/10 bg-[#fffdf9] p-7 xl:grid-cols-[1fr_auto] xl:items-center">
        <p className="max-w-xl text-sm leading-6 text-[#746367]">Theo dõi đơn hàng, lưu địa chỉ và nhận gợi ý thiết kế phù hợp với dấu ấn riêng của bạn.</p>
        <div className="flex gap-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a2130]"><span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Đặc quyền</span><span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Giao hàng</span></div>
      </div>
    </aside>
  );
}
