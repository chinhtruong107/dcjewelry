"use client";

import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordField({
  id,
  name,
  value,
  placeholder,
  showPassword,
  onTogglePassword,
  onChange,
}: PasswordFieldProps) {
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d6bd7a]" />
      <Input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="h-12 rounded-none border-[#d6bd7a]/25 bg-black/25 pl-11 pr-12 text-[#f7efe1] shadow-none placeholder:text-[#cfc4ad]/45 hover:border-[#d6bd7a]/45 focus-visible:border-[#d6bd7a] focus-visible:ring-[#d6bd7a]/25"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={onTogglePassword}
        className="absolute inset-y-0 right-2 flex w-9 items-center justify-center text-[#cfc4ad]/70 transition-colors hover:text-[#d6bd7a]"
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
