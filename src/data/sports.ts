import type { Sport } from "@/types";

export const SPORTS: {
  id: Sport;
  name: string;
  icon: string;
  tsdbName: string;
}[] = [
  { id: "football", name: "Football", icon: "⚽", tsdbName: "Soccer" },
  { id: "tennis", name: "Tennis", icon: "🎾", tsdbName: "Tennis" },
  { id: "basketball", name: "Basketball", icon: "🏀", tsdbName: "Basketball" },
  { id: "hockey", name: "Ice Hockey", icon: "🏒", tsdbName: "Ice Hockey" },
  { id: "baseball", name: "Baseball", icon: "⚾", tsdbName: "Baseball" },
  { id: "volleyball", name: "Volleyball", icon: "🏐", tsdbName: "Volleyball" },
  { id: "handball", name: "Handball", icon: "🤾", tsdbName: "Handball" },
  { id: "rugby", name: "Rugby", icon: "🏉", tsdbName: "Rugby" },
  { id: "cricket", name: "Cricket", icon: "🏏", tsdbName: "Cricket" },
  { id: "esports", name: "Esports", icon: "🎮", tsdbName: "Fighting" },
];

export const getSport = (id: Sport) => SPORTS.find((s) => s.id === id);

export const getTsdbSportNames = () => SPORTS.map((s) => s.tsdbName);
