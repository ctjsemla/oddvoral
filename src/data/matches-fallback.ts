import { BOOKMAKERS } from "./bookmakers";
import { markBestOdds, randomOdds } from "@/lib/odds";
import { t } from "@/lib/i18n/en-IN";
import type { Match, Market, OddsEntry, Sport } from "@/types";
import { SPORTS } from "./sports";

const FIXTURES: Record<
  Sport,
  { home: string; away: string; league: string; country: string }[]
> = {
  football: [
    { home: "Mumbai City FC", away: "Kerala Blasters", league: "ISL", country: "India" },
    { home: "Bengaluru FC", away: "Chennaiyin FC", league: "ISL", country: "India" },
    { home: "Manchester City", away: "Liverpool", league: "Premier League", country: "England" },
    { home: "Real Madrid", away: "Barcelona", league: "La Liga", country: "Spain" },
    { home: "Bayern Munich", away: "Dortmund", league: "Bundesliga", country: "Germany" },
    { home: "Inter Milan", away: "AC Milan", league: "Serie A", country: "Italy" },
  ],
  tennis: [
    { home: "Djokovic N.", away: "Alcaraz C.", league: "ATP Masters", country: "World" },
    { home: "Sinner J.", away: "Medvedev D.", league: "ATP 500", country: "World" },
    { home: "Swiatek I.", away: "Sabalenka A.", league: "WTA 1000", country: "World" },
    { home: "Gauff C.", away: "Rybakina E.", league: "WTA 500", country: "World" },
    { home: "Nadal R.", away: "Ruud C.", league: "ATP 250", country: "World" },
    { home: "Murray A.", away: "Tsitsipas S.", league: "ATP 500", country: "World" },
  ],
  basketball: [
    { home: "Lakers", away: "Celtics", league: "NBA", country: "USA" },
    { home: "Warriors", away: "Nuggets", league: "NBA", country: "USA" },
    { home: "India", away: "Philippines", league: "FIBA Asia", country: "Asia" },
    { home: "Real Madrid", away: "Barcelona", league: "EuroLeague", country: "Europe" },
  ],
  hockey: [
    { home: "India", away: "Australia", league: "FIH Pro League", country: "World" },
    { home: "Maple Leafs", away: "Canadiens", league: "NHL", country: "USA" },
  ],
  baseball: [
    { home: "Yankees", away: "Red Sox", league: "MLB", country: "USA" },
    { home: "Dodgers", away: "Giants", league: "MLB", country: "USA" },
  ],
  volleyball: [
    { home: "Ahmedabad Defenders", away: "Calicut Heroes", league: "Prime Volleyball", country: "India" },
    { home: "Poland", away: "Brazil", league: "Nations League", country: "World" },
  ],
  handball: [
    { home: "Barcelona", away: "PSG", league: "EHF Champions League", country: "Europe" },
    { home: "India", away: "Iran", league: "Asian Championship", country: "Asia" },
  ],
  rugby: [
    { home: "India", away: "Hong Kong", league: "Asia Rugby", country: "Asia" },
    { home: "Ireland", away: "France", league: "Six Nations", country: "Europe" },
  ],
  cricket: [
    { home: "Mumbai Indians", away: "Chennai Super Kings", league: "IPL", country: "India" },
    { home: "Royal Challengers", away: "Kolkata Knight Riders", league: "IPL", country: "India" },
    { home: "India", away: "Australia", league: "ODI Series", country: "World" },
    { home: "England", away: "Pakistan", league: "T20 Series", country: "World" },
  ],
  esports: [
    { home: "Team Soul", away: "GodLike", league: "BGMI Masters", country: "India" },
    { home: "NAVI", away: "FaZe", league: "CS2 Major", country: "World" },
    { home: "T1", away: "Gen.G", league: "LoL LCK", country: "Korea" },
  ],
};

function generateOddsTwoWay(homeBase: number, awayBase: number): OddsEntry[] {
  const entries: OddsEntry[] = BOOKMAKERS.slice(0, 8).map((bm) => ({
    bookmakerId: bm.id,
    home: randomOdds(homeBase),
    away: randomOdds(awayBase),
  }));
  return markBestOdds(entries) as OddsEntry[];
}

function generate1x2Odds(homeBase: number, drawBase: number, awayBase: number): OddsEntry[] {
  const entries: OddsEntry[] = BOOKMAKERS.slice(0, 8).map((bm) => ({
    bookmakerId: bm.id,
    home: randomOdds(homeBase),
    draw: randomOdds(drawBase),
    away: randomOdds(awayBase),
  }));
  return markBestOdds(entries) as OddsEntry[];
}

function buildMarkets(sport: Sport): Market[] {
  const twoWay = ["tennis", "basketball", "volleyball", "baseball", "hockey", "cricket", "rugby", "esports"].includes(sport);

  if (twoWay) {
    return [
      {
        type: "1x2",
        label: t.markets.winner,
        odds: generateOddsTwoWay(1.75, 2.05),
      },
    ];
  }

  const markets: Market[] = [
    { type: "1x2", label: t.markets.oneXtwo, odds: generate1x2Odds(2.1, 3.4, 3.2) },
  ];
  if (sport === "football" || sport === "handball") {
    markets.push(
      {
        type: "ou25",
        label: t.markets.overUnder,
        odds: markBestOdds(
          BOOKMAKERS.slice(0, 6).map((bm) => ({
            bookmakerId: bm.id,
            over: randomOdds(1.85),
            under: randomOdds(1.95),
          }))
        ) as OddsEntry[],
      },
      {
        type: "btts",
        label: t.markets.btts,
        odds: markBestOdds(
          BOOKMAKERS.slice(0, 6).map((bm) => ({
            bookmakerId: bm.id,
            yes: randomOdds(1.72),
            no: randomOdds(2.08),
          }))
        ) as OddsEntry[],
      }
    );
  }
  return markets;
}

export function createFallbackMatch(
  sport: Sport,
  index: number,
  fixture: { home: string; away: string; league: string; country: string },
  status: Match["status"]
): Match {
  const hoursOffset =
    status === "live" ? 0 : status === "finished" ? -48 : index * 2 + 1;
  const startTime = new Date(Date.now() + hoursOffset * 3600000).toISOString();

  return {
    id: `fb-${sport}-${index}-${fixture.home.slice(0, 3)}`,
    sport,
    league: fixture.league,
    leagueSlug: fixture.league.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    country: fixture.country,
    homeTeam: fixture.home,
    awayTeam: fixture.away,
    startTime,
    status,
    homeScore: status !== "upcoming" ? Math.floor(Math.random() * 4) : undefined,
    awayScore: status !== "upcoming" ? Math.floor(Math.random() * 4) : undefined,
    minute: status === "live" ? 30 + index * 8 : undefined,
    markets: buildMarkets(sport),
    popularity: status === "live" ? 95 : 45,
  };
}

export function generateSportFallback(sport: Sport, count: number): Match[] {
  const fixtures = FIXTURES[sport] ?? FIXTURES.football;
  const matches: Match[] = [];
  for (let i = 0; i < count; i++) {
    const f = fixtures[i % fixtures.length];
    const status: Match["status"] = i < count - 1 ? "upcoming" : "finished";
    matches.push(createFallbackMatch(sport, i, f, status));
  }
  return matches;
}

export function generateFallbackBulletin(): Match[] {
  const all: Match[] = [];
  SPORTS.forEach((s) => {
    all.push(...generateSportFallback(s.id, 6));
  });
  return all.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export function ensureAllSportsCoverage(matches: Match[], minPerSport = 6): Match[] {
  const result = [...matches];
  for (const { id } of SPORTS) {
    const n = result.filter((m) => m.sport === id).length;
    if (n < minPerSport) {
      result.push(...generateSportFallback(id, minPerSport - n));
    }
  }
  return result.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}
