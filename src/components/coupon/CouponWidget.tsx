"use client";

import Link from "next/link";
import { Ticket, Trash2, X } from "lucide-react";
import { calculateCouponReturn, formatOdds } from "@/lib/odds";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { t } from "@/lib/i18n/en-IN";

export function CouponWidget() {
  const coupon = useStore((s) => s.coupon);
  const removeFromCoupon = useStore((s) => s.removeFromCoupon);
  const clearCoupon = useStore((s) => s.clearCoupon);
  const oddsFormat = useStore((s) => s.settings.oddsFormat);
  const [stake, setStake] = useState(100);

  if (coupon.length === 0) {
    return (
      <div className="bg-op-surface border border-op-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-op-text-muted mb-2">
          <Ticket size={18} />
          <span className="font-semibold text-sm text-op-text">{t.coupon.title}</span>
        </div>
        <p className="text-xs text-op-text-muted">{t.coupon.addHint}</p>
      </div>
    );
  }

  const { totalOdds, potentialWin } = calculateCouponReturn(coupon, stake);

  return (
    <div className="bg-op-surface border border-op-border rounded-lg overflow-hidden">
      <div className="bg-op-header text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Ticket size={16} />
          {t.coupon.title} ({coupon.length})
        </div>
        <button
          onClick={clearCoupon}
          className="text-white/70 hover:text-white text-xs flex items-center gap-1"
        >
          <Trash2 size={12} /> {t.coupon.clear}
        </button>
      </div>

      <ul className="divide-y divide-op-border max-h-64 overflow-y-auto">
        {coupon.map((sel) => (
          <li key={sel.matchId} className="px-4 py-2.5 text-sm relative group">
            <button
              onClick={() => removeFromCoupon(sel.matchId)}
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-op-text-muted hover:text-op-best"
            >
              <X size={14} />
            </button>
            <div className="text-xs text-op-text-muted pr-6">
              {sel.homeTeam} vs {sel.awayTeam}
            </div>
            <div className="flex items-center justify-between mt-0.5 pr-6">
              <span className="font-medium text-op-accent">{sel.outcome}</span>
              <span className="font-bold">{formatOdds(sel.odds, oddsFormat)}</span>
            </div>
            <div className="text-[10px] text-op-text-muted">{sel.bookmaker}</div>
          </li>
        ))}
      </ul>

      <div className="px-4 py-3 bg-op-row-alt border-t border-op-border space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-op-text-muted">{t.coupon.stake}:</label>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            className="flex-1 px-2 py-1 border border-op-border rounded text-sm"
            min={1}
          />
          <span className="text-xs">{t.coupon.currency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-op-text-muted">{t.coupon.totalOdds}</span>
          <span className="font-bold">{formatOdds(totalOdds, oddsFormat)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-op-text-muted">{t.coupon.potentialWin}</span>
          <span className="font-bold text-op-accent">
            {potentialWin.toFixed(2)} {t.coupon.currency}
          </span>
        </div>
        <Link
          href="/coupon"
          className="block w-full text-center bg-op-accent text-white py-2 rounded-md text-sm font-semibold hover:bg-op-header transition-colors"
        >
          {t.nav.myCoupon}
        </Link>
      </div>
    </div>
  );
}
