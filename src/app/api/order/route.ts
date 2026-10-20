import { NextResponse } from "next/server";
import { finalizeSession } from "@/lib/server/orders";

// Thank-you page: confirms the payment (also without the webhook) and returns what the buyer already knows
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id") || "";
  try {
    const order = await finalizeSession(id);
    if (!order || order.status !== "paid") return NextResponse.json({}, { status: 404 });
    return NextResponse.json({ ref: order.group_ref || order.ref, email: order.email });
  } catch (e) {
    console.error("[order]", e);
    return NextResponse.json({}, { status: 404 });
  }
}
