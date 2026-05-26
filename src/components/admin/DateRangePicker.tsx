"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  DATE_PRESETS,
  formatRangeLabel,
  resolvePreset,
  type DatePresetId,
  type DateRange,
  REPORTING_END,
} from "@/lib/admin/date-range";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange, preset: DatePresetId) => void;
  preset: DatePresetId;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inRange(d: Date, start: Date, end: Date): boolean {
  const t = d.getTime();
  return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(23, 59, 59, 999);
}

function MonthGrid({
  year,
  month,
  draft,
  onPick,
}: {
  year: number;
  month: number;
  draft: DateRange;
  onPick: (d: Date) => void;
}) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(year, month, d));

  return (
    <div className="min-w-[200px]">
      <p className="text-center text-sm font-semibold text-gray-700 mb-2">
        {MONTHS[month].slice(0, 3).toUpperCase()} {year}
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] text-gray-400 mb-1">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <span key={`e-${i}`} />;
          const isStart = sameDay(d, draft.start);
          const isEnd = sameDay(d, draft.end);
          const between =
            d > draft.start && d < draft.end;
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onPick(d)}
              className={cn(
                "h-8 w-8 mx-auto text-xs rounded-full transition-colors",
                between && "bg-blue-100 text-blue-800 rounded-none w-full mx-0",
                (isStart || isEnd) && "bg-blue-600 text-white font-semibold",
                !isStart && !isEnd && !between && "hover:bg-gray-100 text-gray-700"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({ value, onChange, preset }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(value);
  const [draftPreset, setDraftPreset] = useState<DatePresetId>(preset);
  const [viewMonth, setViewMonth] = useState(() => value.end.getMonth());
  const [viewYear, setViewYear] = useState(() => value.end.getFullYear());
  const [pickingEnd, setPickingEnd] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setDraftPreset(preset);
      setViewMonth(value.end.getMonth());
      setViewYear(value.end.getFullYear());
    }
  }, [open, value, preset]);

  const months = useMemo(() => {
    const m1 = { year: viewYear, month: viewMonth };
    const m2Month = viewMonth === 11 ? 0 : viewMonth + 1;
    const m2Year = viewMonth === 11 ? viewYear + 1 : viewYear;
    const m3Month = m2Month === 11 ? 0 : m2Month + 1;
    const m3Year = m2Month === 11 ? m2Year + 1 : m2Year;
    return [m1, { year: m2Year, month: m2Month }, { year: m3Year, month: m3Month }];
  }, [viewMonth, viewYear]);

  const pickDay = (d: Date) => {
    if (!pickingEnd) {
      setDraft({ start: d, end: d });
      setDraftPreset("custom");
      setPickingEnd(true);
    } else {
      if (d < draft.start) {
        setDraft({ start: d, end: draft.start });
      } else {
        setDraft({ start: draft.start, end: d });
      }
      setDraftPreset("custom");
      setPickingEnd(false);
    }
  };

  const applyPreset = (id: DatePresetId) => {
    if (id === "custom") {
      setDraftPreset("custom");
      return;
    }
    const r = resolvePreset(id, REPORTING_END);
    setDraft(r);
    setDraftPreset(id);
    setViewMonth(r.end.getMonth());
    setViewYear(r.end.getFullYear());
    setPickingEnd(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:border-gray-400 shadow-sm"
      >
        <Calendar size={16} className="text-gray-500" />
        {formatRangeLabel(value.start, value.end)}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 flex overflow-hidden min-w-[680px]">
            <div className="w-52 border-r border-gray-100 py-2 max-h-[420px] overflow-y-auto">
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm transition-colors",
                    draftPreset === p.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-4">
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-gray-400 font-medium">
                    Start date
                  </label>
                  <div className="mt-1 px-3 py-2 border-2 border-blue-500 rounded-md text-sm">
                    {draft.start.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Kolkata",
                    })}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-gray-400 font-medium">
                    End date
                  </label>
                  <div className="mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm">
                    {draft.end.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Kolkata",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 0) {
                      setViewMonth(11);
                      setViewYear((y) => y - 1);
                    } else setViewMonth((m) => m - 1);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 11) {
                      setViewMonth(0);
                      setViewYear((y) => y + 1);
                    } else setViewMonth((m) => m + 1);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {months.map((m) => (
                  <MonthGrid
                    key={`${m.year}-${m.month}`}
                    year={m.year}
                    month={m.month}
                    draft={draft}
                    onPick={pickDay}
                  />
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(draft, draftPreset);
                    setOpen(false);
                  }}
                  className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
