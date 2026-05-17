import type { Match, Sport, SureBet, DroppingOdd, ValueBet } from "@/types";
import { BOOKMAKERS } from "@/data/bookmakers";
import { t } from "@/lib/i18n/en-IN";
import { fetchLiveBulletin } from "./thesportsdb";

let serverCache: { matches: Match[]; updatedAt: string; source: string } | null = null;
let serverCacheTime = 0;
const SERVER_TTL_IDLE_MS = 20_000;
const SERVER_TTL_LIVE_MS = 8_000;

export function invalidateBulletinCache() {
  serverCache = null;
  serverCacheTime = 0;
}

export async function getBulletinMatches(): Promise<{
  matches: Match[];
  source: string;
  updatedAt: string;
}> {
  const now = Date.now();
  const ttl =
    serverCache?.matches.some((m) => m.status === "live") === true
      ? SERVER_TTL_LIVE_MS
      : SERVER_TTL_IDLE_MS;
  if (serverCache && now - serverCacheTime < ttl) {
    return serverCache;
  }
  try {
    const data = await fetchLiveBulletin();
    serverCache = data;
    serverCacheTime = now;
    return data;
  } catch {
    const { generateFallbackBulletin } = await import("@/data/matches-fallback");
    const data = {
      matches: generateFallbackBulletin(),
      source: "fallback",
      updatedAt: new Date().toISOString(),
    };
    serverCache = data;
    serverCacheTime = now;
    return data;
  }
}

export function getMatchFromList(matches: Match[], id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function filterBySport(matches: Match[], sport: Sport): Match[] {
  return matches.filter((m) => m.sport === sport);
}

export function filterLive(matches: Match[]): Match[] {
  return matches.filter((m) => m.status === "live");
}

export function filterPopular(matches: Match[], limit = 15): Match[] {
  return [...matches]
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return b.popularity - a.popularity;
    })
    .slice(0, limit);
}

export function buildDroppingOdds(matches: Match[]): DroppingOdd[] {
  const drops: DroppingOdd[] = [];
  matches.slice(0, 20).forEach((match, i) => {
    const market = match.markets[0];
    const entry = market.odds[i % market.odds.length];
    const outcomes = [
      { key: "home" as const, label: match.homeTeam },
      { key: "draw" as const, label: t.match.draw },
      { key: "away" as const, label: match.awayTeam },
    ];
    const outcome = outcomes[i % 3];
    const to = entry[outcome.key] ?? 2.0;
    const from = to * (1 + (5 + Math.random() * 10) / 100);
    drops.push({
      id: `drop-${match.id}-${i}`,
      match,
      bookmaker: entry.bookmakerId,
      outcome: outcome.label,
      from: Math.round(from * 100) / 100,
      to,
      dropPercent: Math.round(((from - to) / from) * 1000) / 10,
      market: market.label,
    });
  });
  return drops.sort((a, b) => b.dropPercent - a.dropPercent);
}

export function buildSureBets(matches: Match[]): SureBet[] {
  return matches.slice(0, 5).map((match) => ({
    id: `sure-${match.id}`,
    match,
    profit: Math.round((1.5 + Math.random() * 4) * 100) / 100,
    market: "1X2",
    selections: [
      { bookmaker: "bet365", outcome: match.homeTeam, odds: 2.15 },
      { bookmaker: "pinnacle", outcome: t.match.draw, odds: 3.5 },
      { bookmaker: "betfair", outcome: match.awayTeam, odds: 3.8 },
    ],
  }));
}

export function buildValueBets(matches: Match[]): ValueBet[] {
  return matches.slice(0, 12).map((match, i) => {
    const odds = 2.0 + Math.random() * 2;
    const fairOdds = odds * (0.85 + Math.random() * 0.1);
    return {
      id: `value-${match.id}`,
      match,
      outcome: i % 2 === 0 ? match.homeTeam : match.awayTeam,
      odds: Math.round(odds * 100) / 100,
      fairOdds: Math.round(fairOdds * 100) / 100,
      valuePercent: Math.round((odds / fairOdds - 1) * 1000) / 10,
      bookmaker: BOOKMAKERS[i % BOOKMAKERS.length].name,
    };
  });
}
