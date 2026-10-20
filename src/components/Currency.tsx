"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { site } from "@/lib/site";

export type Cur = "EUR" | "USD";
const Ctx = createContext<{ cur: Cur; setCur: (c: Cur) => void }>({ cur: "EUR", setCur: () => {} });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [cur, setCurState] = useState<Cur>("EUR");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("t2000:currency");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the saved choice after hydration
      if (saved === "USD") setCurState("USD");
    } catch {}
  }, []);
  const setCur = (c: Cur) => {
    setCurState(c);
    try {
      localStorage.setItem("t2000:currency", c);
    } catch {}
  };
  return <Ctx.Provider value={{ cur, setCur }}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx);

export function convert(eur: number, cur: Cur) {
  return cur === "USD" ? Math.round(eur * site.usdRate * 100) / 100 : eur;
}

/** "€ 17,90" — the number format used all over the original site */
export function formatMoney(eur: number, cur: Cur) {
  const v = convert(eur, cur);
  return `${cur === "USD" ? "$" : "€"} ${v.toFixed(2).replace(".", ",")}`;
}

export function Money({ eur, className }: { eur: number; className?: string }) {
  const { cur } = useCurrency();
  return <span className={className}>{formatMoney(eur, cur)}</span>;
}
