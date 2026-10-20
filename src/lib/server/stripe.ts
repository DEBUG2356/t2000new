import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  client ||= new Stripe(key);
  return client;
}

// All Stripe objects of this site carry this tag (the Stripe account may be shared with other sites)
export const APP_TAG = "tickets2000";

export const orderRef = () => "T2K-" + Math.random().toString(36).slice(2, 8).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase();
