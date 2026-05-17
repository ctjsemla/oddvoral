"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatOdds } from "@/lib/odds";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { getProfileUser } from "@/lib/community";
import type { SettledCoupon } from "@/types";
import { format } from "date-fns";
import { locale, t } from "@/lib/i18n/en-IN";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  won: { label: t.community.won, icon: CheckCircle2, class: "text-green-600 bg-green-50" },
  lost: { label: t.community.lost, icon: XCircle, class: "text-red-600 bg-red-50" },
  pending: { label: t.community.pending, icon: Clock, class: "text-amber-600 bg-amber-50" },
  cashout: { label: "Cashout", icon: CheckCircle2, class: "text-blue-600 bg-blue-50" },
};

export function SettledCouponCard({ coupon }: { coupon: SettledCoupon }) {
  const oddsFormat = useStore((s) => s.settings.oddsFormat);
  const user = getProfileUser(coupon.userId);
  const cfg = STATUS_CONFIG[coupon.status];
  const Icon = cfg.icon;

  if (!user) return null;

  return (
    <article className="bg-op-surface border border-op-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-op-border bg-op-row-alt">
        <Link
          href={`/user/${user.username}`}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <UserAvatar
            name={user.displayName}
            color={user.avatarColor}
            size="sm"
          />
          <div>
            <span className="text-sm font-semibold block">{user.displayName}</span>
            <p className="text-[10px] text-op-text-muted">{coupon.title}</p>
          </div>
        </Link>
        <span className={cn("flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full", cfg.class)}>
          <Icon size={14} />
          {cfg.label}
        </span>
      </div>

      <ul className="divide-y divide-op-border">
        {coupon.selections.map((sel, i) => (
          <li key={i} className="px-4 py-2.5 flex items-center justify-between text-sm">
            <div>
              <Link href={`/match/${sel.matchId}`} className="hover:text-op-accent font-medium">
                {sel.homeTeam} - {sel.awayTeam}
              </Link>
              <p className="text-xs text-op-text-muted">
                {sel.market}: <span className="text-op-accent">{sel.outcome}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold">{formatOdds(sel.odds, oddsFormat)}</span>
              {sel.result && (
                <span
                  className={cn(
                    "block text-[10px] font-semibold",
                    sel.result === "won" ? "text-green-600" : sel.result === "lost" ? "text-red-600" : "text-amber-600"
                  )}
                >
                  {sel.result === "won" ? "✓" : sel.result === "lost" ? "✗" : "…"}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="px-4 py-3 flex items-center justify-between text-sm border-t border-op-border bg-op-row-alt">
        <div className="text-xs text-op-text-muted">
          {format(new Date(coupon.settledAt), "dd MMM yyyy HH:mm", { locale })}
        </div>
        <div className="flex items-center gap-4">
          <span>
            <span className="text-op-text-muted">{t.match.odds}: </span>
            <span className="font-bold">{formatOdds(coupon.totalOdds, oddsFormat)}</span>
          </span>
          <span>
            <span className="text-op-text-muted">{t.coupon.stake}: </span>
            <span className="font-medium">
              {coupon.stake} {t.coupon.currency}
            </span>
          </span>
          <span
            className={cn(
              "font-bold",
              coupon.status === "won" ? "text-green-600" : "text-op-text"
            )}
          >
            {coupon.status === "won"
              ? `+${coupon.actualWin.toFixed(0)} ${t.coupon.currency}`
              : coupon.status === "lost"
                ? `-${coupon.stake} ${t.coupon.currency}`
                : `${coupon.potentialWin.toFixed(0)} ${t.coupon.currency}`}
          </span>
        </div>
      </div>
    </article>
  );
}
