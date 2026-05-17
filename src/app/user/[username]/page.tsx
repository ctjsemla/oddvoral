"use client";

import { use, useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { BulletinBar } from "@/components/layout/BulletinBar";
import { UserAvatar } from "@/components/user/UserAvatar";
import { PredictionCard } from "@/components/community/PredictionCard";
import { SettledCouponCard } from "@/components/community/SettledCouponCard";
import { getProfileByUsername } from "@/lib/community";
import { useCommunityData } from "@/hooks/useCommunityData";
import { getPredictionsByUser, getCouponsByUser } from "@/data/community";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { locale, t } from "@/lib/i18n/en-IN";
import { UserPlus, UserMinus, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const user = getProfileByUsername(username);
  const [tab, setTab] = useState<"predictions" | "coupons" | "stats">("predictions");
  const { predictions: allPreds, coupons: allCoupons } = useCommunityData();
  const currentUser = useAuthStore((s) => s.getCurrentUser());
  const toggleFollow = useAuthStore((s) => s.toggleFollow);
  const isFollowing = useAuthStore((s) => s.isFollowing(user?.id ?? ""));

  const predictions = useMemo(
    () => (user ? getPredictionsByUser(allPreds, user.id) : []),
    [user, allPreds]
  );
  const coupons = useMemo(
    () => (user ? getCouponsByUser(allCoupons, user.id) : []),
    [user, allCoupons]
  );

  if (!user) notFound();

  const isOwnProfile = currentUser?.username === user.username;
  const winRate = Math.round(
    (user.stats.won / Math.max(user.stats.won + user.stats.lost, 1)) * 100
  );

  return (
    <MainLayout showCoupon={false}>
      <BulletinBar />
      <div className="bg-op-surface border border-op-border rounded-xl overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-r from-op-header to-op-accent" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <UserAvatar
              name={user.displayName}
              color={user.avatarColor}
              size="lg"
              verified={user.isVerified}
              pro={user.isPro}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <p className="text-op-text-muted">@{user.username}</p>
              <p className="text-sm mt-2 max-w-xl">{user.bio}</p>
              <div className="flex gap-4 mt-2 text-xs text-op-text-muted">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {user.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {format(new Date(user.joinedAt), "MMMM yyyy", { locale })}
                </span>
              </div>
            </div>
            {!isOwnProfile && user.id.startsWith("u-") && (
              <button
                onClick={() => toggleFollow(user.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border",
                  isFollowing
                    ? "border-op-border"
                    : "bg-op-accent text-white border-op-accent"
                )}
              >
                {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                {isFollowing ? t.community.unfollow : t.community.follow}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            {[
              { label: "Yield", value: `+${user.stats.yield}%`, highlight: true },
              { label: t.community.winRate, value: `${winRate}%` },
              { label: t.community.predictions, value: predictions.length },
              { label: t.community.won, value: user.stats.won, color: "text-green-600" },
              { label: t.community.couponArchive, value: coupons.length },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-op-row-alt rounded-lg p-3 text-center border border-op-border"
              >
                <p className="text-xs text-op-text-muted">{s.label}</p>
                <p
                  className={cn(
                    "text-lg font-bold",
                    s.highlight && "text-op-accent",
                    s.color
                  )}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 border-b border-op-border">
        {(
          [
            ["predictions", `${t.community.tips} (${predictions.length})`],
            ["coupons", `${t.community.couponArchive} (${coupons.length})`],
            ["stats", t.community.stats],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              tab === id ? "border-op-accent text-op-accent" : "text-op-text-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "predictions" && (
        <div className="space-y-4 max-w-3xl">
          {predictions.map((p) => (
            <PredictionCard key={p.id} prediction={p} />
          ))}
        </div>
      )}

      {tab === "coupons" && (
        <div className="space-y-4 max-w-3xl">
          {coupons.map((c) => (
            <SettledCouponCard key={c.id} coupon={c} />
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="bg-op-surface border border-op-border rounded-lg p-6 max-w-md space-y-2 text-sm">
          <p>
            <span className="text-op-text-muted">{t.community.avgOdds}:</span>{" "}
            <strong>{user.stats.avgOdds.toFixed(2)}</strong>
          </p>
          <p>
            <span className="text-op-text-muted">{t.community.won} coupons:</span>{" "}
            <strong>{user.stats.couponsWon}</strong>
          </p>
          <p>
            <span className="text-op-text-muted">{t.community.streak}:</span>{" "}
            <strong>{user.stats.streak}🔥</strong>
          </p>
        </div>
      )}
    </MainLayout>
  );
}
