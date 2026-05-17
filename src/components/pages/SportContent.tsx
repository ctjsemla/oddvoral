"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { BulletinBar } from "@/components/layout/BulletinBar";
import { MatchTable } from "@/components/match/MatchTable";
import { MatchTableSkeleton } from "@/components/match/MatchTableSkeleton";
import { useBulletin } from "@/providers/BulletinProvider";
import { getSport } from "@/data/sports";
import type { Sport } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { t } from "@/lib/i18n/en-IN";

export function SportContent({ sport }: { sport: Sport }) {
  const sportInfo = getSport(sport)!;
  const { loading, getBySport } = useBulletin();
  const [filter, setFilter] = useState<"all" | "today" | "live">("all");

  let matches = getBySport(sport);
  if (filter === "live") matches = matches.filter((m) => m.status === "live");
  if (filter === "today") {
    const today = new Date().toDateString();
    matches = matches.filter(
      (m) => new Date(m.startTime).toDateString() === today
    );
  }

  return (
    <MainLayout activeSport={sport}>
      <BulletinBar />
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{sportInfo.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{sportInfo.name}</h1>
          <p className="text-sm text-op-text-muted">
            {loading ? t.sport.loading : t.sport.matchesCount(matches.length)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(
          [
            { id: "all", label: t.sport.all },
            { id: "today", label: t.sport.today },
            { id: "live", label: t.sport.live },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-1.5 text-sm border border-op-border rounded-md transition-colors",
              filter === f.id
                ? "bg-op-accent text-white border-op-accent"
                : "bg-op-surface hover:bg-op-row-hover"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <MatchTableSkeleton />
      ) : matches.length > 0 ? (
        <MatchTable matches={matches} />
      ) : (
        <p className="text-center text-op-text-muted py-12 bg-op-surface border border-op-border rounded-lg">
          {t.bulletin.noSport}
        </p>
      )}
    </MainLayout>
  );
}
