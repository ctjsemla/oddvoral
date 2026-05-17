import type { Match, Sport } from "@/types";
import {
  getBulletinMatches,
  filterBySport,
  filterLive,
  filterPopular,
  getMatchFromList,
  buildDroppingOdds,
  buildSureBets,
  buildValueBets,
} from "@/lib/bulletin";

export async function loadAllMatches(): Promise<Match[]> {
  const { matches } = await getBulletinMatches();
  return matches;
}

export async function getMatchesBySport(sport: Sport): Promise<Match[]> {
  const { matches } = await getBulletinMatches();
  return filterBySport(matches, sport);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const { matches } = await getBulletinMatches();
  return getMatchFromList(matches, id);
}

export async function getLiveMatches(): Promise<Match[]> {
  const { matches } = await getBulletinMatches();
  return filterLive(matches);
}

export async function getPopularMatches(limit = 10): Promise<Match[]> {
  const { matches } = await getBulletinMatches();
  return filterPopular(matches, limit);
}

export async function getDroppingOdds() {
  const { matches } = await getBulletinMatches();
  return buildDroppingOdds(matches);
}

export async function getSureBets() {
  const { matches } = await getBulletinMatches();
  return buildSureBets(matches);
}

export async function getValueBets() {
  const { matches } = await getBulletinMatches();
  return buildValueBets(matches);
}
