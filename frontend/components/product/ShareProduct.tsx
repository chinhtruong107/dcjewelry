"use client";

import { Check, Copy, Facebook, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareProductProps {
  productId: number;
  productName: string;
  productImage?: string;
}

export default function ShareProduct({ productId, productName }: ShareProductProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/product/${productId}`;
  const shareText = `${productName} - Hãy xem thiết kế này từ Đức Chính Jewelry!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, "_blank", "width=600,height=400");
      },
    },
    {
      name: "WhatsApp",
      icon: () => (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
        </svg>
      ),
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank");
      },
    },
    {
      name: "Sao chép liên kết",
      icon: copied ? Check : Copy,
      action: handleCopyLink,
      color: copied ? "text-[#7a2130]" : "",
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-10 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#756568] transition hover:text-[#7a2130]"
      >
        <Share2 className="h-4 w-4" />
        Chia sẻ
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[210px] border border-[#28171a]/12 bg-[#fffdf9] p-2 shadow-[0_24px_60px_rgba(54,28,32,0.14)]">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.name}
                type="button"
                onClick={() => {
                  option.action();
                  if (option.name !== "Sao chép liên kết") {
                    setIsOpen(false);
                  }
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-semibold text-[#28171a] transition hover:bg-[#f5eee6] hover:text-[#7a2130] ${option.color || ""}`}
              >
                <Icon className={`h-4 w-4 ${option.color || ""}`} />
                <span>{option.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
