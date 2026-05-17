"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { ToolsLayout, useBulletinTools } from "@/components/pages/ToolsContent";
import { formatMatchTime } from "@/lib/utils";
import { t } from "@/lib/i18n/en-IN";

export default function SureBetsPage() {
  const { sure } = useBulletinTools();

  return (
    <ToolsLayout>
      <div className="flex items-center gap-3 mb-4">
        <Shield size={24} className="text-op-sure" />
        <div>
          <h1 className="text-2xl font-bold">{t.tools.sureTitle}</h1>
          <p className="text-sm text-op-text-muted">{t.tools.sureDesc}</p>
        </div>
      </div>

      <div className="space-y-4">
        {sure.map((bet) => (
          <div
            key={bet.id}
            className="bg-op-surface border border-op-border rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-op-border">
              <Link
                href={`/match/${bet.match.id}`}
                className="font-semibold hover:text-op-accent"
              >
                {bet.match.homeTeam} vs {bet.match.awayTeam}
              </Link>
              <span className="bg-op-sure text-white text-sm font-bold px-3 py-1 rounded-full">
                +{bet.profit}%
              </span>
            </div>
            <div className="p-4 text-xs text-op-text-muted">
              {bet.match.league} · {formatMatchTime(bet.match.startTime)}
            </div>
          </div>
        ))}
      </div>
    </ToolsLayout>
  );
}
