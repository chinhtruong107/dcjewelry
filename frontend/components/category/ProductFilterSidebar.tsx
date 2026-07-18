"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Filter, RotateCcw } from "lucide-react";
import { formatVND } from "@/lib/utils";

export interface PriceRangeValue {
  min: number;
  max: number;
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";
export type GoldKaratOption = "10k" | "14k" | "18k" | "24k";

export interface ProductFilters {
  priceRange: PriceRangeValue;
  goldKarats: GoldKaratOption[];
  bestSellerOnly: boolean;
  sort: SortOption;
}

interface ProductFilterSidebarProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export const PRICE_RANGE_LIMITS: PriceRangeValue = {
  min: 0,
  max: 10000000,
};

const PRICE_STEP = 100000;

const GOLD_KARAT_OPTIONS: { id: GoldKaratOption; label: string; description: string }[] = [
  { id: "10k", label: "10K", description: "Nhẹ giá, dễ đeo hằng ngày" },
  { id: "14k", label: "14K", description: "Cân bằng độ bền và sắc vàng" },
  { id: "18k", label: "18K", description: "Hàm lượng vàng cao, sang hơn" },
  { id: "24k", label: "24K", description: "Vàng nguyên chất" },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "featured", label: "Nổi bật" },
  { id: "price-asc", label: "Giá thấp đến cao" },
  { id: "price-desc", label: "Giá cao đến thấp" },
  { id: "name-asc", label: "Tên A-Z" },
];

export const defaultProductFilters: ProductFilters = {
  priceRange: { ...PRICE_RANGE_LIMITS },
  goldKarats: [],
  bestSellerOnly: false,
  sort: "featured",
};

export default function ProductFilterSidebar({
  filters,
  onChange,
}: ProductFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    price: true,
    material: true,
    status: true,
    sort: true,
  });

  const priceRangeChanged =
    filters.priceRange.min !== PRICE_RANGE_LIMITS.min ||
    filters.priceRange.max !== PRICE_RANGE_LIMITS.max;

  const activeCount = useMemo(
    () =>
      (priceRangeChanged ? 1 : 0) +
      filters.goldKarats.length +
      (filters.bestSellerOnly ? 1 : 0),
    [filters.bestSellerOnly, filters.goldKarats.length, priceRangeChanged]
  );

  const minPercent =
    ((filters.priceRange.min - PRICE_RANGE_LIMITS.min) /
      (PRICE_RANGE_LIMITS.max - PRICE_RANGE_LIMITS.min)) *
    100;
  const maxPercent =
    ((filters.priceRange.max - PRICE_RANGE_LIMITS.min) /
      (PRICE_RANGE_LIMITS.max - PRICE_RANGE_LIMITS.min)) *
    100;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updatePriceRange = (priceRange: PriceRangeValue) => {
    onChange({ ...filters, priceRange });
  };

  const toggleGoldKarat = (goldKarat: GoldKaratOption) => {
    const nextGoldKarats = filters.goldKarats.includes(goldKarat)
      ? filters.goldKarats.filter((item) => item !== goldKarat)
      : [...filters.goldKarats, goldKarat];

    onChange({ ...filters, goldKarats: nextGoldKarats });
  };

  const clearFilters = () => {
    onChange({
      ...defaultProductFilters,
      priceRange: { ...PRICE_RANGE_LIMITS },
      goldKarats: [],
    });
  };

  return (
    <aside className="sticky top-24 w-full border border-[#d6bd7a]/24 bg-[#0d0b0a] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="mb-6 flex items-start justify-between gap-3 border-b border-[#d6bd7a]/18 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center border border-[#d6bd7a]/28 bg-black/30 text-[#d6bd7a]">
            <Filter className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-xl text-[#f7efe1]">Bộ lọc sản phẩm</h2>
            <p className="mt-1 text-xs text-[#cfc4ad]/68">
              {activeCount > 0 ? `${activeCount} bộ lọc đang bật` : "Lọc theo nhu cầu mua sắm"}
            </p>
          </div>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="grid h-9 w-9 place-items-center border border-[#d6bd7a]/20 text-[#cfc4ad] transition hover:border-[#d6bd7a]/55 hover:text-[#d6bd7a]"
            aria-label="Xóa bộ lọc"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      <FilterSection title="Khoảng giá" open={openSections.price} onToggle={() => toggleSection("price")}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-[#d6bd7a]/18 bg-black/24 px-3 py-2">
              <p className="text-xs text-[#cfc4ad]/62">Từ</p>
              <p className="mt-1 text-sm font-semibold text-[#f7efe1]">
                {formatVND(filters.priceRange.min)}
              </p>
            </div>
            <div className="border border-[#d6bd7a]/18 bg-black/24 px-3 py-2 text-right">
              <p className="text-xs text-[#cfc4ad]/62">Đến</p>
              <p className="mt-1 text-sm font-semibold text-[#f7efe1]">
                {formatVND(filters.priceRange.max)}
              </p>
            </div>
          </div>

          <div className="px-1 pt-2">
            <div className="relative h-8">
              <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-[#2a221b]" />
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#d6bd7a]"
                style={{
                  left: `${minPercent}%`,
                  right: `${100 - maxPercent}%`,
                }}
              />
              <input
                type="range"
                min={PRICE_RANGE_LIMITS.min}
                max={PRICE_RANGE_LIMITS.max}
                step={PRICE_STEP}
                value={filters.priceRange.min}
                onChange={(event) =>
                  updatePriceRange({
                    ...filters.priceRange,
                    min: Math.min(Number(event.target.value), filters.priceRange.max - PRICE_STEP),
                  })
                }
                className="price-range-input z-30"
                aria-label="Giá thấp nhất"
              />
              <input
                type="range"
                min={PRICE_RANGE_LIMITS.min}
                max={PRICE_RANGE_LIMITS.max}
                step={PRICE_STEP}
                value={filters.priceRange.max}
                onChange={(event) =>
                  updatePriceRange({
                    ...filters.priceRange,
                    max: Math.max(Number(event.target.value), filters.priceRange.min + PRICE_STEP),
                  })
                }
                className="price-range-input z-20"
                aria-label="Giá cao nhất"
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-[#cfc4ad]/62">
              <span>{formatVND(PRICE_RANGE_LIMITS.min)}</span>
              <span>{formatVND(PRICE_RANGE_LIMITS.max)}</span>
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Hàm lượng vàng" open={openSections.material} onToggle={() => toggleSection("material")}>
        <div className="grid grid-cols-2 gap-2.5">
          {GOLD_KARAT_OPTIONS.map((option) => {
            const isSelected = filters.goldKarats.includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleGoldKarat(option.id)}
                className={`group min-h-20 border px-3 py-2.5 text-left transition ${
                  isSelected
                    ? "border-[#d6bd7a] bg-[#d6bd7a]/12 text-[#f7efe1]"
                    : "border-[#d6bd7a]/20 bg-black/20 text-[#cfc4ad]/72 hover:border-[#d6bd7a]/55 hover:text-[#f7efe1]"
                }`}
                aria-pressed={isSelected}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className={`grid h-4 w-4 shrink-0 place-items-center border ${isSelected ? "border-[#d6bd7a] bg-[#d6bd7a]" : "border-[#d6bd7a]/35"}`}>
                    {isSelected && <Check className="h-3 w-3 text-black" />}
                  </span>
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-[#cfc4ad]/62">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Trạng thái" open={openSections.status} onToggle={() => toggleSection("status")}>
        <button
          type="button"
          onClick={() => onChange({ ...filters, bestSellerOnly: !filters.bestSellerOnly })}
          className="group flex w-full cursor-pointer items-center gap-3 text-left"
        >
          <span className={`relative flex h-4 w-4 items-center justify-center border transition-colors ${filters.bestSellerOnly ? "border-[#d6bd7a] bg-[#d6bd7a]" : "border-[#d6bd7a]/35 group-hover:border-[#d6bd7a]"}`}>
            {filters.bestSellerOnly && <Check className="absolute h-3 w-3 text-black" />}
          </span>
          <span className={`text-sm transition-colors ${filters.bestSellerOnly ? "font-medium text-[#f7efe1]" : "text-[#cfc4ad]/72 group-hover:text-[#f7efe1]"}`}>
            Chỉ hiển thị sản phẩm bán chạy
          </span>
        </button>
      </FilterSection>

      <FilterSection title="Sắp xếp" open={openSections.sort} onToggle={() => toggleSection("sort")} last>
        <div className="space-y-2.5">
          {SORT_OPTIONS.map((option) => {
            const isSelected = filters.sort === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className="group flex w-full cursor-pointer items-center gap-3 text-left"
                onClick={() => onChange({ ...filters, sort: option.id })}
              >
                <span className={`relative flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-[#d6bd7a]" : "border-[#d6bd7a]/35 group-hover:border-[#d6bd7a]"}`}>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-[#d6bd7a]" />}
                </span>
                <span className={`text-sm transition-colors ${isSelected ? "font-medium text-[#f7efe1]" : "text-[#cfc4ad]/72 group-hover:text-[#f7efe1]"}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      <button
        type="button"
        onClick={clearFilters}
        className="luxury-button-outline mt-2 w-full px-4 py-3 text-xs font-bold"
      >
        Xóa bộ lọc
      </button>
    </aside>
  );
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
  last = false,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`${last ? "mb-5" : "mb-6 border-b border-[#d6bd7a]/18 pb-6"}`}>
      <button
        type="button"
        className="group mb-3 flex w-full items-center justify-between text-left"
        onClick={onToggle}
      >
        <h3 className="font-medium text-[#f7efe1] transition-colors group-hover:text-[#d6bd7a]">{title}</h3>
        {open ? <ChevronUp className="h-4 w-4 text-[#cfc4ad]/70" /> : <ChevronDown className="h-4 w-4 text-[#cfc4ad]/70" />}
      </button>
      {open && <div className="animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
}
