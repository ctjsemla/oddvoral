"use client";

import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { ToolsLayout, useBulletinTools } from "@/components/pages/ToolsContent";
import { getBookmaker } from "@/data/bookmakers";
import { formatMatchTime } from "@/lib/utils";
import { t } from "@/lib/i18n/en-IN";

export default function DroppingOddsPage() {
  const { drops } = useBulletinTools();

  return (
    <ToolsLayout>
      <div className="flex items-center gap-3 mb-4">
        <TrendingDown size={24} className="text-op-drop" />
        <div>
          <h1 className="text-2xl font-bold">{t.tools.droppingTitle}</h1>
          <p className="text-sm text-op-text-muted">{t.tools.droppingDesc}</p>
        </div>
      </div>

      <div className="bg-op-surface border border-op-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-op-border text-xs text-op-text-muted uppercase">
              <th className="px-4 py-2 text-left">{t.tools.match}</th>
              <th className="px-4 py-2 text-left">{t.tools.selection}</th>
              <th className="px-4 py-2 text-center">{t.tools.previous}</th>
              <th className="px-4 py-2 text-center">{t.tools.now}</th>
              <th className="px-4 py-2 text-center">{t.tools.drop}</th>
              <th className="px-4 py-2 text-left">{t.tools.bookmaker}</th>
            </tr>
          </thead>
          <tbody>
            {drops.map((drop) => {
              const bm = getBookmaker(drop.bookmaker);
              return (
                <tr
                  key={drop.id}
                  className="border-b border-op-border hover:bg-op-row-hover"
                >
                  <td className="px-4 py-3">
                    <Link href={`/match/${drop.match.id}`} className="hover:text-op-accent">
                      <div className="font-medium">
                        {drop.match.homeTeam} - {drop.match.awayTeam}
                      </div>
                      <div className="text-xs text-op-text-muted">
                        {drop.match.league} · {formatMatchTime(drop.match.startTime)}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{drop.outcome}</td>
                  <td className="px-4 py-3 text-center line-through text-op-text-muted">
                    {drop.from.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{drop.to.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-orange-100 text-op-drop font-bold px-2 py-0.5 rounded text-xs">
                      -{drop.dropPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{bm.name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ToolsLayout>
  );
}
