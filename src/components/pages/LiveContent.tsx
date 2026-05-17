"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { BulletinBar } from "@/components/layout/BulletinBar";
import { MatchTable } from "@/components/match/MatchTable";
import { MatchTableSkeleton } from "@/components/match/MatchTableSkeleton";
import { useBulletin } from "@/providers/BulletinProvider";
import { Radio } from "lucide-react";
import { t } from "@/lib/i18n/en-IN";

export function LiveContent() {
  const { loading, getLive } = useBulletin();
  const live = getLive();

  return (
    <MainLayout>
      <BulletinBar />
      <div className="flex items-center gap-3 mb-4">
        <Radio size={24} className="text-op-live" />
        <div>
          <h1 className="text-2xl font-bold">{t.home.liveMatches}</h1>
          <p className="text-sm text-op-text-muted">{t.home.subtitle}</p>
        </div>
      </div>

      {loading ? (
        <MatchTableSkeleton />
      ) : live.length > 0 ? (
        <MatchTable matches={live} groupByLeague />
      ) : (
        <div className="bg-op-surface border border-op-border rounded-lg p-12 text-center text-op-text-muted">
          {t.bulletin.noLive}
        </div>
      )}
    </MainLayout>
  );
}
