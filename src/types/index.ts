export type OddsFormat = "decimal" | "fractional" | "american";

export type Sport =
  | "football"
  | "tennis"
  | "basketball"
  | "hockey"
  | "baseball"
  | "volleyball"
  | "handball"
  | "rugby"
  | "cricket"
  | "esports";

export type MatchStatus = "upcoming" | "live" | "finished";

export type MarketType = "1x2" | "ou25" | "btts" | "dc" | "ah";

export type PredictionStatus = "pending" | "won" | "lost" | "void";

export type CouponStatus = "pending" | "won" | "lost" | "cashout";

export interface Bookmaker {
  id: string;
  name: string;
  slug: string;
  color: string;
  logo: string;
}

export interface OddsEntry {
  bookmakerId: string;
  home?: number;
  draw?: number;
  away?: number;
  over?: number;
  under?: number;
  yes?: number;
  no?: number;
  previous?: number;
  dropped?: boolean;
  isBest?: boolean;
}

export interface Market {
  type: MarketType;
  label: string;
  odds: OddsEntry[];
}

export interface Match {
  id: string;
  sport: Sport;
  league: string;
  leagueSlug: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  /** ESPN live phase label (HT, 2nd, Q3, or clock like 7:19). */
  liveDetail?: string;
  markets: Market[];
  popularity: number;
}

export interface OddsHistoryPoint {
  timestamp: string;
  value: number;
}

export interface OutcomeOddsHistory {
  outcome: "home" | "draw" | "away";
  label: string;
  bookmakerId: string;
  opening: number;
  current: number;
  high: number;
  low: number;
  points: OddsHistoryPoint[];
}

export interface MatchOddsHistory {
  matchId: string;
  histories: OutcomeOddsHistory[];
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  avatarColor: string;
  bio: string;
  country: string;
  joinedAt: string;
  isVerified: boolean;
  isPro: boolean;
  stats: UserStats;
  following: string[];
  followers: string[];
}

export interface UserStats {
  predictions: number;
  won: number;
  lost: number;
  pending: number;
  yield: number;
  avgOdds: number;
  couponsWon: number;
  couponsLost: number;
  roi: number;
  streak: number;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: Sport;
  startTime: string;
  market: string;
  outcome: string;
  odds: number;
  stake: number;
  comment: string;
  createdAt: string;
  status: PredictionStatus;
  likes: number;
  resultScore?: string;
}

export interface SettledCoupon {
  id: string;
  userId: string;
  title: string;
  selections: CouponSelection[];
  stake: number;
  totalOdds: number;
  potentialWin: number;
  actualWin: number;
  status: CouponStatus;
  createdAt: string;
  settledAt: string;
}

export interface SureBet {
  id: string;
  match: Match;
  profit: number;
  market: string;
  selections: { bookmaker: string; outcome: string; odds: number }[];
}

export interface DroppingOdd {
  id: string;
  match: Match;
  bookmaker: string;
  outcome: string;
  from: number;
  to: number;
  dropPercent: number;
  market: string;
}

export interface ValueBet {
  id: string;
  match: Match;
  outcome: string;
  odds: number;
  fairOdds: number;
  valuePercent: number;
  bookmaker: string;
}

export interface CouponSelection {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  outcome: string;
  odds: number;
  bookmaker: string;
  market: string;
  result?: "won" | "lost" | "pending";
}

export interface UserSettings {
  oddsFormat: OddsFormat;
  timezone: string;
  enabledBookmakers: string[];
  favoriteSports: Sport[];
}

export interface RegisteredUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  password: string;
  avatarColor: string;
  joinedAt: string;
}
