import type { Lang } from "./site";

export const TICKET_TYPES = ["adult", "senior", "youth", "child", "infant"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];
export type Ticket = { type: TicketType; price: number; oldPrice?: number | null; age?: string };
export type TicketCounts = Record<TicketType, number>;
export const emptyCounts = (): TicketCounts => ({ adult: 0, senior: 0, youth: 0, child: 0, infant: 0 });

export type PropKey = "instant" | "mobile" | "flexible" | "fullDay" | "freeCancel" | "duration";
export type Prop = { key: PropKey; n?: number };
export type Label = { text: string; bg: string };
/** fromProduct: the review was written for another product (e.g. a combo) and is shown with that note */
export type Review = { stars: number; date: string; text: string; fromProduct?: number };

export type LangText = {
  title: string;
  slug: string;
  cardTitle?: string;
  location?: string;
  labels?: Label[];
  metaDescription?: string;
  package?: string[];
  overview?: string;
  included?: string[];
  info?: string;
  additional?: string;
  address?: string;
  cancellation?: string;
};

export type Product = {
  id: number;
  active: boolean;
  sort: number;
  categories: string[];
  primaryCategory: string | null;
  image: string | null; // card cover (falls back to the first gallery image)
  gallery: string[];
  rating: number | null;
  reviewCount: number | null;
  bars: number[] | null;
  lat: number | null;
  lng: number | null;
  props: Prop[];
  i18n: Partial<Record<Lang, LangText>>;
  legacyUrls: Partial<Record<Lang, string[]>>;
  reviews: Review[];
  tickets: Ticket[];
  minQty: number;
  closedWeekdays: number[];
  closedDates: string[];
  months: number[];
  timeSlots: string[]; // generated from slotFrom/slotTo/slotStep
  slotFrom: string | null; // first time slot, "09:30"
  slotTo: string | null; // last time slot, "16:00"
  slotStep: number | null; // minutes between slots
  components: number[]; // combo: ids of the base products (their opening hours/slots/closures are used)
  updatedAt?: string;
};

/** A closed whole day (slot "") or a single closed time slot of a product */
export type Closure = { date: string; slot: string };

/** "from" price shown on cards: the cheapest paid ticket */
export function fromPrice(p: Pick<Product, "tickets">): { price: number; oldPrice: number | null } | null {
  const paid = p.tickets.filter((t) => t.price > 0).sort((a, b) => a.price - b.price);
  if (!paid.length) return null;
  return { price: paid[0].price, oldPrice: paid[0].oldPrice || null };
}

export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";
export type Order = TicketCounts & {
  id: string;
  ref: string;
  created_at: string;
  status: OrderStatus;
  email: string;
  name: string;
  phone: string | null;
  date: string;
  time_slot: string | null;
  product_id: number | null;
  product_name: string;
  total: number;
  currency: string;
  lang: string | null;
  notes: string | null;
  stripe_session_id: string | null;
  paid_at: string | null;
  group_ref: string | null; // one purchase (all parts of a combo share it)
  combo_id: number | null;
  combo_name: string | null;
  sent: boolean; // tickets sent to the customer
  exported: boolean; // order transferred to Google Sheets
};
