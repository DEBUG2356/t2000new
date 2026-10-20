import { NextResponse } from "next/server";
import { dbConfigured, fetchClosures } from "@/lib/server/db";

const isYmd = (d: string | null): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);

// Closed days / time slots of one product for the visible month of the booking calendar
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const id = Number(sp.get("p"));
  const from = sp.get("from");
  const to = sp.get("to");
  if (!id || !isYmd(from) || !isYmd(to) || (Date.parse(to) - Date.parse(from)) / 86400000 > 62) return NextResponse.json({ error: "bad request" }, { status: 400 });
  if (!dbConfigured()) return NextResponse.json({ days: [], slots: {} });
  const rows = await fetchClosures(id, from, to).catch(() => []);
  const days: string[] = [];
  const slots: Record<string, string[]> = {};
  for (const r of rows) {
    if (!r.slot) days.push(r.date);
    else (slots[r.date] ||= []).push(r.slot);
  }
  return NextResponse.json({ days, slots }, { headers: { "Cache-Control": "no-store" } });
}
