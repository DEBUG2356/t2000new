import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import { CATALOG_TAG, patchProduct } from "@/lib/server/db";
import { generateSlots, normTime } from "@/lib/slots";

// Booking rules of one product, saved immediately from the editor (no "Mentés" needed)
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const id = Number(b?.id);
  if (!id) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const ints = (v: unknown, min: number, max: number) => [...new Set((Array.isArray(v) ? v : []).map(Number).filter((n) => Number.isInteger(n) && n >= min && n <= max))].sort((a, z) => a - z);
  const slotFrom = normTime(b.slotFrom);
  const slotTo = normTime(b.slotTo);
  const step = Math.floor(Number(b.slotStep)) || 30;
  const timeSlots = generateSlots(slotFrom, slotTo, step);
  const cols = {
    closed_weekdays: ints(b.closedWeekdays, 0, 6),
    closed_dates: [...new Set((Array.isArray(b.closedDates) ? b.closedDates : []).map(String).filter((d: string) => /^\d{2}-\d{2}$/.test(d)))],
    months: ints(b.months, 1, 12),
    min_qty: Math.max(1, Math.floor(Number(b.minQty)) || 1),
    slot_from: timeSlots.length ? slotFrom : null,
    slot_to: timeSlots.length ? slotTo : null,
    slot_step: timeSlots.length ? step : null,
    time_slots: timeSlots,
  };
  try {
    await patchProduct(id, cols);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
  // the public booking calendar uses the new rules on the next request
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, timeSlots });
}
