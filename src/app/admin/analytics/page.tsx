"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import {
  buildAnalyticsReport,
  formatCount,
  formatDuration,
  formatPct,
} from "@/lib/admin/analytics";
import { resolvePreset, type DatePresetId, type DateRange } from "@/lib/admin/date-range";

export default function AdminAnalyticsPage() {
  const [preset, setPreset] = useState<DatePresetId>("last90");
  const [range, setRange] = useState<DateRange>(() => resolvePreset("last90"));

  const report = useMemo(() => buildAnalyticsReport(range), [range]);

  const maxDaily = Math.max(...report.daily.map((d) => d.visits), 1);

  return (
    <AdminShell>
      <div className="p-6 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              India-focused traffic model · OddsPortal benchmark (Feb–Apr 2026)
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total visits", value: formatCount(report.totalVisits) },
            { label: "Sessions", value: formatCount(report.totalSessions) },
            { label: "Users", value: formatCount(report.totalUsers) },
            {
              label: "Avg. session",
              value: formatDuration(report.avgSessionDurationSec),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Visits over time</h2>
            <p className="text-xs text-gray-500 mb-4">Daily visits · Asia/Kolkata</p>
            <div className="flex items-end gap-px h-36 overflow-x-auto">
              {report.daily.map((d) => (
                <div
                  key={d.date}
                  className="flex flex-col items-center flex-1 min-w-[6px] group"
                  title={`${d.date}: ${d.visits.toLocaleString("en-IN")}`}
                >
                  <div
                    className="w-full bg-op-accent/80 rounded-t hover:bg-op-header transition-colors"
                    style={{ height: `${(d.visits / maxDaily) * 100}%`, minHeight: 2 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2">
              <span>{report.daily[0]?.date}</span>
              <span>{report.daily[report.daily.length - 1]?.date}</span>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Traffic channels</h2>
            <p className="text-xs text-gray-500 mb-4">Acquisition mix</p>
            <ul className="space-y-3">
              {report.channels.map((ch) => (
                <li key={ch.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{ch.label}</span>
                    <span className="font-medium tabular-nums">
                      {formatCount(ch.visits)}{" "}
                      <span className="text-gray-400 font-normal">
                        ({formatPct(ch.share)})
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${ch.share * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-4">
              Bounce rate: {formatPct(report.bounceRate)}
            </p>
          </section>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Countries</h2>
            <p className="text-xs text-gray-500 mb-4">
              EU benchmark merged into India · South Asia neighbours
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b">
                    <th className="pb-2 font-medium">Country</th>
                    <th className="pb-2 font-medium text-right">Visits</th>
                    <th className="pb-2 font-medium text-right">Share</th>
                    <th className="pb-2 font-medium text-right">Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {report.countries.map((c) => (
                    <tr key={c.code} className="border-b border-gray-50">
                      <td className="py-2.5 font-medium text-gray-800">{c.name}</td>
                      <td className="py-2.5 text-right tabular-nums">
                        {c.visits.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-gray-500">
                        {formatPct(c.share)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-gray-500">
                        {formatPct(c.mobile)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Devices</h2>
            <p className="text-xs text-gray-500 mb-4">All countries · weighted average</p>
            <ul className="space-y-4">
              {report.devices.map((d) => (
                <li key={d.device}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-800">{d.device}</span>
                    <span className="tabular-nums">
                      {formatCount(d.visits)}{" "}
                      <span className="text-gray-400">({formatPct(d.share)})</span>
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d.device === "Mobile"
                          ? "bg-emerald-500"
                          : d.device === "Desktop"
                            ? "bg-blue-500"
                            : "bg-amber-400"
                      }`}
                      style={{ width: `${d.share * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800">
              India mobile share ~78% — aligned with mobile-first South Asia betting
              traffic patterns.
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
