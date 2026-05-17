import type { Bookmaker } from "@/types";

export const BOOKMAKERS: Bookmaker[] = [
  { id: "bet365", name: "bet365", slug: "bet365", color: "#027b5b", logo: "365" },
  { id: "betfair", name: "Betfair", slug: "betfair", color: "#ffb80c", logo: "BF" },
  { id: "pinnacle", name: "Pinnacle", slug: "pinnacle", color: "#c41230", logo: "PN" },
  { id: "1xbet", name: "1xBet", slug: "1xbet", color: "#1a5f9e", logo: "1X" },
  { id: "bwin", name: "bwin", slug: "bwin", color: "#000000", logo: "BW" },
  { id: "unibet", name: "Unibet", slug: "unibet", color: "#147b45", logo: "UB" },
  { id: "williamhill", name: "William Hill", slug: "williamhill", color: "#003366", logo: "WH" },
  { id: "betway", name: "Betway", slug: "betway", color: "#00a826", logo: "BW" },
  { id: "marathon", name: "Marathon", slug: "marathon", color: "#e30613", logo: "MR" },
  { id: "betsson", name: "Betsson", slug: "betsson", color: "#ff6600", logo: "BS" },
  { id: "nordicbet", name: "NordicBet", slug: "nordicbet", color: "#003087", logo: "NB" },
  { id: "tipico", name: "Tipico", slug: "tipico", color: "#c8102e", logo: "TP" },
];

export const getBookmaker = (id: string) =>
  BOOKMAKERS.find((b) => b.id === id) ?? BOOKMAKERS[0];
