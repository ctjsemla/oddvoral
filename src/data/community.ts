import type { Prediction, SettledCoupon, CouponSelection, Match } from "@/types";
import { FAKE_USERS } from "./users";

const COMMENTS = [
  "Home form looks solid — backing the favourite here.",
  "Away defence is shaky; over goals makes sense.",
  "Get in before the odds drop, decent value still.",
  "Stats point towards a draw in this fixture.",
  "Might get better odds in-play but risky.",
  "Same pattern paid out last week.",
  "Both teams to score looks like the play.",
  "Pinnacle still offering a strong price.",
  "Perfect leg for an accumulator coupon.",
  "Head-to-head favours the home side.",
];

function daysAgo(days: number, hours = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

export function buildSeedPredictions(matches: Match[]): Prediction[] {
  if (matches.length === 0) return [];

  const predictions: Prediction[] = [];
  let idx = 0;

  FAKE_USERS.forEach((user) => {
    const sportMatches = matches.filter(
      (m) =>
        user.username === "tennis_ace"
          ? m.sport === "tennis"
          : user.username === "ipl_king" || user.username === "chennai_tipster"
            ? m.sport === "cricket" || m.sport === "football"
            : true
    );
    const pool = sportMatches.length > 0 ? sportMatches : matches;
    const matchCount = Math.min(8, pool.length);

    for (let i = 0; i < matchCount; i++) {
      const match = pool[idx % pool.length];
      idx++;
      const market = match.markets[0];
      const hasDraw = market.odds[0]?.draw !== undefined;
      const outcomes = hasDraw
        ? [
            { o: match.homeTeam, odds: market.odds[0]?.home ?? 2.1 },
            { o: "Draw", odds: market.odds[0]?.draw ?? 3.3 },
            { o: match.awayTeam, odds: market.odds[0]?.away ?? 3.0 },
          ]
        : [
            { o: match.homeTeam, odds: market.odds[0]?.home ?? 1.85 },
            { o: match.awayTeam, odds: market.odds[0]?.away ?? 1.95 },
          ];
      const pick = outcomes[i % outcomes.length];
      const isFinished = match.status === "finished";
      const won =
        isFinished &&
        ((pick.o === match.homeTeam &&
          (match.homeScore ?? 0) > (match.awayScore ?? 0)) ||
          (pick.o === match.awayTeam &&
            (match.awayScore ?? 0) > (match.homeScore ?? 0)) ||
          (pick.o === "Draw" && match.homeScore === match.awayScore));

      let status: Prediction["status"] = "pending";
      if (isFinished) status = won ? "won" : "lost";

      predictions.push({
        id: `pred-${user.id}-${match.id}-${i}`,
        userId: user.id,
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        sport: match.sport,
        startTime: match.startTime,
        market: market.label,
        outcome: pick.o,
        odds: Math.round((pick.odds ?? 2) * 100) / 100,
        stake: [500, 1000, 2000, 5000][i % 4],
        comment: COMMENTS[(idx + i) % COMMENTS.length],
        createdAt: daysAgo(i % 7, 10 + (i % 12)),
        status,
        likes: Math.floor(Math.random() * 80) + 2,
        resultScore:
          isFinished && match.homeScore !== undefined
            ? `${match.homeScore}-${match.awayScore}`
            : undefined,
      });
    }
  });

  return predictions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function buildSeedCoupons(matches: Match[]): SettledCoupon[] {
  if (matches.length === 0) return [];

  const coupons: SettledCoupon[] = [];

  FAKE_USERS.forEach((user, ui) => {
    for (let c = 0; c < 5; c++) {
      const selCount = 2 + (c % 3);
      const selections: CouponSelection[] = [];
      let totalOdds = 1;

      for (let s = 0; s < selCount; s++) {
        const match = matches[(ui * 5 + c + s) % matches.length];
        const odds = match.markets[0].odds[s % 3]?.home ?? 1.9;
        totalOdds *= odds;
        const isFinished = match.status === "finished";
        selections.push({
          matchId: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          outcome: s % 2 === 0 ? match.homeTeam : match.awayTeam,
          odds: Math.round(odds * 100) / 100,
          bookmaker: "bet365",
          market: match.markets[0].label,
          result: isFinished ? (s % 3 !== 2 ? "won" : "lost") : "pending",
        });
      }

      const stake = [1000, 2500, 5000][c % 3];
      const potentialWin = stake * totalOdds;
      const anyLost = selections.some((sel) => sel.result === "lost");
      const allWon = selections.every((sel) => sel.result === "won");

      coupons.push({
        id: `coupon-${user.id}-${c}`,
        userId: user.id,
        title: `${selCount}-fold Acca`,
        selections,
        stake,
        totalOdds: Math.round(totalOdds * 100) / 100,
        potentialWin: Math.round(potentialWin * 100) / 100,
        actualWin: allWon && !anyLost ? Math.round(potentialWin * 100) / 100 : 0,
        status: anyLost ? "lost" : allWon ? "won" : "pending",
        createdAt: daysAgo(c + 2, 14),
        settledAt: daysAgo(c, 22),
      });
    }
  });

  return coupons.sort(
    (a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime()
  );
}

export function getPredictionsByUser(all: Prediction[], userId: string): Prediction[] {
  return all.filter((p) => p.userId === userId);
}

export function getPredictionsByMatch(all: Prediction[], matchId: string): Prediction[] {
  return all.filter((p) => p.matchId === matchId);
}

export function getCouponsByUser(all: SettledCoupon[], userId: string): SettledCoupon[] {
  return all.filter((c) => c.userId === userId);
}
