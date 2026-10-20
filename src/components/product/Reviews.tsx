"use client";

import { useState } from "react";
import Stars from "../Stars";

type R = { stars: number; date: string; text: string };
const PAGE = 6;

export default function Reviews({ reviews, rating, count, bars, t }: { reviews: R[]; rating: number; count: number; bars: number[] | null; t: { reviews: string; reviewsCount: string; stars: string; showMore: string } }) {
  const [shown, setShown] = useState(PAGE);
  const total = bars ? bars.reduce((a, b) => a + b, 0) : 0;
  return (
    <section id="reviews" className="mt-4 border-t border-[#dee2e6] px-0 pt-6 lg:px-3">
      <div className="mb-5 font-poppins text-[1.45rem] font-semibold">{t.reviews}</div>
      <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display text-5xl font-semibold">{rating}</span>
            <Stars value={rating} className="size-6" />
          </div>
          <div className="mt-1 text-[#666]">
            {count} {t.reviewsCount.toLowerCase()}
          </div>
        </div>
        {bars && total > 0 && (
          <div className="space-y-1.5">
            {bars.map((b, i) => (
              <div key={i} className="grid grid-cols-[70px_1fr_50px] items-center gap-3 text-sm">
                <span>{t.stars.replace("{n}", String(5 - i))}</span>
                <span className="h-2 overflow-hidden rounded bg-[#e9ecef]">
                  <span className="block h-full rounded bg-star" style={{ width: `${(b / total) * 100}%` }} />
                </span>
                <span className="text-right text-[#666]">{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {reviews.length > 0 && (
        <div className="mt-6 divide-y divide-[#eee]">
          {reviews.slice(0, shown).map((r, i) => (
            <div key={i} className="py-4">
              <div className="flex items-center gap-3 text-sm text-[#666]">
                <Stars value={r.stars} className="size-4" />
                <span>{r.date}</span>
              </div>
              <p className="mt-1.5 text-[15px] leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}
      {shown < reviews.length && (
        <div className="mt-2 text-center">
          <button type="button" onClick={() => setShown((s) => s + PAGE)} className="btn-outline-red px-5 py-2 text-sm">
            {t.showMore}
          </button>
        </div>
      )}
    </section>
  );
}
