"use client";

import AuthFrame from "@/components/auth/AuthFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ApiResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

function getApiMessage(data: ApiResponse, fallback: string) {
  return data.message || Object.values(data.errors ?? {})[0]?.[0] || fallback;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok) {
        setSuccessMessage(
          data.message || "Đức Chính Jewelry đã gửi mật khẩu mới đến email của bạn. Vui lòng kiểm tra hộp thư."
        );
      } else {
        setErrorMessage(getApiMessage(data, "Chưa thể gửi email khôi phục mật khẩu."));
      }
    } catch {
      setErrorMessage("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame
      mode="forgot"
      bannerBadge="Khôi phục tài khoản"
      bannerTitle="Lấy lại quyền truy cập Đức Chính Jewelry thật nhanh."
      bannerDescription="Đức Chính Jewelry sẽ gửi mật khẩu tạm thời đến email tài khoản, sau đó yêu cầu bạn đổi mật khẩu mới khi đăng nhập."
    >
      <div className="flex w-full flex-col border border-[#d6bd7a]/25 bg-[#0b0908] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="border-b border-[#d6bd7a]/18 px-6 py-7 sm:px-8">
          <div className="inline-flex w-fit items-center gap-2 border border-[#d6bd7a]/30 bg-black/25 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d6bd7a]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Bảo mật tài khoản
          </div>
          <h1 className="mt-6 font-serif text-4xl font-light leading-tight text-[#f7efe1] sm:text-5xl">
            Quên mật khẩu
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#cfc4ad]/78">
            Nhập đúng email đã đăng ký để nhận mật khẩu tạm thời từ Đức Chính Jewelry.
          </p>
        </div>

        <div className="flex flex-1 flex-col px-6 py-7 sm:px-8">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 border border-emerald-400/30 bg-emerald-950/25 px-4 py-3 text-sm font-medium text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d6bd7a]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="dinhv4662@gmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-none border-[#d6bd7a]/25 bg-black/25 pl-11 text-[#f7efe1] shadow-none placeholder:text-[#cfc4ad]/45 hover:border-[#d6bd7a]/45 focus-visible:border-[#d6bd7a] focus-visible:ring-[#d6bd7a]/25"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-12 w-full rounded-none bg-[#d6bd7a] text-xs font-bold uppercase tracking-[0.18em] text-[#100d0b] shadow-none transition hover:bg-[#f4df9b]"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang gửi email
                </>
              ) : (
                <>
                  Gửi mật khẩu mới
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-auto pt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#d6bd7a] transition hover:text-[#f4df9b]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </AuthFrame>
  );
}
