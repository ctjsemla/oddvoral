"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { calculateCouponReturn, formatOdds } from "@/lib/odds";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { Ticket, Trash2, X, Share2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n/en-IN";

export default function CouponPage() {
  const router = useRouter();
  const coupon = useStore((s) => s.coupon);
  const removeFromCoupon = useStore((s) => s.removeFromCoupon);
  const clearCoupon = useStore((s) => s.clearCoupon);
  const oddsFormat = useStore((s) => s.settings.oddsFormat);
  const currentUser = useAuthStore((s) => s.getCurrentUser());
  const settleCoupon = useAuthStore((s) => s.settleCouponFromSelections);
  const [stake, setStake] = useState(100);
  const [shared, setShared] = useState(false);

  const { totalOdds, potentialWin } = calculateCouponReturn(coupon, stake);

  const handleShare = () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    settleCoupon(
      coupon.map((c) => ({ ...c, result: "pending" as const })),
      stake,
      totalOdds
    );
    clearCoupon();
    setShared(true);
    setTimeout(() => router.push("/community"), 1500);
  };

  return (
    <MainLayout showSidebar={false} showCoupon={false}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Ticket size={24} className="text-op-accent" />
          <h1 className="text-2xl font-bold">{t.coupon.title}</h1>
        </div>
        {coupon.length > 0 && (
          <button
            onClick={clearCoupon}
            className="flex items-center gap-1 text-sm text-op-best hover:underline"
          >
            <Trash2 size={14} /> {t.coupon.clear}
          </button>
        )}
      </div>

      {coupon.length === 0 ? (
        <div className="bg-op-surface border border-op-border rounded-lg p-16 text-center">
          <Ticket size={48} className="mx-auto text-op-text-muted mb-4" />
          <p className="text-op-text-muted mb-4">{t.coupon.empty}</p>
          <Link
            href="/"
            className="inline-block bg-op-accent text-white px-6 py-2 rounded-md font-semibold hover:bg-op-header transition-colors"
          >
            {t.coupon.browse}
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-op-surface border border-op-border rounded-lg divide-y divide-op-border">
            {coupon.map((sel) => (
              <div key={sel.matchId} className="p-4 flex items-start justify-between group">
                <div>
                  <Link
                    href={`/match/${sel.matchId}`}
                    className="text-sm font-medium hover:text-op-accent"
                  >
                    {sel.homeTeam} vs {sel.awayTeam}
                  </Link>
                  <div className="text-op-accent font-semibold mt-1">{sel.outcome}</div>
                  <div className="text-xs text-op-text-muted mt-0.5">
                    {sel.market} · {sel.bookmaker}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">
                    {formatOdds(sel.odds, oddsFormat)}
                  </span>
                  <button
                    onClick={() => removeFromCoupon(sel.matchId)}
                    className="text-op-text-muted hover:text-op-best opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-op-surface border border-op-border rounded-lg p-6 h-fit sticky top-24">
            <h3 className="font-semibold mb-4">{t.coupon.summary}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-op-text-muted">{t.coupon.selections}</span>
                <span className="font-medium">{coupon.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-op-text-muted">{t.coupon.totalOdds}</span>
                <span className="font-bold text-lg">
                  {formatOdds(totalOdds, oddsFormat)}
                </span>
              </div>
              <div>
                <label className="text-op-text-muted block mb-1">{t.coupon.stakeLabel}</label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-op-border rounded-md"
                  min={1}
                />
              </div>
              <div className="flex justify-between pt-2 border-t border-op-border">
                <span className="font-medium">{t.coupon.potentialWin}</span>
                <span className="font-bold text-xl text-op-accent">
                  {potentialWin.toFixed(2)} {t.coupon.currency}
                </span>
              </div>
            </div>
            <button
              onClick={handleShare}
              disabled={shared}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-op-accent text-white py-3 rounded-md font-semibold hover:bg-op-header transition-colors disabled:opacity-60"
            >
              <Share2 size={16} />
              {shared ? t.coupon.shared : t.coupon.share}
            </button>
            <p className="text-[10px] text-op-text-muted text-center mt-3">
              {t.coupon.disclaimer}
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
