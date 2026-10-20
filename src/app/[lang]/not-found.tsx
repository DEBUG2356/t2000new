import type { Metadata } from "next";
import Link from "next/link";
import { lang as rootLang } from "next/root-params";
import Shell from "@/components/Shell";
import { getDict } from "@/lib/i18n";
import { LANGS, isLang, localePrefix, type Lang } from "@/lib/site";

export const metadata: Metadata = { title: "Tickets 2000 | 404", robots: { index: false } };

export default async function NotFound() {
  const raw = await rootLang().catch(() => "en");
  const lang: Lang = raw && isLang(raw) ? raw : "en";
  const t = getDict(lang).notFound;
  const home = localePrefix(lang) || "/";
  const alternates = Object.fromEntries(LANGS.map((l) => [l, localePrefix(l) || "/"])) as Record<Lang, string>;
  return (
    <Shell lang={lang} alternates={alternates}>
      <div className="container-site py-24 text-center">
        <div className="font-display text-7xl font-semibold text-lime">404</div>
        <h1 className="mt-4 font-display text-3xl font-semibold">{t.title}</h1>
        <p className="mt-2 text-[#666]">{t.text}</p>
        <Link href={home} className="btn-lime mt-6 inline-block px-6 py-2">
          {t.home}
        </Link>
      </div>
    </Shell>
  );
}
