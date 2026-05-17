import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { locale, t } from "@/lib/i18n/en-IN";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMatchTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return t.time.today(format(date, "HH:mm"));
  if (isTomorrow(date)) return t.time.tomorrow(format(date, "HH:mm"));
  return format(date, "dd MMM HH:mm", { locale });
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
