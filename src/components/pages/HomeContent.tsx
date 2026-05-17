"use client";

import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { BulletinBar } from "@/components/layout/BulletinBar";
import { MatchTable } from "@/components/match/MatchTable";
import { MatchTableSkeleton } from "@/components/match/MatchTableSkeleton";
import { ToolCards } from "@/components/home/ToolCards";
import { CommunityPreview } from "@/components/home/CommunityPreview";
import { PromoBanners } from "@/components/home/PromoBanners";
import { RecentDroppingOdds } from "@/components/home/RecentDroppingOdds";
import { useBulletin } from "@/providers/BulletinProvider";
import { SPORTS } from "@/data/sports";
import { Radio } from "lucide-react";
import { buildDroppingOdds } from "@/lib/bulletin";
import { useMemo } from "react";
import { t } from "@/lib/i18n/en-IN";

export function HomeContent() {
  const { matches, loading, getLive, getPopular } = useBulletin();
  const live = getLive();
  const popular = getPopular(15);
  const topDrops = useMemo(() => buildDroppingOdds(matches).slice(0, 3), [matches]);

  return (
    <MainLayout>
      <BulletinBar />

      <div className="bg-gradient-to-r from-op-header to-op-accent rounded-xl text-white p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.home.title}</h1>
        <p className="text-white/80 text-sm md:text-base max-w-2xl">{t.home.subtitle}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {SPORTS.map((s) => (
            <Link
              key={s.id}
              href={`/sport/${s.id}`}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-sm transition-colors"
            >
              {s.icon} {s.name}
            </Link>
          ))}
        </div>
      </div>

      <ToolCards />

      <PromoBanners />
      <RecentDroppingOdds drops={topDrops} />

      {loading ? (
        <MatchTableSkeleton />
      ) : (
        <>
          {live.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Radio size={18} className="text-op-live" />
                <h2 className="font-bold text-lg">{t.home.liveMatches}</h2>
                <span className="text-xs bg-op-live text-white px-2 py-0.5 rounded-full font-bold">
                  {live.length}
                </span>
              </div>
              <MatchTable matches={live} groupByLeague={false} />
            </section>
          )}

          <section>
            <h2 className="font-bold text-lg mb-3">{t.home.todayBulletin}</h2>
            <MatchTable matches={popular} />
          </section>
        </>
      )}

      <CommunityPreview />
    </MainLayout>
  );
}
