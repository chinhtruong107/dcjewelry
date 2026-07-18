"use client";

import { ArrowDownRight, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type React from "react";

const heroSlides = [
  {
    image: "/images/duc-chinh-editorial-hero.png",
    alt: "Trang sức Đức Chính trong không gian editorial",
  },
  {
    image: "/images/duc-chinh-jewelry-hero.png",
    alt: "Bộ sưu tập trang sức vàng và đá quý Đức Chính",
  },
  {
    image: "/images/duc-chinh-jewelry-slide-3.png",
    alt: "Ảnh banner trang sức cao cấp",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const scrollTo = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative mx-auto max-w-[1600px] overflow-hidden bg-[#f5f0e7] text-[#28171a]">
      <div className="grid lg:min-h-[760px] lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative z-10 flex min-h-[520px] flex-col justify-between px-5 py-8 sm:min-h-[600px] sm:px-10 lg:min-h-[760px] lg:px-16 lg:py-14 xl:px-24">
          <div className="flex items-center justify-between gap-4 border-b border-[#28171a]/15 pb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a2130] sm:tracking-[0.28em]">
            <span>Fine jewelry · 2026</span>
            <span>Hà Nội</span>
          </div>

          <div className="py-10 sm:py-14 lg:py-20">
            <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a2130] sm:mb-7 sm:text-[11px] sm:tracking-[0.3em]">
              <span className="h-px w-7 shrink-0 bg-[#7a2130] sm:w-9" /> The new heirloom
            </p>
            <h1 className="font-serif text-6xl font-normal leading-[0.82] text-[#28171a] sm:text-7xl md:text-8xl xl:text-9xl">
              Đức
              <span className="block pl-[0.48em] italic text-[#7a2130]">Chính</span>
            </h1>
            <p className="mt-8 max-w-md text-sm leading-7 text-[#68585a] sm:mt-10 sm:text-base sm:leading-8">
              Trang sức dành cho hiện tại, được tạo nên để trở thành một phần của những câu chuyện dài lâu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
              <a
                href="#ban-chay"
                onClick={(event) => scrollTo(event, "ban-chay")}
                className="inline-flex min-h-11 items-center bg-[#7a2130] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#fffaf2] transition hover:bg-[#55131e] sm:px-7 sm:py-4 sm:text-[11px] sm:tracking-[0.22em]"
              >
                Xem bộ sưu tập <ArrowRight className="ml-3 h-4 w-4" />
              </a>
              <a
                href="#vong-tay"
                onClick={(event) => scrollTo(event, "vong-tay")}
                className="inline-flex min-h-11 items-center border border-[#28171a]/25 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#28171a] transition hover:border-[#7a2130] hover:text-[#7a2130] sm:px-7 sm:py-4 sm:text-[11px] sm:tracking-[0.22em]"
              >
                Vòng tay
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-[#28171a]/15 pt-5 text-[8px] uppercase tracking-[0.14em] text-[#77676a] sm:text-[9px] sm:tracking-[0.18em]">
            <span>18K gold</span>
            <span className="text-center">Natural stone</span>
            <span className="text-right">Made to order</span>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-[760px]">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.image}
              aria-hidden={currentSlide !== index}
              aria-label={slide.alt}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-[1400ms] ease-out ${
                currentSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-[1.035]"
              }`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#28171a]/10" />
          <div className="absolute bottom-5 right-5 inline-flex items-center gap-2 bg-[#7a2130] px-3 py-2 text-[#fffaf2] shadow-[0_12px_28px_rgba(74,18,28,0.16)] sm:bottom-8 sm:right-8 sm:px-4 sm:py-2.5 lg:bottom-10 lg:right-10">
            <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[7px] font-bold uppercase tracking-[0.14em] sm:text-[8px] sm:tracking-[0.18em]">Discover</span>
          </div>
          <div className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 -rotate-90 bg-[#f5f0e7] px-5 py-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#7a2130] lg:block">
            Objects of affection
          </div>
          <div className="absolute bottom-6 left-6 flex gap-2 sm:bottom-10 sm:left-10">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                aria-label={`Chuyển đến ảnh banner ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === index ? "w-9 bg-[#fffaf2]" : "w-2.5 bg-[#fffaf2]/55 hover:bg-[#fffaf2]/85"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
