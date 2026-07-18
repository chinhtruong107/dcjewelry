"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import AuthBanner from "./AuthBanner";

interface AuthFrameProps {
  children: ReactNode;
  bannerBadge: string;
  bannerTitle: string;
  bannerDescription: string;
  mode: "login" | "register" | "forgot" | "change-password";
}

export default function AuthFrame({
  children,
  bannerBadge,
  bannerTitle,
  bannerDescription,
  mode,
}: AuthFrameProps) {
  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#f5f0e7] text-[#28171a]">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1500px] flex-col px-3 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-6 flex items-center justify-between border-b border-[#28171a]/12 bg-transparent px-1 py-4">
          <Link href="/" className="dc-brand">
            <span className="dc-monogram"><span>DC</span></span>
            <span className="dc-wordmark"><strong>Đức Chính</strong><small>Jewelry</small></span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f5e61] transition hover:text-[#7a2130]"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid flex-1 grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(340px,500px)_minmax(0,1fr)]"
        >
          <section className="flex min-h-[620px]">{children}</section>

          <AuthBanner
            badge={bannerBadge}
            title={bannerTitle}
            description={bannerDescription}
          />
        </motion.div>
      </div>
    </div>
  );
}
