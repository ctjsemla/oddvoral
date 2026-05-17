"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BulletinBar } from "@/components/layout/BulletinBar";
import { PredictionCard } from "@/components/community/PredictionCard";
import { SettledCouponCard } from "@/components/community/SettledCouponCard";
import { UserAvatar } from "@/components/user/UserAvatar";
import { getLeaderboard } from "@/data/users";
import { useCommunityData } from "@/hooks/useCommunityData";
import { useAuthStore, type AuthState } from "@/store/authStore";
import { Users, Trophy, Ticket, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n/en-IN";

type Tab = "predictions" | "coupons" | "leaderboard";

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>("predictions");
  const { predictions, coupons } = useCommunityData();
  const following = useAuthStore((s: AuthState) => s.following);
  const leaderboard = getLeaderboard(8);

  const followingPreds = following.length
    ? predictions.filter((p) => following.includes(p.userId))
    : predictions;

  const TABS = [
    { id: "predictions" as Tab, label: t.community.tips, icon: TrendingUp, count: predictions.length },
    { id: "coupons" as Tab, label: t.community.couponArchive, icon: Ticket, count: coupons.length },
    { id: "leaderboard" as Tab, label: t.community.leaderboard, icon: Trophy },
  ];

  return (
    <MainLayout showCoupon={false}>
      <BulletinBar />
      <div className="flex items-center gap-3 mb-4">
        <Users size={24} className="text-op-accent" />
        <div>
          <h1 className="text-2xl font-bold">{t.community.title}</h1>
          <p className="text-sm text-op-text-muted">{t.community.subtitle}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap border-b border-op-border pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px",
                tab === t.id
                  ? "border-op-accent text-op-accent"
                  : "border-transparent text-op-text-muted"
              )}
            >
              <Icon size={16} />
              {t.label}
              {t.count !== undefined && (
                <span className="text-xs bg-op-row-alt px-1.5 rounded-full">{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "predictions" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {followingPreds.slice(0, 40).map((p) => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
          <aside className="space-y-4">
            <div className="bg-op-surface border border-op-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3">{t.community.topTipsters}</h3>
              <ul className="space-y-3">
                {leaderboard.slice(0, 5).map((u, i) => (
                  <li key={u.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-4">{i + 1}</span>
                    <Link
                      href={`/user/${u.username}`}
                      className="flex items-center gap-2 flex-1 hover:text-op-accent"
                    >
                      <UserAvatar
                        name={u.displayName}
                        color={u.avatarColor}
                        size="sm"
                      />
                      <span className="text-sm font-medium">{u.displayName}</span>
                    </Link>
                    <span className="text-xs text-green-600 font-semibold">+{u.stats.yield}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}

      {tab === "coupons" && (
        <div className="space-y-4 max-w-3xl">
          {coupons.map((c) => (
            <SettledCouponCard key={c.id} coupon={c} />
          ))}
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="bg-op-surface border border-op-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-xs text-op-text-muted uppercase">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">{t.community.user}</th>
                <th className="px-4 py-2 text-center">{t.community.predictions}</th>
                <th className="px-4 py-2 text-center">Yield</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, i) => (
                <tr key={u.id} className="border-t hover:bg-op-row-hover">
                  <td className="px-4 py-3 font-bold">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/user/${u.username}`}
                      className="flex items-center gap-2 hover:text-op-accent"
                    >
                      <UserAvatar name={u.displayName} color={u.avatarColor} size="sm" />
                      {u.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">{u.stats.predictions}</td>
                  <td className="px-4 py-3 text-center font-bold text-op-accent">
                    +{u.stats.yield}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}
