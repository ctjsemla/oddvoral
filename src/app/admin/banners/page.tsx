"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/AdminShell";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { PROMO_BANNERS, PROMO_CTR } from "@/data/promo-banners";
import {
  buildAnalyticsReport,
  formatCount,
  formatPct,
} from "@/lib/admin/analytics";
import { resolvePreset, type DatePresetId, type DateRange } from "@/lib/admin/date-range";
import { countTrackedClicks, useAdminStore } from "@/store/adminStore";

export default function AdminBannersPage() {
  const [preset, setPreset] = useState<DatePresetId>("last90");
  const [range, setRange] = useState<DateRange>(() => resolvePreset("last90"));
  const bannerClicks = useAdminStore((s) => s.bannerClicks);
  const getClicksInRange = useAdminStore((s) => s.getClicksInRange);

  const report = useMemo(() => buildAnalyticsReport(range), [range]);
  const tracked = useMemo(
    () => getClicksInRange(range.start, range.end),
    [getClicksInRange, range, bannerClicks]
  );

  const maxClicks = Math.max(...report.bannerClicks.map((b) => b.clicks), 1);

  return (
    <AdminShell>
      <div className="p-6 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banner Clicks</h1>
            <p className="text-sm text-gray-500 mt-1">
              Melbet · 1xBet · 22Bet outbound clicks ({formatPct(PROMO_CTR)} of sessions)
            </p>
          </div>
          <DateRangePicker
            value={range}
            preset={preset}
            onChange={(r, p) => {
              setRange(r);
              setPreset(p);
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-1">
            <p className="text-xs text-gray-500 uppercase">Total promo clicks</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatCount(report.totalBannerClicks)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              from {formatCount(report.totalSessions)} sessions
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-1">
            <p className="text-xs text-gray-500 uppercase">Live tracked</p>
            <p className="text-3xl font-bold text-op-accent mt-1">{tracked.length}</p>
            <p className="text-xs text-gray-400 mt-1">real clicks from homepage banners</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-1">
            <p className="text-xs text-gray-500 uppercase">Avg. CTR</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatPct(PROMO_CTR)}</p>
            <p className="text-xs text-gray-400 mt-1">~168K promo clicks per 2.4M visits</p>
          </div>
        </div>

        <div className="space-y-4">
          {PROMO_BANNERS.map((banner) => {
            const metric = report.bannerClicks.find((b) => b.id === banner.id)!;
            const live = countTrackedClicks(tracked, banner.id);
            return (
              <article
                key={banner.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="w-32 h-14 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        banner.cardInner === "dark" ? "bg-black" : "bg-white"
                      }`}
                    >
                      <Image
                        src={banner.image}
                        alt={banner.alt}
                        width={120}
                        height={40}
                        className={
                          banner.logoClassName ?? "h-8 w-auto object-contain"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <h2 className="font-bold text-lg text-gray-900">{banner.alt}</h2>
                    <p className="text-xs text-gray-400 truncate">{banner.href}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums text-gray-900">
                      {metric.clicks.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-500">modelled clicks</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3 text-sm mb-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-400">Share</p>
                    <p className="font-semibold">{formatPct(metric.share)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-400">CTR</p>
                    <p className="font-semibold">{formatPct(metric.ctr)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-400">Live tracked</p>
                    <p className="font-semibold text-op-accent">{live}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] uppercase text-gray-400">Claim + logo</p>
                    <p className="font-semibold">both tracked</p>
                  </div>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-op-accent rounded-full transition-all"
                    style={{ width: `${(metric.clicks / maxClicks) * 100}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Model uses OddsPortal-scale session volumes. Banner clicks = sessions ×{" "}
          {formatPct(PROMO_CTR)} × partner share. Live tracked counts increment when
          users click homepage promo banners.
        </p>
      </div>
    </AdminShell>
  );
}
