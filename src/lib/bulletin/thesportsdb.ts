import { BOOKMAKERS } from "@/data/bookmakers";
import { ensureAllSportsCoverage } from "@/data/matches-fallback";
import { getTsdbSportNames } from "@/data/sports";
import { markBestOdds } from "@/lib/odds";
import { t } from "@/lib/i18n/en-IN";
import type { Match, Market, OddsEntry, MatchStatus, Sport } from "@/types";

const BASE = "https://www.thesportsdb.com/api/v1/json/3";
const REVALIDATE_SEC = 45;

const LEAGUE_IDS = [
  // Football
  "4328", "4335", "4331", "4332", "4334", "4329", "4480", "4481",
  // Tennis (Grand Slams + tours)
  "4517", "4516", "4515", "4514", "4464", "4510", "4511",
  // Basketball / NHL / MLB
  "4387", "4380", "4424", "4391",
  // Cricket / rugby / volleyball / handball
  "4460", "4410", "4551", "4562", "4479", "4398", "4400", "4370",
  "4553", "4563", "4570", "4580",
];

interface TsdbEvent {
  idEvent: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strLeague?: string;
  strCountry?: string;
  strSport?: string;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  strStatus?: string;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toIsoStartTime(raw?: string, dateEvent?: string, strTime?: string): string {
  const candidates = [
    raw,
    dateEvent && strTime ? `${dateEvent}T${strTime}` : undefined,
    dateEvent ? `${dateEvent}T12:00:00` : undefined,
  ].filter(Boolean) as string[];

  for (const value of candidates) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SEC } });
  if (!res.ok) throw new Error(`TSDB ${res.status}`);
  return res.json() as Promise<T>;
}

function parseStatus(strStatus?: string): { status: MatchStatus; minute?: number } {
  const s = (strStatus ?? "").toLowerCase();
  if (
    s.includes("finished") ||
    s === "ft" ||
    s.includes("aet") ||
    s.includes("pen") ||
    s.includes("completed")
  ) {
    return { status: "finished" };
  }
  if (
    s.includes("1h") ||
    s.includes("2h") ||
    s.includes("ht") ||
    s.includes("live") ||
    s.includes("in progress") ||
    s.includes("innings") ||
    /^\d+'/.test(s)
  ) {
    const minute = s.includes("1h")
      ? 25 + Math.floor(Math.random() * 20)
      : s.includes("ht")
        ? 45
        : s.includes("2h")
          ? 65 + Math.floor(Math.random() * 25)
          : 50;
    return { status: "live", minute };
  }
  return { status: "upcoming" };
}

function stableOdds(seed: string, base: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  const r = (Math.abs(h) % 1000) / 1000;
  return Math.round((base + (r - 0.5) * 0.2) * 100) / 100;
}

const TWO_WAY_SPORTS: Sport[] = [
  "tennis",
  "basketball",
  "volleyball",
  "baseball",
  "hockey",
  "cricket",
  "rugby",
  "esports",
];

function buildMarkets(eventId: string, sport: Sport): Market[] {
  const twoWay = TWO_WAY_SPORTS.includes(sport);

  if (twoWay) {
    const h = stableOdds(eventId + "h", 1.85);
    const a = stableOdds(eventId + "a", 1.95);
    const entries: OddsEntry[] = BOOKMAKERS.slice(0, 8).map((bm, i) => ({
      bookmakerId: bm.id,
      home: stableOdds(`${eventId}-${bm.id}-h`, h + i * 0.02),
      away: stableOdds(`${eventId}-${bm.id}-a`, a + i * 0.02),
      dropped: i % 4 === 0,
    }));
    return [{ type: "1x2", label: t.markets.winner, odds: markBestOdds(entries) as OddsEntry[] }];
  }

  const entries: OddsEntry[] = BOOKMAKERS.slice(0, 8).map((bm, i) => ({
    bookmakerId: bm.id,
    home: stableOdds(`${eventId}-${bm.id}-h`, 2.15),
    draw: stableOdds(`${eventId}-${bm.id}-d`, 3.35),
    away: stableOdds(`${eventId}-${bm.id}-a`, 3.1),
    dropped: i % 4 === 0,
  }));

  const markets: Market[] = [
    { type: "1x2", label: t.markets.oneXtwo, odds: markBestOdds(entries) as OddsEntry[] },
  ];

  if (sport === "football" || sport === "handball") {
    markets.push(
      {
        type: "ou25",
        label: t.markets.overUnder,
        odds: markBestOdds(
          BOOKMAKERS.slice(0, 6).map((bm) => ({
            bookmakerId: bm.id,
            over: stableOdds(`${eventId}-o-${bm.id}`, 1.85),
            under: stableOdds(`${eventId}-u-${bm.id}`, 1.95),
          }))
        ) as OddsEntry[],
      },
      {
        type: "btts",
        label: t.markets.btts,
        odds: markBestOdds(
          BOOKMAKERS.slice(0, 6).map((bm) => ({
            bookmakerId: bm.id,
            yes: stableOdds(`${eventId}-y-${bm.id}`, 1.72),
            no: stableOdds(`${eventId}-n-${bm.id}`, 2.08),
          }))
        ) as OddsEntry[],
      }
    );
  }

  return markets;
}

function mapSport(strSport?: string): Sport {
  const s = (strSport ?? "").toLowerCase();
  if (s.includes("soccer") || s.includes("football")) return "football";
  if (s.includes("basket")) return "basketball";
  if (s.includes("tennis")) return "tennis";
  if (s.includes("hockey") || s.includes("ice")) return "hockey";
  if (s.includes("baseball")) return "baseball";
  if (s.includes("volley")) return "volleyball";
  if (s.includes("handball")) return "handball";
  if (s.includes("rugby")) return "rugby";
  if (s.includes("cricket")) return "cricket";
  if (s.includes("fight") || s.includes("esport") || s.includes("gaming")) return "esports";
  return "football";
}

function mapEvent(ev: TsdbEvent): Match | null {
  if (!ev.idEvent || !ev.strHomeTeam || !ev.strAwayTeam) return null;

  const sport = mapSport(ev.strSport);
  const { status, minute } = parseStatus(ev.strStatus);
  const startTime = toIsoStartTime(ev.strTimestamp, ev.dateEvent, ev.strTime);

  const homeScore =
    ev.intHomeScore != null && ev.intHomeScore !== ""
      ? parseInt(String(ev.intHomeScore), 10)
      : undefined;
  const awayScore =
    ev.intAwayScore != null && ev.intAwayScore !== ""
      ? parseInt(String(ev.intAwayScore), 10)
      : undefined;

  return {
    id: `live-${ev.idEvent}`,
    sport,
    league: ev.strLeague ?? sport,
    leagueSlug: (ev.strLeague ?? sport).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    country: ev.strCountry ?? "World",
    homeTeam: ev.strHomeTeam,
    awayTeam: ev.strAwayTeam,
    startTime,
    status,
    homeScore: homeScore !== undefined && !Number.isNaN(homeScore) ? homeScore : undefined,
    awayScore: awayScore !== undefined && !Number.isNaN(awayScore) ? awayScore : undefined,
    minute,
    markets: buildMarkets(ev.idEvent, sport),
    popularity: status === "live" ? 100 : status === "upcoming" ? 55 : 25,
  };
}

async function fetchDayEvents(date: string, sportParam: string): Promise<TsdbEvent[]> {
  try {
    const data = await fetchJson<{ events: TsdbEvent[] | null }>(
      `${BASE}/eventsday.php?d=${date}&s=${encodeURIComponent(sportParam)}`
    );
    return data.events ?? [];
  } catch {
    return [];
  }
}

async function fetchLeagueEvents(
  endpoint: "eventsnextleague" | "eventspastleague",
  leagueId: string
): Promise<TsdbEvent[]> {
  try {
    const data = await fetchJson<{ events: TsdbEvent[] | null }>(
      `${BASE}/${endpoint}.php?id=${leagueId}`
    );
    return data.events ?? [];
  } catch {
    return [];
  }
}

async function mergeWithFallback(matches: Match[]): Promise<{
  matches: Match[];
  source: "live" | "fallback";
  updatedAt: string;
}> {
  const { generateFallbackBulletin } = await import("@/data/matches-fallback");
  const fallback = generateFallbackBulletin();
  const merged = ensureAllSportsCoverage(
    [
      ...matches,
      ...fallback.filter(
        (f) => !matches.some((m) => m.sport === f.sport && m.homeTeam === f.homeTeam)
      ),
    ],
    6
  );
  const hasLiveData = matches.some((m) => m.id.startsWith("live-"));
  return {
    matches: merged,
    source: hasLiveData && merged.length >= 20 ? "live" : "fallback",
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchLiveBulletin(): Promise<{
  matches: Match[];
  source: "live" | "fallback";
  updatedAt: string;
}> {
  try {
    const now = new Date();
    const dates: string[] = [];
    for (let offset = -3; offset <= 4; offset++) {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      dates.push(formatDate(d));
    }

    const fetches: Promise<TsdbEvent[]>[] = [];

    for (const date of dates) {
      for (const sportName of getTsdbSportNames()) {
        fetches.push(fetchDayEvents(date, sportName));
      }
    }

    for (const leagueId of LEAGUE_IDS) {
      fetches.push(fetchLeagueEvents("eventsnextleague", leagueId));
      fetches.push(fetchLeagueEvents("eventspastleague", leagueId));
    }

    const batches = await Promise.all(fetches);
    const seen = new Set<string>();
    let matches: Match[] = [];

    for (const batch of batches) {
      for (const ev of batch) {
        if (!ev.idEvent || seen.has(ev.idEvent)) continue;
        seen.add(ev.idEvent);
        try {
          const m = mapEvent(ev);
          if (m) matches.push(m);
        } catch {
          // skip malformed events
        }
      }
    }

    matches = ensureAllSportsCoverage(matches, 6);
    matches.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const hasLiveData = matches.some((m) => m.id.startsWith("live-"));

    if (!hasLiveData || matches.length < 20) {
      const merged = await mergeWithFallback(matches);
      return { ...merged, source: "fallback" };
    }

    return {
      matches,
      source: "live",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    const merged = await mergeWithFallback([]);
    return { ...merged, source: "fallback" };
  }
}
