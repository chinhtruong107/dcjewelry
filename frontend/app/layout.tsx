import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SiteShell from "@/components/layout/SiteShell";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcjewelry.duckdns.org"),
  title: {
    default: "Đức Chính Jewelry - Trang sức cao cấp",
    template: "%s | Đức Chính Jewelry",
  },
  description:
    "Đức Chính Jewelry tuyển chọn trang sức cao cấp với tinh thần chế tác tinh xảo, sang trọng và trường tồn.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Đức Chính Jewelry",
    title: "Đức Chính Jewelry - Trang sức cao cấp",
    description: "Trang sức cao cấp được tuyển chọn với tinh thần chế tác tinh xảo, sang trọng và trường tồn.",
    images: [{ url: "/images/duc-chinh-editorial-hero.png", alt: "Đức Chính Jewelry" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
        >
          <LanguageProvider>
            <AuthProvider>
              <FavoritesProvider>
                <CartProvider>
                  <SiteShell>{children}</SiteShell>
                </CartProvider>
              </FavoritesProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
