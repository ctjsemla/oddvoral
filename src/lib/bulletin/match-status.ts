import type { Match, MatchStatus, Sport } from "@/types";

const SPORT_DURATION_MIN: Record<Sport, number> = {
  football: 105,
  handball: 60,
  basketball: 150,
  hockey: 150,
  baseball: 240,
  tennis: 180,
  volleyball: 90,
  rugby: 100,
  cricket: 480,
  esports: 120,
};

export type EventSource = "day" | "next" | "past";

function parseMinuteFromStatus(raw: string): number | undefined {
  const s = raw.trim();
  const tick = s.match(/^(\d{1,3})(?:\+(\d{1,2}))?'?$/);
  if (tick) return Math.min(120, parseInt(tick[1], 10) + (tick[2] ? parseInt(tick[2], 10) : 0));

  const upper = s.toUpperCase();
  if (upper === "HT" || upper.includes("HALF TIME")) return 45;
  if (upper === "1H" || upper.includes("1ST HALF")) return 25;
  if (upper === "2H" || upper.includes("2ND HALF")) return 70;
  if (upper.includes("ET")) return 95;
  if (upper.includes("PEN")) return 105;

  return undefined;
}

function isFinishedStatus(raw?: string): boolean {
  if (!raw) return false;
  const s = raw.toLowerCase().trim();
  if (!s) return false;
  return (
    /\b(ft|full.?time|aet|after.?extra|pen|penalties|finished|complete|completed|final|result)\b/.test(
      s
    ) ||
    s === "match finished" ||
    s === "game finished"
  );
}

function isLiveStatus(raw?: string): boolean {
  if (!raw) return false;
  const s = raw.trim();
  const upper = s.toUpperCase();

  if (isFinishedStatus(s) || isNotStartedStatus(s)) return false;

  if (/^\d{1,3}(\+\d{1,2})?'?$/.test(s)) return true;

  return (
    /\b(1h|2h|ht|et|bt|ot|live|in play|in progress|playing|break|innings)\b/i.test(s) ||
    /^q[1-4]\b/i.test(upper) ||
    /^p[1-9]\b/i.test(upper) ||
    upper === "LIVE"
  );
}

function isNotStartedStatus(raw?: string): boolean {
  if (!raw) return false;
  const s = raw.toLowerCase().trim();
  return (
    /\b(ns|not started|scheduled|time to be defined|tbd|postponed|delayed|cancelled|canc|abandoned|abd|award|suspended)\b/.test(
      s
    ) || s === ""
  );
}

export function resolveMatchStatus(params: {
  strStatus?: string;
  startTimeIso: string;
  sport: Sport;
  homeScore?: number;
  awayScore?: number;
  eventSource?: EventSource;
}): { status: MatchStatus; minute?: number } {
  const { strStatus, startTimeIso, sport, homeScore, awayScore, eventSource } = params;
  const maxDur = SPORT_DURATION_MIN[sport] ?? 120;

  if (eventSource === "past") {
    return { status: "finished" };
  }

  if (isFinishedStatus(strStatus)) {
    return { status: "finished" };
  }

  const kickoff = new Date(startTimeIso).getTime();
  const kickoffGraceMin = 3;

  if (Number.isNaN(kickoff)) {
    return { status: "upcoming" };
  }

  const elapsedMin = (Date.now() - kickoff) / 60000;

  if (isLiveStatus(strStatus)) {
    if (elapsedMin < -kickoffGraceMin) {
      return { status: "upcoming" };
    }
    if (elapsedMin > maxDur + 12) {
      return { status: "finished" };
    }
    return {
      status: "live",
      minute: parseMinuteFromStatus(strStatus ?? "") ?? undefined,
    };
  }

  if (elapsedMin < -kickoffGraceMin) {
    return { status: "upcoming" };
  }

  if (elapsedMin > maxDur + 20) {
    return { status: "finished" };
  }

  if (eventSource === "next" && isNotStartedStatus(strStatus)) {
    return { status: "upcoming" };
  }

  // In kickoff window: only trust live if API explicitly says in-play (handled above).
  // Scores alone are not enough (0-0 lineups published early).
  if (elapsedMin >= kickoffGraceMin && elapsedMin <= maxDur) {
    const statusText = (strStatus ?? "").trim();
    if (
      statusText &&
      !isNotStartedStatus(statusText) &&
      !isFinishedStatus(statusText) &&
      (homeScore !== undefined || awayScore !== undefined)
    ) {
      const looksInPlay =
        isLiveStatus(statusText) ||
        /^\d+/.test(statusText) ||
        /half|quarter|period|set|inning/i.test(statusText);
      if (looksInPlay) {
        return {
          status: "live",
          minute:
            parseMinuteFromStatus(statusText) ??
            Math.min(maxDur, Math.round(elapsedMin)),
        };
      }
    }
  }

  return { status: "upcoming" };
}

/** Re-apply status rules so nothing stays "live" unless kickoff window + API agree. */
export function reconcileMatch(match: Match, strStatus?: string, eventSource?: EventSource): Match {
  const resolved = resolveMatchStatus({
    strStatus,
    startTimeIso: match.startTime,
    sport: match.sport,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    eventSource,
  });

  if (match.id.startsWith("fb-")) {
    if (match.status === "live") {
      return { ...match, status: "upcoming", minute: undefined };
    }
    return match;
  }

  if (resolved.status === "live") {
    return {
      ...match,
      status: "live",
      minute: match.minute ?? resolved.minute,
      liveDetail: match.liveDetail,
    };
  }

  return {
    ...match,
    status: resolved.status,
    minute: undefined,
    liveDetail: undefined,
  };
}

export function stripFakeLiveMatches(matches: Match[]): Match[] {
  return matches.map((m) =>
    m.id.startsWith("fb-") && m.status === "live"
      ? { ...m, status: "upcoming" as const, minute: undefined }
      : m
  );
}
