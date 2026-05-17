import type { Match, MatchOddsHistory, OutcomeOddsHistory, OddsHistoryPoint } from "@/types";

function generatePoints(
  opening: number,
  current: number,
  hoursBack: number,
  steps = 24
): OddsHistoryPoint[] {
  const points: OddsHistoryPoint[] = [];
  const now = Date.now();
  for (let i = steps; i >= 0; i--) {
    const t = now - (hoursBack * 3600000 * i) / steps;
    const progress = 1 - i / steps;
    const value =
      Math.round((opening + (current - opening) * progress) * 100) / 100;
    points.push({
      timestamp: new Date(t).toISOString(),
      value: Math.max(1.01, value),
    });
  }
  points[points.length - 1].value = current;
  return points;
}

function buildOutcomeHistory(
  match: Match,
  outcome: "home" | "draw" | "away",
  label: string,
  bookmakerId: string
): OutcomeOddsHistory {
  const market = match.markets[0];
  const entry = market.odds.find((o) => o.bookmakerId === bookmakerId) ?? market.odds[0];
  const current =
    outcome === "home"
      ? entry.home ?? 2.0
      : outcome === "draw"
        ? entry.draw ?? 3.2
        : entry.away ?? 3.0;
  const opening = current * 1.06;
  const values = generatePoints(opening, current, 48);
  const allVals = values.map((p) => p.value);

  return {
    outcome,
    label,
    bookmakerId,
    opening: Math.round(opening * 100) / 100,
    current,
    high: Math.round(Math.max(...allVals) * 100) / 100,
    low: Math.round(Math.min(...allVals) * 100) / 100,
    points: values,
  };
}

const historyCache = new Map<string, MatchOddsHistory>();

export function getMatchOddsHistory(match: Match): MatchOddsHistory | null {
  if (!match) return null;
  if (historyCache.has(match.id)) return historyCache.get(match.id)!;

  const bm = match.markets[0]?.odds[0]?.bookmakerId ?? "bet365";
  const histories: OutcomeOddsHistory[] = [
    buildOutcomeHistory(match, "home", "1", bm),
    buildOutcomeHistory(match, "draw", "X", bm),
    buildOutcomeHistory(match, "away", "2", bm),
  ];

  const data: MatchOddsHistory = { matchId: match.id, histories };
  historyCache.set(match.id, data);
  return data;
}
