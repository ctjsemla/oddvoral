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
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 border-b border-op-border text-xs text-op-text-muted uppercase tracking-wide">
            <th className="w-8 px-3 py-2" />
            <th className="px-2 py-2 text-left w-20">{t.table.time}</th>
            <th className="px-2 py-2 text-left">{t.table.match}</th>
            <th className="px-2 py-2 text-center w-16">1</th>
            <th className="px-2 py-2 text-center w-16">X</th>
            <th className="px-2 py-2 text-center w-16">2</th>
            <th className="w-8" />
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
      {matches.length === 0 && (
        <div className="px-4 py-12 text-center text-op-text-muted">
          {t.table.noMatches}
        </div>
      )}
    </div>
  );
}
