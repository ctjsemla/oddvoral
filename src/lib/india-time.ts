/** Site-wide clock and match times use India (Mumbai / Asia/Kolkata). */
export const INDIA_TZ = "Asia/Kolkata";

export function indiaCalendarDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isIndiaToday(date: Date): boolean {
  return indiaCalendarDay(date) === indiaCalendarDay(new Date());
}

export function isIndiaTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return indiaCalendarDay(date) === indiaCalendarDay(tomorrow);
}

export function formatIndiaTime(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }
): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TZ,
    ...options,
  }).format(date);
}

export function formatIndiaSiteClock(now = new Date()): string {
  return formatIndiaTime(now, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatIndiaMatchStamp(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
