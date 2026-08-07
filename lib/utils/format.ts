import { format, formatDistanceToNow } from "date-fns";

export function formatDate(value: string | Date) {
  return format(new Date(value), "MMM d, yyyy");
}

export function formatRelativeDate(value: string | Date) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function formatScore(score: number | null) {
  return score === null ? "--" : String(score);
}

export function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
