"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { ToolsLayout, useBulletinTools } from "@/components/pages/ToolsContent";
import { formatMatchTime } from "@/lib/utils";
import { t } from "@/lib/i18n/en-IN";

export default function ValueBetsPage() {
  const { value } = useBulletinTools();

  return (
    <ToolsLayout>
      <div className="flex items-center gap-3 mb-4">
        <Star size={24} className="text-op-value" />
        <div>
          <h1 className="text-2xl font-bold">{t.tools.valueTitle}</h1>
          <p className="text-sm text-op-text-muted">{t.tools.valueDesc}</p>
        </div>
      </div>

      <div className="bg-op-surface border border-op-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-xs text-op-text-muted uppercase">
              <th className="px-4 py-2 text-left">{t.tools.match}</th>
              <th className="px-4 py-2 text-left">{t.tools.selection}</th>
              <th className="px-4 py-2 text-center">{t.match.odds}</th>
              <th className="px-4 py-2 text-center">{t.tools.value}</th>
            </tr>
          </thead>
          <tbody>
            {value.map((vb) => (
              <tr key={vb.id} className="border-b hover:bg-op-row-hover">
                <td className="px-4 py-3">
                  <Link href={`/match/${vb.match.id}`} className="hover:text-op-accent font-medium">
                    {vb.match.homeTeam} - {vb.match.awayTeam}
                  </Link>
                  <div className="text-xs text-op-text-muted">
                    {formatMatchTime(vb.match.startTime)}
                  </div>
                </td>
                <td className="px-4 py-3">{vb.outcome}</td>
                <td className="px-4 py-3 text-center font-bold">{vb.odds.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-purple-100 text-op-value font-bold px-2 py-0.5 rounded text-xs">
                    +{vb.valuePercent}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolsLayout>
  );
}
