"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { readStoredValue, STORAGE_KEYS } from "@/lib/storageKeys";

const PROMO_SEEN_KEY = STORAGE_KEYS.firstVisitPromoSeen;
const PROMO_IMAGE_SRC = "/images/b6755c68-8537-4e08-9695-54355278ea59.jpg";

export default function FirstVisitPromo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPromo = readStoredValue(PROMO_SEEN_KEY);

    if (!hasSeenPromo) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePromo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  const closePromo = () => {
    localStorage.setItem(PROMO_SEEN_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Banner quang cao"
      onMouseDown={closePromo}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-lg shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePromo}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dong banner quang cao"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-[1024/536] w-full">
          <Image
            src={PROMO_IMAGE_SRC}
            alt="Ưu đãi trang sức dành cho khách hàng mới của Đức Chính Jewelry"
            fill
            priority
            sizes="(max-width: 768px) 94vw, 768px"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
