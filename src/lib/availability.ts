import type { Product } from "./types";

export const MAX_DAYS_AHEAD = 365;
export const MAX_QTY = 20;

export type Rules = Pick<Product, "tickets" | "closedWeekdays" | "closedDates" | "months">;

export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function parseYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
}

export type OpenRules = Pick<Product, "closedWeekdays" | "closedDates" | "months">;

/** Can this product be booked for the given day? (shared by the booking widget and the checkout API) */
export function isBookable(pr: Rules, date: Date, today = new Date()) {
  if (!pr.tickets.some((t) => t.price > 0)) return false;
  return isOpen(pr, date, today);
}

/** Opening rules only (no price check) – used for the base tickets of a combo */
export function isOpen(pr: OpenRules, date: Date, today = new Date()) {
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((d0.getTime() - t0.getTime()) / 86400000);
  if (diff < 0 || diff > MAX_DAYS_AHEAD) return false;
  if (pr.closedWeekdays.includes(d0.getDay())) return false;
  const md = `${String(d0.getMonth() + 1).padStart(2, "0")}-${String(d0.getDate()).padStart(2, "0")}`;
  if (pr.closedDates.includes(md)) return false;
  if (pr.months.length && !pr.months.includes(d0.getMonth() + 1)) return false;
  return true;
}

export function firstBookable(pr: OpenRules, today = new Date()) {
  for (let i = 0; i <= MAX_DAYS_AHEAD; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    if (isOpen(pr, d, today)) return d;
  }
  return null;
}
