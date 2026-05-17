"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatOdds } from "@/lib/odds";
import { useStore } from "@/store/useStore";
import type { Match } from "@/types";
import { t } from "@/lib/i18n/en-IN";

interface SharePredictionFormProps {
  match: Match;
  defaultOutcome?: string;
  defaultOdds?: number;
}

export function SharePredictionForm({
  match,
  defaultOutcome,
  defaultOdds,
}: SharePredictionFormProps) {
  const currentUser = useAuthStore((s) => s.getCurrentUser());
  const addPrediction = useAuthStore((s) => s.addPrediction);
  const oddsFormat = useStore((s) => s.settings.oddsFormat);

  const market = match.markets[0];
  const outcomes = [
    { label: match.homeTeam, odds: market.odds[0]?.home ?? 2.1 },
    { label: t.match.draw, odds: market.odds[0]?.draw ?? 3.3 },
    { label: match.awayTeam, odds: market.odds[0]?.away ?? 3.0 },
  ];

  const [outcome, setOutcome] = useState(defaultOutcome ?? outcomes[0].label);
  const [odds, setOdds] = useState(defaultOdds ?? outcomes[0].odds);
  const [stake, setStake] = useState(100);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!currentUser) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
        {t.auth.loginRequired}{" "}
        <Link href="/login" className="text-op-accent font-semibold hover:underline">
          {t.auth.signIn}
        </Link>{" "}
        or{" "}
        <Link href="/register" className="text-op-accent font-semibold hover:underline">
          {t.auth.signUp}
        </Link>
        .
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        {t.auth.shareSuccess}
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPrediction({
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.league,
      sport: match.sport,
      startTime: match.startTime,
      market: market.label,
      outcome,
      odds,
      stake,
      comment,
    });
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-op-surface border border-op-border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm">{t.match.shareTip}</h3>

      <div className="grid grid-cols-3 gap-2">
        {outcomes.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => {
              setOutcome(o.label);
              setOdds(o.odds);
            }}
            className={`p-2 rounded-md border text-xs transition-colors ${
              outcome === o.label
                ? "border-op-accent bg-green-50 text-op-accent font-semibold"
                : "border-op-border hover:bg-op-row-hover"
            }`}
          >
            <span className="block truncate">{o.label}</span>
            <span className="font-bold">{formatOdds(o.odds, oddsFormat)}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-op-text-muted">{t.match.odds}</label>
          <input
            type="number"
            step="0.01"
            value={odds}
            onChange={(e) => setOdds(Number(e.target.value))}
            className="w-full mt-0.5 px-3 py-2 border border-op-border rounded-md text-sm"
            required
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-op-text-muted">{t.coupon.stakeLabel}</label>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            className="w-full mt-0.5 px-3 py-2 border border-op-border rounded-md text-sm"
            min={1}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-op-text-muted">{t.community.comment}</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Why did you pick this tip?"
          className="w-full mt-0.5 px-3 py-2 border border-op-border rounded-md text-sm resize-none h-20"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-op-accent text-white py-2.5 rounded-md font-semibold hover:bg-op-header transition-colors"
      >
        <Send size={16} />
        {t.match.shareTip}
      </button>
    </form>
  );
}
