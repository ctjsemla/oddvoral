"use client";

import { useBulletin } from "@/providers/BulletinProvider";
import { RefreshCw, Radio, Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";
import { locale, t } from "@/lib/i18n/en-IN";

export function BulletinBar() {
  const { source, updatedAt, loading, refreshing, error, refresh, matches } =
    useBulletin();
  const liveCount = matches.filter((m) => m.status === "live").length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-op-surface border border-op-border rounded-lg text-xs">
      <div className="flex items-center gap-3">
        {source === "live" ? (
          <span className="flex items-center gap-1 text-green-700 font-semibold">
            <Wifi size={14} />
            {t.bulletin.live}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-700 font-semibold">
            <WifiOff size={14} />
            {t.bulletin.fallback}
          </span>
        )}
        {liveCount > 0 && (
          <span className="flex items-center gap-1 text-op-live font-bold">
            <Radio size={12} className="animate-pulse" />
            {liveCount} {t.bulletin.liveMatches}
          </span>
        )}
        <span className="text-op-text-muted">
          {matches.length} {t.bulletin.events}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {updatedAt && (
          <span className="text-op-text-muted">
            {t.bulletin.updated}:{" "}
            {format(new Date(updatedAt), "HH:mm:ss", { locale })}
          </span>
        )}
        {error && <span className="text-red-600">{error}</span>}
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="flex items-center gap-1 text-op-accent font-medium hover:underline disabled:opacity-50"
        >
          <RefreshCw
            size={12}
            className={loading || refreshing ? "animate-spin" : ""}
          />
          {t.bulletin.refresh}
        </button>
      </div>
    </div>
  );
}
