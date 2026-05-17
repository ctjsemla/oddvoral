"use client";

import Link from "next/link";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatOdds } from "@/lib/odds";
import { formatMatchTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { getProfileUser } from "@/lib/community";
import type { Prediction } from "@/types";
import { t } from "@/lib/i18n/en-IN";

const STATUS_STYLES = {
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
  void: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS = {
  won: t.community.won,
  lost: t.community.lost,
  pending: t.community.pending,
  void: t.community.void,
};

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  const oddsFormat = useStore((s) => s.settings.oddsFormat);
  const likePrediction = useAuthStore((s) => s.likePrediction);
  const liked = useAuthStore((s) => s.likedPredictions.includes(prediction.id));
  const user = getProfileUser(prediction.userId);

  if (!user) return null;

  return (
    <article className="bg-op-surface border border-op-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex gap-3">
        <Link
          href={`/user/${user.username}`}
          className="shrink-0 hover:opacity-90 transition-opacity"
        >
          <UserAvatar
            name={user.displayName}
            color={user.avatarColor}
            verified={user.isVerified}
            pro={user.isPro}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/user/${user.username}`}
              className="font-semibold text-sm hover:text-op-accent"
            >
              {user.displayName}
            </Link>
            <span className="text-xs text-op-text-muted">@{user.username}</span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                STATUS_STYLES[prediction.status]
              )}
            >
              {STATUS_LABELS[prediction.status]}
            </span>
          </div>

          <Link
            href={`/match/${prediction.matchId}`}
            className="block mt-2 hover:text-op-accent"
          >
            <p className="font-medium text-sm">
              {prediction.homeTeam} vs {prediction.awayTeam}
            </p>
            <p className="text-xs text-op-text-muted">
              {prediction.league} · {formatMatchTime(prediction.startTime)}
              {prediction.resultScore && (
                <span className="ml-2 font-semibold">({prediction.resultScore})</span>
              )}
            </p>
          </Link>

          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="bg-op-row-alt px-2 py-1 rounded border border-op-border">
              <span className="text-op-text-muted text-xs">{prediction.market} · </span>
              <span className="font-semibold text-op-accent">{prediction.outcome}</span>
              <span className="ml-2 font-bold">{formatOdds(prediction.odds, oddsFormat)}</span>
            </span>
            <span className="text-xs text-op-text-muted">
              {prediction.stake} {t.coupon.currency}
            </span>
          </div>

          {prediction.comment && (
            <p className="mt-2 text-sm text-op-text leading-relaxed">{prediction.comment}</p>
          )}

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-op-border">
            <button
              onClick={() => likePrediction(prediction.id)}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                liked ? "text-op-accent" : "text-op-text-muted hover:text-op-accent"
              )}
            >
              <ThumbsUp size={14} className={liked ? "fill-current" : ""} />
              {prediction.likes + (liked ? 1 : 0)}
            </button>
            <span className="flex items-center gap-1 text-xs text-op-text-muted">
              <MessageCircle size={14} />
              {t.community.comment}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
