"use client";
import { SectionCard } from "./shared";

export default function SettingsView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Cài đặt</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Khu vực demo cho cấu hình quản trị.</p>
      </div>
      <SectionCard className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Tài khoản quản trị</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">admin</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Trạng thái hệ thống</p>
            <p className="mt-1 text-sm text-emerald-600">Đang hoạt động</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
