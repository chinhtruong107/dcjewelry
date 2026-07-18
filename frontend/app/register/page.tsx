"use client";

import AuthFrame from "@/components/auth/AuthFrame";
import PasswordField from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, ArrowRight, Mail, Phone, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password.length < 6) {
      setErrorMessage("Mật khẩu cần có ít nhất 6 ký tự.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        router.push("/");
      } else {
        setErrorMessage(data.message || "Đăng ký thất bại");
      }
    } catch {
      setErrorMessage("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame
      mode="register"
      bannerBadge="Đức Chính member"
      bannerTitle="Mở tài khoản cho bộ sưu tập riêng."
      bannerDescription="Tạo tài khoản để lưu thông tin giao hàng, theo dõi đơn hàng và nhận đặc quyền riêng cho các bộ sưu tập trang sức cao cấp."
    >
      <Card className="flex w-full flex-col rounded-none border border-[#d6bd7a]/25 bg-[#0d0b0a] text-[#f7efe1] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <CardHeader className="space-y-5 border-b border-[#d6bd7a]/16 px-7 pb-7 pt-8">
          <div className="inline-flex w-fit items-center gap-2 border border-[#d6bd7a]/35 bg-[#d6bd7a]/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#d6bd7a]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Đăng ký bảo mật
          </div>
          <div className="space-y-3">
            <CardTitle className="font-serif text-5xl font-light text-[#f7efe1]">
              Tạo tài khoản
            </CardTitle>
            <CardDescription className="text-sm leading-7 text-[#cfc4ad]/75">
              Lưu địa chỉ, nhận ưu đãi thành viên và mua những thiết kế trang sức yêu thích nhanh hơn.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 px-7 py-7">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Họ và tên
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d6bd7a]" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-12 rounded-none border-[#d6bd7a]/25 bg-black/25 pl-11 text-[#f7efe1] placeholder:text-[#cfc4ad]/45 focus-visible:ring-[#d6bd7a]/35"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 rounded-none border-[#d6bd7a]/25 bg-black/25 pl-11 text-[#f7efe1] placeholder:text-[#cfc4ad]/45 focus-visible:ring-[#d6bd7a]/35"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d6bd7a]" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="h-12 rounded-none border-[#d6bd7a]/25 bg-black/25 pl-11 text-[#f7efe1] placeholder:text-[#cfc4ad]/45 focus-visible:ring-[#d6bd7a]/35"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Mật khẩu
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
              <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Xác nhận mật khẩu
              </label>
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Nhập lại mật khẩu"
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
                onChange={handleInputChange}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-12 w-full rounded-none border border-[#d6bd7a] bg-[#d6bd7a] text-xs font-bold uppercase tracking-[0.22em] text-black shadow-none hover:bg-[#f4df9b] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                <>
                  Tạo tài khoản
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-[#d6bd7a]/16 px-7 py-6">
          <p className="text-sm text-[#cfc4ad]/75">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-[#d6bd7a] hover:text-[#f4df9b]">
              Đăng nhập ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthFrame>
  );
}
