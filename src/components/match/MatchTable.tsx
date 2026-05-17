"use client";

import { Fragment } from "react";
import { MatchRow } from "./MatchRow";
import type { Match } from "@/types";
import { t } from "@/lib/i18n/en-IN";

interface MatchTableProps {
  matches: Match[];
  groupByLeague?: boolean;
  showLeague?: boolean;
}

export function MatchTable({
  matches,
  groupByLeague = true,
  showLeague = false,
}: MatchTableProps) {
  const grouped = groupByLeague
    ? matches.reduce<Record<string, Match[]>>((acc, m) => {
        const key = `${m.country} - ${m.league}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
        return acc;
      }, {})
    : { "": matches };

  return (
    <div className="bg-op-surface border border-op-border rounded-lg overflow-hidden">
      <p className="md:hidden px-3 py-2 text-[11px] text-op-text-muted border-b border-op-border bg-op-row-alt">
        {t.table.scrollHint}
      </p>
      <div className="relative md:static -mx-4 sm:mx-0">
        <div
          className="overflow-x-auto overscroll-x-contain touch-pan-x px-4 sm:px-0 [-webkit-overflow-scrolling:touch]"
          aria-label={t.table.scrollHint}
        >
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-op-border text-xs text-op-text-muted uppercase tracking-wide">
                <th className="w-8 px-3 py-2 shrink-0" />
                <th className="px-2 py-2 text-left w-16 shrink-0">{t.table.time}</th>
                <th className="px-2 py-2 text-left min-w-[10rem]">{t.table.match}</th>
                <th className="px-2 py-2 text-center w-[3.25rem] shrink-0">1</th>
                <th className="px-2 py-2 text-center w-[3.25rem] shrink-0">X</th>
                <th className="px-2 py-2 text-center w-[3.25rem] shrink-0">2</th>
                <th className="w-8 shrink-0" />
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([league, leagueMatches]) => (
                <Fragment key={league || "all"}>
                  {groupByLeague && league && (
                    <tr className="bg-op-row-alt">
                      <td
                        colSpan={7}
                        className="px-4 py-2 text-xs font-semibold text-op-accent border-b border-op-border"
                      >
                        {league}
                      </td>
                    </tr>
                  )}
                  {leagueMatches.map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      showLeague={showLeague}
                    />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-op-surface to-transparent md:hidden"
          aria-hidden
        />
      </div>
      {matches.length === 0 && (
        <div className="px-4 py-12 text-center text-op-text-muted">
          {t.table.noMatches}
        </div>
      )}
    </div>
  );
}
