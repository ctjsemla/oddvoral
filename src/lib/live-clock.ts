import type { Match } from "@/types";

/** User-facing live time — only from API fields, never guessed from kickoff. */
export function formatLiveClock(match: Match): string {
  const detail = (match.liveDetail ?? "").trim();
  if (detail) {
    if (/^HT$/i.test(detail) || /halftime/i.test(detail)) return "HT";
    if (/^\d{1,2}:\d{2}/.test(detail)) return detail;
    if (/^Q\d$/i.test(detail)) return detail.toUpperCase();
    if (/^P\d$/i.test(detail)) return detail.toUpperCase();
    if (/1st|first/i.test(detail)) return "1H";
    if (/2nd|second/i.test(detail)) return "2H";
    return detail;
  }
  if (match.minute != null && match.minute >= 0) {
    return `${match.minute}'`;
  }
  return "LIVE";
}
