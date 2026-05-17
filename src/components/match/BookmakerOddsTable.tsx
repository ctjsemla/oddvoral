"use client";

import { getBookmaker } from "@/data/bookmakers";
import { OddsCell } from "@/components/odds/OddsCell";
import { useStore } from "@/store/useStore";
import type { Market, Match } from "@/types";
import { t } from "@/lib/i18n/en-IN";

export function BookmakerOddsTable({
  match,
  market,
}: {
  match: Match;
  market: Market;
}) {
  const enabledBookmakers = useStore((s) => s.settings.enabledBookmakers);
  const filtered = market.odds.filter((o) =>
    enabledBookmakers.includes(o.bookmakerId)
  );

  const couponBase = {
    matchId: match.id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 border-b border-op-border text-xs text-op-text-muted">
            <th className="px-4 py-2 text-left">Bookmaker</th>
            {market.type === "1x2" && (
              <>
                <th className="px-2 py-2 text-center w-20">1</th>
                <th className="px-2 py-2 text-center w-20">X</th>
                <th className="px-2 py-2 text-center w-20">2</th>
              </>
            )}
            {market.type === "ou25" && (
              <>
                <th className="px-2 py-2 text-center w-20">{t.markets.over}</th>
                <th className="px-2 py-2 text-center w-20">{t.markets.under}</th>
              </>
            )}
            {market.type === "btts" && (
              <>
                <th className="px-2 py-2 text-center w-20">{t.markets.yes}</th>
                <th className="px-2 py-2 text-center w-20">{t.markets.no}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry) => {
            const bm = getBookmaker(entry.bookmakerId);
            return (
              <tr
                key={entry.bookmakerId}
                className="border-b border-op-border hover:bg-op-row-hover"
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: bm.color }}
                    >
                      {bm.logo}
                    </span>
                    <span className="font-medium">{bm.name}</span>
                  </div>
                </td>
                {market.type === "1x2" && (
                  <>
                    <OddsCell
                      value={entry.home}
                      isBest={entry.isBest}
                      dropped={entry.dropped}
                      previous={entry.previous}
                      matchInfo={couponBase}
                      outcome={match.homeTeam}
                      bookmaker={bm.name}
                      market={market.label}
                    />
                    <OddsCell
                      value={entry.draw}
                      isBest={entry.isBest}
                      matchInfo={couponBase}
                      outcome={t.match.draw}
                      bookmaker={bm.name}
                      market={market.label}
                    />
                    <OddsCell
                      value={entry.away}
                      isBest={entry.isBest}
                      matchInfo={couponBase}
                      outcome={match.awayTeam}
                      bookmaker={bm.name}
                      market={market.label}
                    />
                  </>
                )}
                {market.type === "ou25" && (
                  <>
                    <OddsCell
                      value={entry.over}
                      isBest={entry.isBest}
                      matchInfo={couponBase}
                      outcome={`${t.markets.over} 2.5`}
                      bookmaker={bm.name}
                      market={market.label}
                    />
                    <OddsCell
                      value={entry.under}
                      isBest={entry.isBest}
                      matchInfo={couponBase}
                      outcome={`${t.markets.under} 2.5`}
                      bookmaker={bm.name}
                      market={market.label}
                    />
                  </>
                )}
                {market.type === "btts" && (
                  <>
                    <OddsCell
                      value={entry.yes}
                      isBest={entry.isBest}
                      matchInfo={couponBase}
                      outcome={t.markets.yes}
                      bookmaker={bm.name}
                      market={market.label}
                    />
                    <OddsCell
                      value={entry.no}
                      isBest={entry.isBest}
                      matchInfo={couponBase}
                      outcome={t.markets.no}
                      bookmaker={bm.name}
                      market={market.label}
                    />
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
