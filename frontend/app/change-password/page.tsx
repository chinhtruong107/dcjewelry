"use client";

import AuthFrame from "@/components/auth/AuthFrame";
import PasswordField from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ApiResponse = {
  message?: string;
  user?: Parameters<ReturnType<typeof useAuth>["updateUser"]>[0];
  errors?: Record<string, string[]>;
};

function getApiMessage(data: ApiResponse, fallback: string) {
  return data.message || Object.values(data.errors ?? {})[0]?.[0] || fallback;
}

export default function ChangePassword() {
  const router = useRouter();
  const { user, token, isAuthReady, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const passwordChecks = useMemo(
    () => [
      { label: "Tối thiểu 6 ký tự", passed: formData.password.length >= 6 },
      { label: "Khác mật khẩu tạm thời", passed: formData.password !== "" && formData.current_password !== formData.password },
      { label: "Xác nhận trùng khớp", passed: formData.password !== "" && formData.password === formData.password_confirmation },
    ],
    [formData.current_password, formData.password, formData.password_confirmation]
  );

  useEffect(() => {
    if (isAuthReady && !token) {
      router.replace("/login");
    }
  }, [isAuthReady, router, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password.length < 6) {
      setErrorMessage("Mật khẩu mới cần có ít nhất 6 ký tự.");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (formData.current_password === formData.password) {
      setErrorMessage("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (response.ok) {
        updateUser(data.user ?? { must_change_password: false });
        setSuccessMessage(data.message || "Đổi mật khẩu thành công.");
        window.setTimeout(() => router.push("/"), 900);
      } else {
        setErrorMessage(getApiMessage(data, "Chưa thể đổi mật khẩu."));
      }
    } catch {
      setErrorMessage("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame
      mode="change-password"
      bannerBadge="Xác nhận bảo mật"
      bannerTitle="Đặt mật khẩu mới trước khi tiếp tục."
      bannerDescription="Tài khoản đang dùng mật khẩu tạm thời. Sau bước này bạn có thể mua sắm, theo dõi đơn hàng và lưu sản phẩm yêu thích như bình thường."
    >
      <div className="flex w-full flex-col border border-[#d6bd7a]/25 bg-[#0b0908] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="border-b border-[#d6bd7a]/18 px-6 py-7 sm:px-8">
          <div className="inline-flex w-fit items-center gap-2 border border-[#d6bd7a]/30 bg-black/25 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d6bd7a]">
            <ShieldCheck className="h-3.5 w-3.5" />
            {user?.must_change_password ? "Yêu cầu đổi mật khẩu" : "Bảo mật tài khoản"}
          </div>
          <h1 className="mt-6 font-serif text-4xl font-light leading-tight text-[#f7efe1] sm:text-5xl">
            Đổi mật khẩu
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#cfc4ad]/78">
            Nhập mật khẩu tạm thời vừa nhận qua email, sau đó tạo mật khẩu mới cho tài khoản Đức Chính Jewelry.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="current_password" className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Mật khẩu tạm thời
              </label>
              <PasswordField
                id="current_password"
                name="current_password"
                value={formData.current_password}
                placeholder="Nhập mật khẩu trong email"
                showPassword={showCurrentPassword}
                onTogglePassword={() => setShowCurrentPassword((prev) => !prev)}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Mật khẩu mới
              </label>
              <PasswordField
                id="password"
                name="password"
                value={formData.password}
                placeholder="Tối thiểu 6 ký tự"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((prev) => !prev)}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password_confirmation" className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Xác nhận mật khẩu mới
              </label>
              <PasswordField
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                placeholder="Nhập lại mật khẩu mới"
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2 border border-[#d6bd7a]/15 bg-black/20 p-4">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-sm text-[#cfc4ad]/78">
                  <CheckCircle2 className={`h-4 w-4 ${check.passed ? "text-emerald-300" : "text-[#d6bd7a]/35"}`} />
                  <span>{check.label}</span>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !token}
              className="h-12 w-full rounded-none bg-[#d6bd7a] text-xs font-bold uppercase tracking-[0.18em] text-[#100d0b] shadow-none transition hover:bg-[#f4df9b]"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang đổi mật khẩu
                </>
              ) : (
                <>
                  Lưu mật khẩu mới
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-auto flex items-center gap-3 pt-8 text-xs leading-5 text-[#cfc4ad]/65">
            <KeyRound className="h-4 w-4 shrink-0 text-[#d6bd7a]" />
            Sau khi lưu, các phiên đăng nhập cũ sẽ được thu gọn để bảo vệ tài khoản.
          </div>
        </div>
      </div>
    </AuthFrame>
  );
}
