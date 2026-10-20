// Time slots generated from opening hours: first slot, last slot (inclusive), step in minutes.
const toMin = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return +m[1] * 60 + +m[2];
};
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const normTime = (t: string | null | undefined) => {
  const m = t ? toMin(t) : null;
  return m == null ? null : toTime(m);
};

export function generateSlots(from: string | null, to: string | null, step: number | null): string[] {
  const a = from ? toMin(from) : null;
  const b = to ? toMin(to) : null;
  if (a == null || b == null || !step || step < 5 || b < a) return [];
  const out: string[] = [];
  for (let m = a; m <= b && out.length < 200; m += step) out.push(toTime(m));
  return out;
}
