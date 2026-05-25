"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingDown,
  Shield,
  Star,
  Ticket,
  Radio,
  Settings,
  Search,
  Menu,
  X,
  Users,
  LogIn,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { OddvoralLogo } from "@/components/brand/OddvoralLogo";
import { SiteClock } from "@/components/layout/SiteClock";
import { UserAvatar } from "@/components/user/UserAvatar";
import { t } from "@/lib/i18n/en-IN";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: t.nav.home },
  { href: "/community", label: t.nav.community, icon: Users },
  { href: "/live", label: t.nav.live, icon: Radio },
  { href: "/dropping-odds", label: t.nav.droppingOdds, icon: TrendingDown },
  { href: "/sure-bets", label: t.nav.sureBets, icon: Shield },
  { href: "/value-bets", label: t.nav.valueBets, icon: Star },
  { href: "/coupon", label: t.nav.myCoupon, icon: Ticket },
];

export function Header() {
  const pathname = usePathname();
  const couponCount = useStore((s) => s.coupon.length);
  const currentUser = useAuthStore((s) => s.getCurrentUser());
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-op-header text-white shadow-md sticky top-0 z-50">
      <div className="bg-op-header-dark">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs text-white/80">
          <span>{t.nav.compareOdds}</span>
          <div className="flex items-center gap-4">
            <Link href="/community" className="hover:text-white transition-colors">
              {t.nav.tipsters}
            </Link>
            <SiteClock />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <OddvoralLogo size={40} priority />
            <div>
              <span className="font-bold text-xl tracking-tight">{t.siteName}</span>
              <span className="text-white/60 text-xs block -mt-0.5">{t.siteTagline}</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {Icon && <Icon size={15} />}
                  {item.label}
                  {item.href === "/coupon" && couponCount > 0 && (
                    <span className="ml-0.5 bg-op-drop text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {couponCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {currentUser ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-md"
                >
                  <UserAvatar
                    name={currentUser.displayName}
                    color={currentUser.avatarColor}
                    size="sm"
                  />
                  <span className="text-sm font-medium max-w-[80px] truncate">
                    {currentUser.displayName}
                  </span>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white text-op-text rounded-lg shadow-xl border border-op-border z-50 py-1 text-sm">
                      <Link
                        href={`/user/${currentUser.username}`}
                        className="block px-4 py-2 hover:bg-op-row-hover"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/coupon"
                        className="block px-4 py-2 hover:bg-op-row-hover"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t.nav.myCoupon}
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 hover:bg-op-row-hover"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t.nav.settings}
                      </Link>
                      <hr className="my-1 border-op-border" />
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={14} /> {t.nav.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-md text-sm font-medium"
              >
                <LogIn size={16} /> {t.nav.login}
              </Link>
            )}

            <Link
              href="/settings"
              className="hidden md:flex p-2 hover:bg-white/10 rounded-md transition-colors"
            >
              <Settings size={20} />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-md"
              aria-label={t.nav.menu}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-3">
            <input
              type="search"
              placeholder={t.nav.searchPlaceholder}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              autoFocus
            />
          </div>
        )}
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-white/10 px-4 py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm",
                pathname === item.href ? "bg-white/20" : "hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          ))}
          {!currentUser && (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm mt-1 bg-white/15"
            >
              {t.nav.login}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
