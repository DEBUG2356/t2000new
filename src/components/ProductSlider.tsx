"use client";

import { useRef, type ReactNode } from "react";
import { IconChevron } from "./Icons";

// Horizontal carousel with round prev/next buttons, like the original "slider" product module
export default function ProductSlider({ children }: { children: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 16), behavior: "smooth" });
  };
  return (
    <div className="relative px-0 md:px-14">
      <button type="button" onClick={() => go(-1)} className="absolute top-1/2 left-0 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#555] bg-white text-[#555] hover:border-brand-red hover:text-brand-red md:flex" aria-label="Previous">
        <IconChevron dir="left" className="size-4" />
      </button>
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2">
        {children.map((c, i) => (
          <div key={i} className="w-[82%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]">
            {c}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => go(1)} className="absolute top-1/2 right-0 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#555] bg-white text-[#555] hover:border-brand-red hover:text-brand-red md:flex" aria-label="Next">
        <IconChevron dir="right" className="size-4" />
      </button>
    </div>
  );
}
