"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { BOOKMAKERS } from "@/data/bookmakers";
import { SPORTS } from "@/data/sports";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import type { OddsFormat } from "@/types";
import { Settings } from "lucide-react";
import { t } from "@/lib/i18n/en-IN";

const ODDS_FORMATS: { id: OddsFormat; label: string }[] = [
  { id: "decimal", label: t.settings.decimal },
  { id: "fractional", label: t.settings.fractional },
  { id: "american", label: t.settings.american },
];

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setOddsFormat = useStore((s) => s.setOddsFormat);
  const toggleBookmaker = useStore((s) => s.toggleBookmaker);
  const toggleFavoriteSport = useStore((s) => s.toggleFavoriteSport);

  return (
    <MainLayout showSidebar={false} showCoupon={false}>
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-op-accent" />
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        <section className="bg-op-surface border border-op-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">{t.settings.oddsFormat}</h2>
          <div className="space-y-2">
            {ODDS_FORMATS.map((fmt) => (
              <label
                key={fmt.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  settings.oddsFormat === fmt.id
                    ? "border-op-accent bg-green-50"
                    : "border-op-border hover:bg-op-row-hover"
                )}
              >
                <input
                  type="radio"
                  name="oddsFormat"
                  checked={settings.oddsFormat === fmt.id}
                  onChange={() => setOddsFormat(fmt.id)}
                  className="accent-op-accent"
                />
                <span className="text-sm">{fmt.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-op-surface border border-op-border rounded-lg p-6">
          <h2 className="font-semibold mb-1">{t.settings.bookmakers}</h2>
          <p className="text-xs text-op-text-muted mb-4">{t.settings.bookmakersDesc}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BOOKMAKERS.map((bm) => {
              const enabled = settings.enabledBookmakers.includes(bm.id);
              return (
                <button
                  key={bm.id}
                  onClick={() => toggleBookmaker(bm.id)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors",
                    enabled
                      ? "border-op-accent bg-green-50"
                      : "border-op-border opacity-50 hover:opacity-100"
                  )}
                >
                  <span
                    className="w-6 h-6 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bm.color }}
                  >
                    {bm.logo}
                  </span>
                  {bm.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-op-surface border border-op-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">{t.settings.favouriteSports}</h2>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((sport) => {
              const active = settings.favoriteSports.includes(sport.id);
              return (
                <button
                  key={sport.id}
                  onClick={() => toggleFavoriteSport(sport.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-colors",
                    active
                      ? "bg-op-accent text-white border-op-accent"
                      : "border-op-border hover:bg-op-row-hover"
                  )}
                >
                  {sport.icon} {sport.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-op-surface border border-op-border rounded-lg p-6">
          <h2 className="font-semibold mb-2">{t.settings.timezone}</h2>
          <p className="text-sm text-op-text-muted">{t.settings.timezoneValue}</p>
        </section>
      </div>
    </MainLayout>
  );
}
