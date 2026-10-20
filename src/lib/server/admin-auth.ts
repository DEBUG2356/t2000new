import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "t2k_admin";
const DAYS = 14;

const secret = () => process.env.ADMIN_SECRET?.trim() || `t2k:${process.env.ADMIN_PASSWORD || ""}`;
const sign = (exp: number) => createHmac("sha256", secret()).update(`admin:${exp}`).digest("hex");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(pw: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  return !!expected && safeEqual(pw, expected);
}

export async function startSession() {
  const exp = Date.now() + DAYS * 86400_000;
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value || "";
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(Number(exp)));
}

/** For admin pages and server actions */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
