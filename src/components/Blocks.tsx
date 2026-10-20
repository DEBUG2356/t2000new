import Image from "next/image";
import { getDict } from "@/lib/i18n";
import { PARTNERS } from "@/data/shop";
import type { Lang } from "@/lib/site";

export function SectionTitle({ title, sub, flag = true }: { title: string; sub?: string; flag?: boolean }) {
  return (
    <div className="mb-6">
      <h3 className="flex items-center gap-2 font-display text-[1.75rem] leading-tight font-semibold text-ink">
        {title}
        {flag && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/storage/flags/thumb/france_991x991.webp" alt="" width={24} height={16} className="h-4 w-6" />
        )}
      </h3>
      {sub && <p className="mt-1 font-display text-lg text-muted">{sub}</p>}
    </div>
  );
}

export function WhyChooseUs({ lang }: { lang: Lang }) {
  const t = getDict(lang).why;
  const colors = ["text-[#f08e8e]", "text-[#f08e8e]", "text-[#f08e8e]", "text-[#f08e8e]"];
  return (
    <section className="bg-[#f6f6f6] py-12">
      <div className="container-site">
        <div className="mb-8 text-center font-display text-[1.6em] font-semibold text-ink">{t.title}</div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map(([big, small], i) => (
            <div key={i} className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/brand/why-${i + 1}.svg`} alt="" width={36} height={36} className="mx-auto size-9" />
              <h3 className={`mt-3 font-display text-[1.6rem] font-semibold ${colors[i]}`}>{big}</h3>
              <p className="font-display text-lg text-muted">{small}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <section className="py-12">
      <div className="container-site">
        <div className="mb-8 text-center font-display text-[1.6em] font-semibold text-ink">{t.partners}</div>
        <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
          {PARTNERS.map((p) => (
            <div key={p.src} className="relative mx-auto h-24 w-full max-w-[200px]">
              <Image src={p.src} alt={p.alt} fill sizes="200px" className="object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
