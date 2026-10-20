import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { finalizeSession } from "@/lib/server/orders";
import { APP_TAG, stripe } from "@/lib/server/stripe";

// Stripe → checkout.session.completed: mark the order paid and e-mail the customer + sales inbox.
export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!s || !secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(payload, req.headers.get("stripe-signature") || "", secret);
  } catch (err) {
    console.error("[webhook] bad signature", err);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.app !== APP_TAG) return NextResponse.json({ ignored: true });
    await finalizeSession(session.id);
  }
  return NextResponse.json({ received: true });
}
