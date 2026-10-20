import Image from "next/image";
import Link from "next/link";
import { getDict, fmt } from "@/lib/i18n";
import { productCover, productLabels, productLocation, productPrice, productTitle, productUrl, type Category, type Product } from "@/lib/catalog";
import type { Lang } from "@/lib/site";
import { Money } from "./Currency";
import { IconBolt, IconClock, IconLocation, IconMobile, IconTicket } from "./Icons";
import Stars from "./Stars";

export function PropIcon({ k, className = "size-3.5" }: { k: string; className?: string }) {
  if (k === "instant") return <IconBolt className={className} />;
  if (k === "mobile") return <IconMobile className={className} />;
  if (k === "fullDay" || k === "freeCancel") return <IconTicket className={className} />;
  return <IconClock className={className} />;
}

export default function ProductCard({ p, lang, category }: { p: Product; lang: Lang; category?: Category }) {
  const t = getDict(lang);
  const href = productUrl(p, lang, category);
  const title = productTitle(p, lang);
  const labels = productLabels(p, lang);
  const fp = productPrice(p);
  const price = fp?.price ?? null;
  const old = fp?.oldPrice;
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#e3e3e3] bg-white transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        <Image src={productCover(p)} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        {labels.length > 0 && (
          <div className="absolute top-2.5 left-2.5 z-[2] flex flex-col items-start gap-1.5">
            {labels.map((l) => (
              <span key={l.text} className="rounded px-2 py-1 font-display text-[13px] leading-none text-white" style={{ backgroundColor: l.bg }}>
                {l.text}
              </span>
            ))}
          </div>
        )}
        <Link href={href} className="absolute inset-0 z-[1] flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35" aria-label={title}>
          <span className="translate-y-2 rounded border border-white px-4 py-1.5 text-sm text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            {t.card.readMore}
          </span>
        </Link>
        {p.reviewCount ? (
          <div className="absolute right-0 bottom-0 z-[2] bg-gradient-to-l from-review/95 to-review/0 py-1 pr-3 pl-10 text-[15px] italic text-white">
            {p.reviewCount} {t.card.reviews}
          </div>
        ) : null}
      </div>

      <Link href={href} className="flex flex-1 flex-col px-3 pt-3.5">
        <div className="flex items-center justify-between gap-2 text-[13px]">
          <span className="flex min-w-0 items-center gap-1 uppercase text-[#555]">
            <IconLocation className="size-3.5 shrink-0" />
            <span className="truncate">{productLocation(p, lang)}</span>
          </span>
          {p.rating ? (
            <span className="flex shrink-0 items-center gap-1 rounded bg-star-soft px-1.5 py-0.5 text-[13px] text-ink">
              <Stars value={p.rating} className="size-3" />
              <span>{p.rating}</span>
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 mb-1 text-[15px] leading-snug font-semibold text-[#444] group-hover:text-brand-red">{title}</h2>
        {price != null && (
          <div className="mt-1 mb-1 flex flex-col">
            <span className="text-xs text-muted">{t.card.from}</span>
            <span className="flex items-baseline gap-2">
              <Money eur={price} className={`font-semibold ${old ? "text-brand-red" : "text-[#555]"}`} />
              {old ? <Money eur={old} className="text-sm font-semibold text-[#777] line-through" /> : null}
            </span>
          </div>
        )}
        <div className="mt-auto grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 pb-3 text-[12.5px] text-[#666]">
          {p.props.map((pr, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <PropIcon k={pr.key} />
              {pr.key === "duration" ? fmt(t.props.duration, { n: pr.n ?? 1 }) : t.props[pr.key]}
            </span>
          ))}
        </div>
      </Link>
      <div className="px-3 pb-3">
        <Link href={`${href}?check-availability`} className="btn-lime block py-1.5 text-center text-[15px]">
          {t.card.checkAvailability}
        </Link>
      </div>
    </div>
  );
}
