"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, MousePointerClick, LogOut, LayoutDashboard } from "lucide-react";
import { OddvoralLogo } from "@/components/brand/OddvoralLogo";
import { useAdminStore } from "@/store/adminStore";
import { useAdminReady } from "@/hooks/useAdminReady";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/banners", label: "Banner Clicks", icon: MousePointerClick },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const ready = useAdminReady();
  const logout = useAdminStore((s) => s.logout);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) router.replace("/admin/login");
  }, [ready, isAuthenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-sm text-gray-500">
        Loading admin…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-sm text-gray-500">
        Redirecting to login…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f0f2f5]">
      <aside className="w-56 bg-[#1b5e20] text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <Link href="/admin/analytics" className="flex items-center gap-2">
            <OddvoralLogo size={32} />
            <div>
              <p className="font-bold text-sm leading-tight">Oddvoral</p>
              <p className="text-[10px] text-white/60">Admin</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:text-white rounded-md hover:bg-white/10"
          >
            <LayoutDashboard size={14} />
            View site
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/70 hover:text-white rounded-md hover:bg-white/10"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
