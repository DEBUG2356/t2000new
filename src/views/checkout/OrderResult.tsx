"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dict } from "@/lib/i18n";
import { IconTick } from "@/components/Icons";

export default function OrderResult({ kind, t, home }: { kind: "success" | "cancel"; t: Dict["checkout"]; home: string }) {
  const sp = useSearchParams();
  const sid = sp.get("session_id");
  const back = sp.get("back");
  const [order, setOrder] = useState<{ email?: string; ref?: string } | null>(null);

  useEffect(() => {
    if (kind !== "success" || !sid) return;
    fetch(`/api/order?session_id=${encodeURIComponent(sid)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .catch(() => {});
  }, [kind, sid]);

  if (kind === "cancel") {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-[2rem] font-semibold">{t.cancelTitle}</h1>
        <p className="mt-3 text-[#555]">{t.cancelText}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {back && back.startsWith("/") && (
            <Link href={back} className="btn-lime px-6 py-2">
              {t.backToProduct}
            </Link>
          )}
          <Link href={home} className="btn-outline-red px-6 py-2">
            {t.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-lime text-white">
        <IconTick className="size-9" />
      </span>
      <h1 className="mt-5 font-display text-[2rem] font-semibold">{t.successTitle}</h1>
      <p className="mt-3 text-[#555]">{order?.email ? t.successText.replace("{email}", order.email) : t.successGeneric}</p>
      {order?.ref && (
        <p className="mt-2 text-sm text-muted">
          {t.orderNo}: <span className="font-mono text-ink">{order.ref}</span>
        </p>
      )}
      <Link href={home} className="btn-lime mt-6 inline-block px-6 py-2">
        {t.backHome}
      </Link>
    </div>
  );
}
