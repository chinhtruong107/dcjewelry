"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { fixVietnameseText, formatVND, productImageUrl } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Languages, LogOut, Menu, Search, ShoppingBag, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const cartCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const categorySuggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    const categories = Array.from(new Set(products.map((product) => fixVietnameseText(product.category)).filter(Boolean))) as string[];
    return categories.filter((category) => category.toLowerCase().includes(normalizedQuery)).slice(0, 3);
  }, [normalizedQuery, products]);
  const productSuggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return products.filter((product) => product.name.toLowerCase().includes(normalizedQuery) || fixVietnameseText(product.description).toLowerCase().includes(normalizedQuery)).slice(0, 4);
  }, [normalizedQuery, products]);
  const hasSearchSuggestions = normalizedQuery.length > 0 && (categorySuggestions.length > 0 || productSuggestions.length > 0);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    fetch("/api/products").then(async (response) => (response.ok ? response.json() : [])).then((items: Product[]) => setProducts(items)).catch(() => setProducts([]));
  }, []);
  useEffect(() => setIsMobileOpen(false), [pathname]);

  const toggleMobileMenu = useCallback(() => setIsMobileOpen((prev) => !prev), []);
  const closeMobileMenu = useCallback(() => setIsMobileOpen(false), []);
  const isActivePath = (path: string) => pathname === path;
  const navItems = [
    { href: "/category/day-chuyen", label: t("Dây chuyền") },
    { href: "/category/bong-tai", label: t("Bông tai") },
    { href: "/category/vong-tay", label: t("Vòng tay") },
    { href: "/contact", label: t("Liên hệ") },
  ];

  return (
    <header className={`sticky top-0 z-50 border-b border-[#2b171a]/10 bg-[#f8f4ed]/95 text-[#28171a] transition-shadow duration-300 backdrop-blur-xl ${isScrolled ? "shadow-[0_12px_35px_rgba(48,25,28,0.08)]" : ""}`}>
      <div className="border-b border-[#2b171a]/10 bg-[#7a2130] px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.26em] text-[#fff9ef]">
        {t("Miễn phí tư vấn · Hotline 0389794445")}
      </div>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-7 lg:px-10">
        <div className="grid min-h-[76px] grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <nav className="hidden items-center gap-6 lg:flex" aria-label={t("Điều hướng chính")}>
            {navItems.slice(0, 3).map(({ href, label }) => (
              <Link key={href} href={href} className={`relative py-7 text-[10px] font-bold uppercase tracking-[0.18em] transition after:absolute after:inset-x-0 after:bottom-5 after:h-px after:origin-left after:bg-[#7a2130] after:transition-transform ${isActivePath(href) ? "text-[#7a2130] after:scale-x-100" : "text-[#5f4c50] after:scale-x-0 hover:text-[#7a2130] hover:after:scale-x-100"}`}>{label}</Link>
            ))}
          </nav>

          <Link href="/" aria-label={t("Đức Chính Jewelry - Trang chủ")} className="justify-self-start text-center lg:justify-self-center">
            <span className="block font-serif text-[1.65rem] leading-none tracking-[-0.03em] text-[#28171a]">Đức Chính</span>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.42em] text-[#7a2130]">Jewelry</span>
          </Link>

          <div className="flex items-center justify-end gap-1.5">
            <div
              className="hidden h-9 items-center rounded-full border border-[#28171a]/15 bg-[#fffdf9]/75 p-0.5 md:flex"
              role="group"
              aria-label={language === "vi" ? "Chọn ngôn ngữ" : "Choose language"}
              data-no-translate
            >
              {(["vi", "en"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  aria-pressed={language === option}
                  className={`grid h-7 min-w-8 place-items-center rounded-full px-2 text-[9px] font-bold uppercase tracking-[0.12em] transition ${
                    language === option
                      ? "bg-[#7a2130] text-[#fffaf2] shadow-sm"
                      : "text-[#6f5d60] hover:text-[#7a2130]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full px-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#28171a] transition hover:bg-[#7a2130]/8 hover:text-[#7a2130] md:hidden"
              aria-label={language === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}
              data-no-translate
            >
              <Languages className="h-4 w-4" />
              {language}
            </button>
            <button onClick={() => setIsSearchOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-full text-[#28171a] transition hover:bg-[#7a2130]/8 hover:text-[#7a2130]" aria-label={t("Tìm kiếm")}><Search className="h-[18px] w-[18px]" /></button>
            <Link href={user ? "/profile" : "/login"} className="hidden h-10 items-center gap-2 rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#28171a] transition hover:bg-[#7a2130]/8 hover:text-[#7a2130] sm:flex">
              <UserIcon className="h-[17px] w-[17px]" /> {user ? user.name : t("Tài khoản")}
            </Link>
            {user && <button onClick={logout} className="hidden h-10 w-9 place-items-center text-[#715f62] hover:text-[#7a2130] sm:grid" title={t("Đăng xuất")}><LogOut className="h-4 w-4" /></button>}
            <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-[#28171a] transition hover:bg-[#7a2130]/8 hover:text-[#7a2130]" aria-label={t(`Giỏ hàng có ${cartCount} sản phẩm`)}>
              <ShoppingBag className="h-[19px] w-[19px]" />
              {cartCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#7a2130] px-1 text-[9px] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</span>}
            </Link>
            <button onClick={toggleMobileMenu} className="grid h-10 w-10 place-items-center rounded-full text-[#28171a] transition hover:bg-[#7a2130]/8 lg:hidden" aria-label={t(isMobileOpen ? "Đóng menu" : "Mở menu")} aria-expanded={isMobileOpen}>{isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="border-t border-[#28171a]/10 py-4">
            <form className="relative mx-auto max-w-3xl" onSubmit={handleSearch}>
              <Search className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a2130]" />
              <input type="search" placeholder={t("Tìm kiếm thiết kế, chất liệu...")} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-12 w-full border-0 border-b border-[#28171a]/30 bg-transparent pl-8 pr-4 text-sm text-[#28171a] outline-none placeholder:text-[#79686a]/60 focus:border-[#7a2130]" autoFocus />
              {hasSearchSuggestions && <SearchSuggestions categorySuggestions={categorySuggestions} productSuggestions={productSuggestions} onClose={() => { setSearchQuery(""); setIsSearchOpen(false); setIsMobileOpen(false); }} />}
            </form>
          </div>
        )}

        {isMobileOpen && (
          <nav className="border-t border-[#28171a]/10 py-4 lg:hidden" aria-label={t("Điều hướng di động")}>
            {navItems.map(({ href, label }, index) => <Link key={href} href={href} onClick={closeMobileMenu} className="flex items-center justify-between border-b border-[#28171a]/8 py-4 font-serif text-2xl text-[#28171a]"><span>{label}</span><span className="text-xs text-[#7a2130]">0{index + 1}</span></Link>)}
          </nav>
        )}
      </div>
    </header>
  );
}

function SearchSuggestions({ categorySuggestions, productSuggestions, onClose }: { categorySuggestions: string[]; productSuggestions: Product[]; onClose: () => void }) {
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 border border-[#28171a]/10 bg-[#fffdf9] p-4 shadow-[0_24px_60px_rgba(54,28,32,0.14)]">
      {categorySuggestions.length > 0 && <div className="mb-4"><p className="mb-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#7a2130]">Danh mục</p><div className="flex flex-wrap gap-2">{categorySuggestions.map((category) => <Link key={category} href={`/search?q=${encodeURIComponent(category)}`} onClick={onClose} className="border border-[#28171a]/15 px-3 py-2 text-xs text-[#4e3b3e] hover:border-[#7a2130]">{category}</Link>)}</div></div>}
      {productSuggestions.length > 0 && <div><p className="mb-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#7a2130]">Sản phẩm</p><div className="grid gap-2 sm:grid-cols-2">{productSuggestions.map((product) => <SearchProductSuggestion key={product.id} product={product} onClick={onClose} />)}</div></div>}
    </div>
  );
}

function SearchProductSuggestion({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <Link href={`/product/${product.id}`} onClick={onClick} className="flex items-center gap-3 p-2 transition hover:bg-[#f5eee6]">
      <Image src={productImageUrl(product.image)} alt={product.name} width={56} height={56} className="h-14 w-14 shrink-0 bg-[#f0e8dc] object-cover" />
      <div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-medium text-[#28171a]">{product.name}</p><p className="mt-1 text-xs text-[#7a2130]">{formatVND(product.price)}</p></div>
    </Link>
  );
}
