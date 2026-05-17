"use client";

import Link from "next/link";
import type { DroppingOdd } from "@/types";
import { t } from "@/lib/i18n/en-IN";

export function RecentDroppingOdds({ drops }: { drops: DroppingOdd[] }) {
  if (drops.length === 0) return null;

  return (
    <section className="bg-op-surface border border-op-border rounded-lg p-4">
      <h2 className="font-bold text-sm mb-2 text-op-drop">{t.home.recentDrops}</h2>
      <ul className="space-y-1 text-sm">
        {drops.map((d) => (
          <li key={d.id}>
            <Link href={`/match/${d.match.id}`} className="hover:text-op-accent">
              {d.match.homeTeam} - {d.match.awayTeam}: {d.outcome}{" "}
              <span className="text-op-drop font-semibold">-{d.dropPercent}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
