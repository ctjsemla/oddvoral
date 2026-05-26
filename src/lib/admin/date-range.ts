export interface DateRange {
  start: Date;
  end: Date;
}

export type DatePresetId =
  | "custom"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "last7"
  | "lastWeek"
  | "last28"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "last90"
  | "quarterToDate"
  | "thisYear"
  | "lastYear";

export interface DatePreset {
  id: DatePresetId;
  label: string;
}

export const DATE_PRESETS: DatePreset[] = [
  { id: "custom", label: "Custom" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "thisWeek", label: "This week (Sun – Today)" },
  { id: "last7", label: "Last 7 days" },
  { id: "lastWeek", label: "Last week (Sun – Sat)" },
  { id: "last28", label: "Last 28 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "last90", label: "Last 90 days" },
  { id: "quarterToDate", label: "Quarter to date" },
  { id: "thisYear", label: "This year (Jan – Today)" },
  { id: "lastYear", label: "Last calendar year" },
];

/** Site reporting anchor — matches GA-style default in brief. */
export const REPORTING_END = new Date(2026, 4, 25); // 25 May 2026

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeekSun(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export function resolvePreset(
  preset: DatePresetId,
  anchor: Date = REPORTING_END
): DateRange {
  const end = endOfDay(anchor);
  const today = startOfDay(anchor);

  switch (preset) {
    case "today":
      return { start: today, end };
    case "yesterday": {
      const y = addDays(today, -1);
      return { start: y, end: endOfDay(y) };
    }
    case "thisWeek":
      return { start: startOfWeekSun(today), end };
    case "last7":
      return { start: addDays(today, -6), end };
    case "lastWeek": {
      const lastSat = addDays(startOfWeekSun(today), -1);
      const lastSun = addDays(startOfWeekSun(today), -7);
      return { start: lastSun, end: endOfDay(lastSat) };
    }
    case "last28":
      return { start: addDays(today, -27), end };
    case "last30":
      return { start: addDays(today, -29), end };
    case "thisMonth":
      return { start: new Date(today.getFullYear(), today.getMonth(), 1), end };
    case "lastMonth": {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: first, end: endOfDay(last) };
    }
    case "last90":
      return { start: addDays(today, -89), end };
    case "quarterToDate": {
      const qMonth = Math.floor(today.getMonth() / 3) * 3;
      return { start: new Date(today.getFullYear(), qMonth, 1), end };
    }
    case "thisYear":
      return { start: new Date(today.getFullYear(), 0, 1), end };
    case "lastYear": {
      const y = today.getFullYear() - 1;
      return {
        start: new Date(y, 0, 1),
        end: endOfDay(new Date(y, 11, 31)),
      };
    }
    default:
      return { start: addDays(today, -89), end };
  }
}

export function formatRangeLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function eachDay(range: DateRange): Date[] {
  const days: Date[] = [];
  const cur = startOfDay(range.start);
  const last = startOfDay(range.end);
  while (cur <= last) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
