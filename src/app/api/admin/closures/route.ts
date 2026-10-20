import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import { addClosure, fetchClosures, removeClosure } from "@/lib/server/db";

// Admin calendar: plain route handler (requests run in parallel, unlike queued server actions)
const isYmd = (d: unknown): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const id = Number(sp.get("p"));
  const from = sp.get("from");
  const to = sp.get("to");
  if (!id || !isYmd(from) || !isYmd(to)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  return NextResponse.json({ closures: await fetchClosures(id, from, to) }, { headers: { "Cache-Control": "no-store" } });
}

/** { productId, dates: ["2026-10-28", …], slot: "" | "09:30", closed: boolean } – one row per date */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const id = Number(b?.productId);
  const slot = typeof b?.slot === "string" ? b.slot : "";
  const dates: string[] = (Array.isArray(b?.dates) ? b.dates : []).filter(isYmd).slice(0, 62);
  if (!id || !dates.length || (slot && !/^\d{2}:\d{2}$/.test(slot))) return NextResponse.json({ error: "bad request" }, { status: 400 });
  try {
    await Promise.all(dates.map((d) => (b.closed ? addClosure(id, d, slot) : removeClosure(id, d, slot))));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
