import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { locale, t } from "@/lib/i18n/en-IN";
import {
  formatIndiaMatchStamp,
  formatIndiaTime,
  isIndiaToday,
  isIndiaTomorrow,
} from "@/lib/india-time";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMatchTime(dateStr: string): string {
  const date = new Date(dateStr);
  const hhmm = formatIndiaTime(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (isIndiaToday(date)) return t.time.today(hhmm);
  if (isIndiaTomorrow(date)) return t.time.tomorrow(hhmm);
  return formatIndiaMatchStamp(date);
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
