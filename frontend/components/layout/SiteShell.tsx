"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChatBox from "./ChatBox";
import Footer from "./Footer";
import Header from "./Header";
import LanguageDomBridge from "./LanguageDomBridge";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthReady } = useAuth();
  const { language } = useLanguage();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isCheckoutRoute = pathname === "/checkout";

  useEffect(() => {
    if (
      isAuthReady &&
      user?.must_change_password &&
      !isAdminRoute &&
      pathname !== "/change-password"
    ) {
      router.replace("/change-password");
    }
  }, [isAuthReady, isAdminRoute, pathname, router, user?.must_change_password]);

  useEffect(() => {
    document.documentElement.lang = isAdminRoute ? "vi" : language;
  }, [isAdminRoute, language]);

  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <LanguageDomBridge />
      <div className="site-editorial contents">
        <Header />
        <main className="flex-grow">{children}</main>
        {!isCheckoutRoute && <Footer />}
        {!isCheckoutRoute && <ChatBox />}
      </div>
    </>
  );
}
