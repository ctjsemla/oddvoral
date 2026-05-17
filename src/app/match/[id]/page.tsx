"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bell, Star, BarChart3, Users, Table2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BulletinBar } from "@/components/layout/BulletinBar";
import { BookmakerOddsTable } from "@/components/match/BookmakerOddsTable";
import { OddsHistoryChart } from "@/components/odds/OddsHistoryChart";
import { SharePredictionForm } from "@/components/community/SharePredictionForm";
import { PredictionCard } from "@/components/community/PredictionCard";
import { useBulletin } from "@/providers/BulletinProvider";
import { formatLiveClock } from "@/lib/live-clock";
import { getMatchOddsHistory } from "@/data/oddsHistory";
import { buildSeedPredictions } from "@/data/community";
import { formatMatchTime } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n/en-IN";

type DetailTab = "odds" | "history" | "predictions";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getMatch, matches, loading } = useBulletin();
  const match = getMatch(id);
  const [activeMarket, setActiveMarket] = useState(0);
  const [detailTab, setDetailTab] = useState<DetailTab>("odds");
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const addAlert = useStore((s) => s.addAlert);
  const userPredictions = useAuthStore((s) => s.userPredictions);

  const matchPredictions = useMemo(() => {
    if (!match) return [];
    const seed = buildSeedPredictions(matches).filter((p) => p.matchId === match.id);
    const user = userPredictions.filter((p) => p.matchId === match.id);
    return [...user, ...seed];
  }, [match, matches, userPredictions]);

  if (!loading && !match) notFound();
  if (!match) {
    return (
      <MainLayout showSidebar={false}>
        <div className="animate-pulse h-40 bg-op-surface rounded-lg" />
      </MainLayout>
    );
  }

  const isFavorite = favorites.includes(match.id);
  const oddsHistory = getMatchOddsHistory(match);

  const DETAIL_TABS = [
    { id: "odds" as DetailTab, label: t.match.odds, icon: Table2 },
    { id: "history" as DetailTab, label: t.match.oddsHistory, icon: BarChart3 },
    {
      id: "predictions" as DetailTab,
      label: t.match.predictions,
      icon: Users,
      count: matchPredictions.length,
    },
  ];

  return (
    <MainLayout showSidebar={false}>
      <BulletinBar />
      <Link
        href={`/sport/${match.sport}`}
        className="inline-flex items-center gap-1 text-sm text-op-accent hover:underline mb-4"
      >
        <ArrowLeft size={14} /> {match.league}
      </Link>

      <div className="bg-op-surface border border-op-border rounded-lg p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-op-text-muted mb-2">
              {match.country} · {formatMatchTime(match.startTime)}
              {match.status === "live" && (
                <span className="ml-2 text-op-live font-bold">
                  {t.match.live} {formatLiveClock(match)}
                </span>
              )}
              {match.status === "finished" && (
                <span className="ml-2 font-medium">{t.match.finished}</span>
              )}
            </p>
            <div className="flex items-center gap-6 text-xl md:text-2xl font-bold">
              <span>
                {match.homeTeam}
                {match.homeScore !== undefined && (
                  <span className="ml-2 text-op-accent">{match.homeScore}</span>
                )}
              </span>
              <span className="text-op-text-muted text-base font-normal">vs</span>
              <span>
                {match.awayTeam}
                {match.awayScore !== undefined && (
                  <span className="ml-2">{match.awayScore}</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleFavorite(match.id)}
              className="p-2 border border-op-border rounded-md hover:bg-op-row-hover"
            >
              <Star
                size={18}
                className={cn(isFavorite && "fill-yellow-400 text-yellow-400")}
              />
            </button>
            <button
              onClick={() =>
                addAlert({
                  matchId: match.id,
                  outcome: match.homeTeam,
                  targetOdds: 2.5,
                })
              }
              className="p-2 border border-op-border rounded-md hover:bg-op-row-hover"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 border-b border-op-border overflow-x-auto">
            {DETAIL_TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
                    detailTab === t.id
                      ? "border-op-accent text-op-accent"
                      : "border-transparent text-op-text-muted"
                  )}
                >
                  <Icon size={15} />
                  {t.label}
                  {"count" in t && t.count !== undefined && t.count > 0 && (
                    <span className="text-xs bg-op-accent text-white px-1.5 rounded-full">
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {detailTab === "odds" && (
            <div className="bg-op-surface border border-op-border rounded-lg overflow-hidden">
              <div className="flex border-b border-op-border overflow-x-auto">
                {match.markets.map((market, i) => (
                  <button
                    key={market.type}
                    onClick={() => setActiveMarket(i)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium whitespace-nowrap",
                      activeMarket === i
                        ? "bg-op-accent text-white"
                        : "hover:bg-op-row-hover text-op-text-muted"
                    )}
                  >
                    {market.label}
                  </button>
                ))}
              </div>
              <BookmakerOddsTable match={match} market={match.markets[activeMarket]} />
            </div>
          )}

          {detailTab === "history" && oddsHistory && (
            <div className="bg-op-surface border border-op-border rounded-lg">
              <OddsHistoryChart
                history={oddsHistory}
                homeLabel={match.homeTeam}
                awayLabel={match.awayTeam}
              />
            </div>
          )}

          {detailTab === "predictions" && (
            <div className="space-y-4">
              {matchPredictions.map((p) => (
                <PredictionCard key={p.id} prediction={p} />
              ))}
              {matchPredictions.length === 0 && (
                <p className="text-center text-op-text-muted py-8">
                  {t.match.noTips}
                </p>
              )}
            </div>
          )}
        </div>

        <aside>
          <SharePredictionForm match={match} />
        </aside>
      </div>
    </MainLayout>
  );
}
