"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { IconChevron, IconClose } from "../Icons";

export default function Gallery({ images, alt, seeMore }: { images: string[]; alt: string; seeMore: string }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState<number | null>(null);
  const n = images.length;
  const prev = useCallback(() => setI((x) => (x - 1 + n) % n), [n]);
  const next = useCallback(() => setI((x) => (x + 1) % n), [n]);

  useEffect(() => {
    if (box === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBox(null);
      if (e.key === "ArrowLeft") setBox((b) => (b === null ? b : (b - 1 + n) % n));
      if (e.key === "ArrowRight") setBox((b) => (b === null ? b : (b + 1) % n));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [box, n]);

  if (!n) return <div className="aspect-[4/3] rounded-lg bg-paper" />;
  const thumbs = images.slice(0, 4);

  return (
    <div className="flex flex-col-reverse gap-2 md:flex-row">
      {n > 1 && (
        <div className="grid grid-cols-4 gap-2 md:w-[108px] md:grid-cols-1">
          {thumbs.map((src, k) => {
            const more = k === 3 && n > 4;
            return (
              <button
                key={src}
                type="button"
                onClick={() => (more ? setBox(3) : setI(k))}
                className={`relative aspect-[3/2] overflow-hidden rounded-md border-2 ${i === k && !more ? "border-lime" : "border-transparent"}`}
              >
                <Image src={src} alt="" fill sizes="110px" className="object-cover" />
                {more && <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-semibold text-white uppercase">{seeMore}</span>}
              </button>
            );
          })}
        </div>
      )}
      <div className="relative aspect-[4/3] flex-1 overflow-hidden rounded-lg bg-paper md:aspect-auto md:min-h-[300px]">
        <button type="button" onClick={() => setBox(i)} className="absolute inset-0" aria-label={alt}>
          <Image src={images[i]} alt={alt} fill priority sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
        </button>
        {n > 1 && (
          <>
            <button type="button" onClick={prev} className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-black/20 text-white backdrop-blur-sm hover:bg-black/40" aria-label="Previous">
              <IconChevron dir="left" className="size-4" />
            </button>
            <button type="button" onClick={next} className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-black/20 text-white backdrop-blur-sm hover:bg-black/40" aria-label="Next">
              <IconChevron dir="right" className="size-4" />
            </button>
          </>
        )}
      </div>

      {box !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90" onClick={() => setBox(null)}>
          <button type="button" className="absolute top-4 right-4 text-white" aria-label="Close">
            <IconClose className="size-8" />
          </button>
          <div className="relative h-[80vh] w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[box]} alt={alt} fill sizes="92vw" className="object-contain" />
          </div>
          {n > 1 && (
            <>
              <button type="button" onClick={(e) => (e.stopPropagation(), setBox((box - 1 + n) % n))} className="absolute left-4 text-white" aria-label="Previous">
                <IconChevron dir="left" className="size-10" />
              </button>
              <button type="button" onClick={(e) => (e.stopPropagation(), setBox((box + 1) % n))} className="absolute right-4 text-white" aria-label="Next">
                <IconChevron dir="right" className="size-10" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 text-sm text-white/70">
            {box + 1} / {n}
          </div>
        </div>
      )}
    </div>
  );
}
