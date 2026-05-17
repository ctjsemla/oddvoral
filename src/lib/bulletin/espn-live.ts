import { BOOKMAKERS } from "@/data/bookmakers";
import { markBestOdds } from "@/lib/odds";
import { t } from "@/lib/i18n/en-IN";
import type { Match, Market, OddsEntry, Sport } from "@/types";

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const ESPN_FETCH_CACHE: RequestCache = "no-store";

const SCOREBOARDS: { sport: Sport; path: string }[] = [
  { sport: "football", path: "soccer/all/scoreboard" },
  { sport: "football", path: "soccer/uefa.champions/scoreboard" },
  { sport: "basketball", path: "basketball/nba/scoreboard" },
  { sport: "basketball", path: "basketball/wnba/scoreboard" },
  { sport: "hockey", path: "hockey/nhl/scoreboard" },
  { sport: "baseball", path: "baseball/mlb/scoreboard" },
  { sport: "tennis", path: "tennis/atp/scoreboard" },
  { sport: "tennis", path: "tennis/wta/scoreboard" },
];

interface EspnCompetitor {
  homeAway?: string;
  score?: string;
  team?: { displayName?: string; shortDisplayName?: string };
}

interface EspnEvent {
  id: string;
  date?: string;
  name?: string;
  shortName?: string;
  status?: {
    displayClock?: string;
    period?: number;
    type?: { state?: string; description?: string; shortDetail?: string };
  };
  competitions?: Array<{
    competitors?: EspnCompetitor[];
    venue?: { fullName?: string };
  }>;
  leagues?: Array<{ name?: string; abbreviation?: string }>;
}

function normalizeTeam(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function matchTeamKey(home: string, away: string): string {
  return `${normalizeTeam(home)}|${normalizeTeam(away)}`;
}

function parseLiveDetail(
  shortDetail?: string,
  description?: string,
  displayClock?: string
): string | undefined {
  const sd = (shortDetail ?? "").trim();
  const d = (description ?? "").trim();
  const clock = (displayClock ?? "").trim();

  if (/^HT$/i.test(sd) || /halftime/i.test(d)) return "HT";
  if (/^\d{1,2}:\d{2}/.test(clock)) return clock;
  if (/^Q\d$/i.test(sd)) return sd.toUpperCase();
  if (sd) return sd;

  if (/2nd|second half/i.test(d)) return "2H";
  if (/1st|first half/i.test(d)) return "1H";

  return undefined;
}

function parseEspnMinute(
  displayClock?: string,
  description?: string,
  shortDetail?: string
): number | undefined {
  const detail = parseLiveDetail(shortDetail, description, displayClock);
  if (detail === "HT") return 45;

  const clock = (displayClock ?? "").trim();
  if (clock.includes(":")) return undefined;

  const tick = clock.match(/^(\d{1,3})(?:\+(\d{1,2}))'?$/);
  if (tick) {
    const base = parseInt(tick[1], 10);
    const extra = tick[2] ? parseInt(tick[2], 10) : 0;
    return base + extra;
  }

  const d = (description ?? "").toLowerCase();
  if (d.includes("halftime")) return 45;

  return undefined;
}

function stableOdds(seed: string, base: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  const r = (Math.abs(h) % 1000) / 1000;
  return Math.round((base + (r - 0.5) * 0.2) * 100) / 100;
}

function buildMarkets(eventId: string, sport: Sport): Market[] {
  const twoWay = sport !== "football" && sport !== "handball";
  if (twoWay) {
    const entries: OddsEntry[] = BOOKMAKERS.slice(0, 8).map((bm, i) => ({
      bookmakerId: bm.id,
      home: stableOdds(`${eventId}-${bm.id}-h`, 1.85 + i * 0.02),
      away: stableOdds(`${eventId}-${bm.id}-a`, 1.95 + i * 0.02),
    }));
    return [{ type: "1x2", label: t.markets.winner, odds: markBestOdds(entries) as OddsEntry[] }];
  }
  const entries: OddsEntry[] = BOOKMAKERS.slice(0, 8).map((bm, i) => ({
    bookmakerId: bm.id,
    home: stableOdds(`${eventId}-${bm.id}-h`, 2.15),
    draw: stableOdds(`${eventId}-${bm.id}-d`, 3.35),
    away: stableOdds(`${eventId}-${bm.id}-a`, 3.1),
  }));
  return [{ type: "1x2", label: t.markets.oneXtwo, odds: markBestOdds(entries) as OddsEntry[] }];
}

function mapEspnEvent(ev: EspnEvent, sport: Sport): Match | null {
  const state = ev.status?.type?.state;
  if (state !== "in") return null;

  const comp = ev.competitions?.[0];
  const competitors = comp?.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  const homeTeam = home?.team?.displayName ?? home?.team?.shortDisplayName;
  const awayTeam = away?.team?.displayName ?? away?.team?.shortDisplayName;
  if (!homeTeam || !awayTeam) return null;

  const homeScore = home?.score != null ? parseInt(home.score, 10) : undefined;
  const awayScore = away?.score != null ? parseInt(away.score, 10) : undefined;
  const league = ev.leagues?.[0]?.name ?? sport;
  const startTime = ev.date ? new Date(ev.date).toISOString() : new Date().toISOString();

  return {
    id: `espn-${ev.id}`,
    sport,
    league,
    leagueSlug: league.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    country: "World",
    homeTeam,
    awayTeam,
    startTime,
    status: "live",
    homeScore: homeScore !== undefined && !Number.isNaN(homeScore) ? homeScore : undefined,
    awayScore: awayScore !== undefined && !Number.isNaN(awayScore) ? awayScore : undefined,
    minute: parseEspnMinute(
      ev.status?.displayClock,
      ev.status?.type?.description,
      ev.status?.type?.shortDetail
    ),
    liveDetail: parseLiveDetail(
      ev.status?.type?.shortDetail,
      ev.status?.type?.description,
      ev.status?.displayClock
    ),
    markets: buildMarkets(ev.id, sport),
    popularity: 100,
  };
}

async function fetchScoreboard(path: string): Promise<EspnEvent[]> {
  try {
    const res = await fetch(`${ESPN_BASE}/${path}`, {
      cache: ESPN_FETCH_CACHE,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { events?: EspnEvent[] };
    return data.events ?? [];
  } catch {
    return [];
  }
}

/** Authoritative in-play fixtures from ESPN public scoreboards (no API key). */
export async function fetchEspnLiveMatches(): Promise<Match[]> {
  const seenIds = new Set<string>();
  const matches: Match[] = [];

  const boards = await Promise.all(SCOREBOARDS.map((b) => fetchScoreboard(b.path)));

  for (let i = 0; i < boards.length; i++) {
    const sport = SCOREBOARDS[i].sport;
    for (const ev of boards[i]) {
      if (!ev.id || seenIds.has(ev.id)) continue;
      const m = mapEspnEvent(ev, sport);
      if (!m) continue;
      seenIds.add(ev.id);
      matches.push(m);
    }
  }

  return matches;
}

export function applyEspnLiveAuthority(matches: Match[], espnLive: Match[]): Match[] {
  const espnByKey = new Map(espnLive.map((m) => [matchTeamKey(m.homeTeam, m.awayTeam), m]));

  const corrected = matches.map((m) => {
    const key = matchTeamKey(m.homeTeam, m.awayTeam);
    const espn = espnByKey.get(key);

    if (espn) {
      return {
        ...espn,
        id: m.id.startsWith("live-") ? m.id : espn.id,
        markets: m.markets.length > 0 ? m.markets : espn.markets,
        league: m.league !== "football" && m.league.length > 2 ? m.league : espn.league,
        minute: espn.minute,
        liveDetail: espn.liveDetail,
      };
    }

    if (m.status === "live") {
      return { ...m, status: "finished" as const, minute: undefined };
    }

    return m;
  });

  const existingKeys = new Set(corrected.map((m) => matchTeamKey(m.homeTeam, m.awayTeam)));
  const onlyEspn = espnLive.filter(
    (m) => !existingKeys.has(matchTeamKey(m.homeTeam, m.awayTeam))
  );

  return [...onlyEspn, ...corrected];
}
