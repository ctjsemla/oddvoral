import { PROMO_BANNERS, PROMO_CTR_DEFAULT } from "@/data/promo-banners";
import type { PromoBannerId } from "@/data/promo-banners";
import { eachDay, dayKey, type DateRange } from "@/lib/admin/date-range";

/**
 * Monthly visit targets (~2.4M avg). OddsPortal-scale, India-focused.
 * All derived metrics (sessions, countries, banner clicks) scale from these.
 */
const MONTHLY_VISITS: Record<string, number> = {
  "2026-01": 2_350_000,
  "2026-02": 2_320_000,
  "2026-03": 2_520_000,
  "2026-04": 2_400_000,
  "2026-05": 2_450_000,
};

const MONTHLY_VISITS_DEFAULT = 2_400_000;

/** Former OddsPortal EU core → single India bucket. */
const COUNTRIES = [
  { code: "IN", name: "India", share: 0.412, mobile: 0.78, desktop: 0.2, tablet: 0.02 },
  { code: "PK", name: "Pakistan", share: 0.142, mobile: 0.86, desktop: 0.13, tablet: 0.01 },
  { code: "BD", name: "Bangladesh", share: 0.118, mobile: 0.89, desktop: 0.1, tablet: 0.01 },
  { code: "MM", name: "Myanmar", share: 0.086, mobile: 0.84, desktop: 0.15, tablet: 0.01 },
  { code: "LK", name: "Sri Lanka", share: 0.064, mobile: 0.76, desktop: 0.22, tablet: 0.02 },
  { code: "NP", name: "Nepal", share: 0.048, mobile: 0.81, desktop: 0.18, tablet: 0.01 },
  { code: "BT", name: "Bhutan", share: 0.022, mobile: 0.72, desktop: 0.26, tablet: 0.02 },
  { code: "AF", name: "Afghanistan", share: 0.038, mobile: 0.79, desktop: 0.2, tablet: 0.01 },
  { code: "MV", name: "Maldives", share: 0.028, mobile: 0.74, desktop: 0.24, tablet: 0.02 },
  { code: "OTHER", name: "Other South Asia", share: 0.042, mobile: 0.8, desktop: 0.18, tablet: 0.02 },
] as const;

const CHANNELS = [
  { id: "direct", label: "Direct", share: 0.72 },
  { id: "organic", label: "Organic Search", share: 0.18 },
  { id: "referral", label: "Referral", share: 0.07 },
  { id: "social", label: "Social", share: 0.03 },
] as const;

function seededNoise(seed: string, amp = 1): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return ((Math.abs(h) % 1000) / 1000 - 0.5) * amp;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

function visitsForDay(d: Date): number {
  const y = d.getFullYear();
  const m = d.getMonth();
  const key = `${y}-${String(m + 1).padStart(2, "0")}`;
  const monthly = MONTHLY_VISITS[key] ?? MONTHLY_VISITS_DEFAULT;
  const dailyBase = monthly / daysInMonth(y, m);
  const weekendBoost = d.getDay() === 0 || d.getDay() === 6 ? 1.12 : 1;
  const noise = 1 + seededNoise(dayKey(d), 0.14);
  return Math.round(dailyBase * weekendBoost * noise);
}

export interface DailyMetric {
  date: string;
  visits: number;
  sessions: number;
  users: number;
}

export interface CountryMetric {
  code: string;
  name: string;
  visits: number;
  share: number;
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface DeviceMetric {
  device: "Mobile" | "Desktop" | "Tablet";
  visits: number;
  share: number;
}

export interface ChannelMetric {
  id: string;
  label: string;
  visits: number;
  share: number;
}

export interface BannerClickMetric {
  id: PromoBannerId;
  label: string;
  clicks: number;
  share: number;
  ctr: number;
}

export interface AnalyticsReport {
  range: DateRange;
  totalVisits: number;
  totalSessions: number;
  totalUsers: number;
  avgSessionDurationSec: number;
  bounceRate: number;
  /** Partner-outbound CTR for selected period (visits-based). */
  promoCtr: number;
  daily: DailyMetric[];
  countries: CountryMetric[];
  devices: DeviceMetric[];
  channels: ChannelMetric[];
  bannerClicks: BannerClickMetric[];
  totalBannerClicks: number;
}

/** Shorter ranges = slightly higher daily partner CTR. */
export function promoCtrForRange(range: DateRange): number {
  const days = eachDay(range).length;
  if (days <= 7) return 0.028;
  if (days <= 31) return 0.024;
  if (days <= 90) return 0.022;
  return PROMO_CTR_DEFAULT;
}

export function buildAnalyticsReport(range: DateRange): AnalyticsReport {
  const days = eachDay(range);
  const daily: DailyMetric[] = days.map((d) => {
    const visits = visitsForDay(d);
    return {
      date: dayKey(d),
      visits,
      sessions: Math.round(visits * 1.08),
      users: Math.round(visits * 0.86),
    };
  });

  const totalVisits = daily.reduce((s, d) => s + d.visits, 0);
  const totalSessions = daily.reduce((s, d) => s + d.sessions, 0);
  const totalUsers = daily.reduce((s, d) => s + d.users, 0);

  const countries: CountryMetric[] = COUNTRIES.map((c) => {
    const jitter = 1 + seededNoise(`${c.code}-${dayKey(range.start)}`, 0.06);
    const share = c.share * jitter;
    const visits = Math.round(totalVisits * share);
    return {
      code: c.code,
      name: c.name,
      visits,
      share: visits / totalVisits,
      mobile: c.mobile,
      desktop: c.desktop,
      tablet: c.tablet,
    };
  }).sort((a, b) => b.visits - a.visits);

  const norm = countries.reduce((s, c) => s + c.visits, 0);
  countries.forEach((c) => {
    c.share = c.visits / norm;
  });

  let mobileVisits = 0;
  let desktopVisits = 0;
  let tabletVisits = 0;
  for (const c of countries) {
    mobileVisits += Math.round(c.visits * c.mobile);
    desktopVisits += Math.round(c.visits * c.desktop);
    tabletVisits += Math.round(c.visits * c.tablet);
  }
  const deviceTotal = mobileVisits + desktopVisits + tabletVisits;
  const devices: DeviceMetric[] = [
    { device: "Mobile", visits: mobileVisits, share: mobileVisits / deviceTotal },
    { device: "Desktop", visits: desktopVisits, share: desktopVisits / deviceTotal },
    { device: "Tablet", visits: tabletVisits, share: tabletVisits / deviceTotal },
  ];

  const channels: ChannelMetric[] = CHANNELS.map((ch) => {
    const visits = Math.round(totalVisits * ch.share);
    return { ...ch, visits, share: ch.share };
  });

  const promoCtr = promoCtrForRange(range);
  const totalBannerClicks = Math.round(totalVisits * promoCtr);
  const bannerClicks: BannerClickMetric[] = PROMO_BANNERS.map((b) => {
    const clicks = Math.round(totalBannerClicks * b.clickShare);
    return {
      id: b.id,
      label: b.alt,
      clicks,
      share: b.clickShare,
      ctr: totalVisits > 0 ? clicks / totalVisits : 0,
    };
  });

  return {
    range,
    totalVisits,
    totalSessions,
    totalUsers,
    avgSessionDurationSec: 628,
    bounceRate: 0.382,
    promoCtr,
    daily,
    countries,
    devices,
    channels,
    bannerClicks,
    totalBannerClicks,
  };
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
