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

function linePath(values: number[], width: number, height: number, pad = 12): string {
  const n = values.length;
  if (n === 0) return "";
  const max = Math.max(...values, 1);
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);

  const xFor = (i: number) => pad + (i / Math.max(1, n - 1)) * innerW;
  const yFor = (v: number) => pad + (1 - v / max) * innerH;

  let d = `M ${xFor(0)} ${yFor(values[0])}`;
  for (let i = 1; i < n; i++) d += ` L ${xFor(i)} ${yFor(values[i])}`;
  return d;
}

function areaPath(values: number[], width: number, height: number, pad = 12): string {
  const n = values.length;
  if (n === 0) return "";
  const max = Math.max(...values, 1);
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);

  const xFor = (i: number) => pad + (i / Math.max(1, n - 1)) * innerW;
  const yFor = (v: number) => pad + (1 - v / max) * innerH;
  const baseY = pad + innerH;

  let d = `M ${xFor(0)} ${baseY} L ${xFor(0)} ${yFor(values[0])}`;
  for (let i = 1; i < n; i++) d += ` L ${xFor(i)} ${yFor(values[i])}`;
  d += ` L ${xFor(n - 1)} ${baseY} Z`;
  return d;
}

export default function AdminAnalyticsPage() {
  const [preset, setPreset] = useState<DatePresetId>("last90");
  const [range, setRange] = useState<DateRange>(() => resolvePreset("last90"));

  const report = useMemo(() => buildAnalyticsReport(range), [range]);

  const visits = report.daily.map((d) => d.visits);
  const maxDaily = Math.max(...visits, 1);
  const minDaily = Math.min(...visits, 0);
  const avgDaily = Math.round(report.totalVisits / Math.max(1, report.daily.length));

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
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <svg
                  viewBox="0 0 720 160"
                  className="w-full h-40"
                  role="img"
                  aria-label="Visits over time line chart"
                >
                  <defs>
                    <linearGradient id="ov-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(46 125 50)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="rgb(46 125 50)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* grid */}
                  {[0, 1, 2, 3].map((i) => (
                    <line
                      key={i}
                      x1={12}
                      x2={708}
                      y1={12 + (i * (160 - 24)) / 3}
                      y2={12 + (i * (160 - 24)) / 3}
                      stroke="rgb(229 231 235)"
                      strokeWidth="1"
                    />
                  ))}

                  <path d={areaPath(visits, 720, 160, 12)} fill="url(#ov-area)" />
                  <path
                    d={linePath(visits, 720, 160, 12)}
                    fill="none"
                    stroke="rgb(27 94 32)"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* hover points */}
                  {report.daily.map((d, i) => {
                    const x = 12 + (i / Math.max(1, report.daily.length - 1)) * (720 - 24);
                    const y = 12 + (1 - d.visits / maxDaily) * (160 - 24);
                    return (
                      <circle key={d.date} cx={x} cy={y} r={3} fill="rgb(67 160 71)">
                        <title>
                          {d.date}: {d.visits.toLocaleString("en-IN")} visits
                        </title>
                      </circle>
                    );
                  })}
                </svg>

                <div className="flex justify-between text-[10px] text-gray-400 -mt-1">
                  <span>{report.daily[0]?.date}</span>
                  <span>{report.daily[report.daily.length - 1]?.date}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-500">
              <div className="bg-gray-50 rounded-md px-2 py-1.5">
                <span className="text-gray-400">Min</span>{" "}
                <span className="font-medium tabular-nums">
                  {minDaily.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-gray-50 rounded-md px-2 py-1.5">
                <span className="text-gray-400">Avg</span>{" "}
                <span className="font-medium tabular-nums">
                  {avgDaily.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-gray-50 rounded-md px-2 py-1.5 text-right">
                <span className="text-gray-400">Max</span>{" "}
                <span className="font-medium tabular-nums">
                  {maxDaily.toLocaleString("en-IN")}
                </span>
              </div>
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
