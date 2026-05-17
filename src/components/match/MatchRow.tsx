"use client";

import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { OddsCell } from "@/components/odds/OddsCell";
import { formatMatchTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { Match, OddsEntry } from "@/types";
import { t } from "@/lib/i18n/en-IN";

function getBestOdds(odds: OddsEntry[]) {
  const home = Math.max(...odds.map((o) => o.home ?? 0).filter(Boolean));
  const draw = Math.max(...odds.map((o) => o.draw ?? 0).filter(Boolean));
  const away = Math.max(...odds.map((o) => o.away ?? 0).filter(Boolean));
  const homeEntry = odds.find((o) => o.home === home);
  const drawEntry = odds.find((o) => o.draw === draw);
  const awayEntry = odds.find((o) => o.away === away);
  return {
    home: { value: home, bookmaker: homeEntry?.bookmakerId },
    draw: { value: draw, bookmaker: drawEntry?.bookmakerId },
    away: { value: away, bookmaker: awayEntry?.bookmakerId },
  };
}

interface MatchRowProps {
  match: Match;
  showLeague?: boolean;
}

export function MatchRow({ match, showLeague }: MatchRowProps) {
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const enabledBookmakers = useStore((s) => s.settings.enabledBookmakers);
  const isFavorite = favorites.includes(match.id);

  const market = match.markets.find((m) => m.type === "1x2") ?? match.markets[0];
  const filtered = market.odds.filter((o) =>
    enabledBookmakers.includes(o.bookmakerId)
  );
  const best = getBestOdds(filtered);

  const couponBase = {
    matchId: match.id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
  };

  return (
    <tr className="border-b border-op-border hover:bg-op-row-hover transition-colors group">
      <td className="px-3 py-2 w-8">
        <button
          onClick={() => toggleFavorite(match.id)}
          className="text-op-text-muted hover:text-yellow-500"
          aria-label="Add to favourites"
        >
          <Star
            size={14}
            className={cn(isFavorite && "fill-yellow-400 text-yellow-400")}
          />
        </button>
      </td>

      <td className="px-2 py-2 text-xs text-op-text-muted whitespace-nowrap w-20">
        {match.status === "live" ? (
          <span className="text-op-live font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-op-live rounded-full animate-pulse" />
            {match.minute}&apos;
          </span>
        ) : match.status === "finished" ? (
          <span>{t.match.ft}</span>
        ) : (
          formatMatchTime(match.startTime)
        )}
      </td>

      <td className="px-2 py-2 min-w-[220px]">
        <Link href={`/match/${match.id}`} className="hover:text-op-accent">
          <div className="text-sm font-medium">
            <span>
              {match.homeTeam}
              {match.homeScore !== undefined && (
                <span className="ml-1.5 font-bold text-op-accent">{match.homeScore}</span>
              )}
            </span>
            <span className="text-op-text-muted mx-1">-</span>
            <span>
              {match.awayTeam}
              {match.awayScore !== undefined && (
                <span className="ml-1.5 font-bold">{match.awayScore}</span>
              )}
            </span>
          </div>
          {showLeague && (
            <span className="text-[11px] text-op-text-muted">
              {match.league} · {match.country}
            </span>
          )}
        </Link>
      </td>

      <OddsCell
        value={best.home.value || undefined}
        isBest
        matchInfo={couponBase}
        outcome={match.homeTeam}
        bookmaker={best.home.bookmaker ?? ""}
        market={market.label}
      />
      {best.draw.value > 0 ? (
        <OddsCell
          value={best.draw.value}
          isBest
          matchInfo={couponBase}
          outcome={t.match.draw}
          bookmaker={best.draw.bookmaker ?? ""}
          market={market.label}
        />
      ) : (
        <td className="px-2 py-2 text-center text-op-text-muted w-16">—</td>
      )}
      <OddsCell
        value={best.away.value || undefined}
        isBest
        matchInfo={couponBase}
        outcome={match.awayTeam}
        bookmaker={best.away.bookmaker ?? ""}
        market={market.label}
      />

      <td className="px-2 py-2 w-8">
        <Link
          href={`/match/${match.id}`}
          className="opacity-0 group-hover:opacity-100 text-op-text-muted hover:text-op-accent transition-opacity"
        >
          <ChevronRight size={16} />
        </Link>
      </td>
    </tr>
  );
}
