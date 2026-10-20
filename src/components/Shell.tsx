import type { ReactNode } from "react";
import { categoryUrl, NAV_CATEGORIES, pageUrl } from "@/lib/catalog";
import { getDict } from "@/lib/i18n";
import { localePrefix, type Lang } from "@/lib/site";
import Footer from "./Footer";
import Header from "./Header";

export default function Shell({ lang, alternates, children }: { lang: Lang; alternates: Record<Lang, string>; children: ReactNode }) {
  const t = getDict(lang);
  return (
    <>
      <Header
        lang={lang}
        home={localePrefix(lang) || "/"}
        nav={NAV_CATEGORIES.map((c) => ({ label: c.title[lang], href: categoryUrl(c, lang) }))}
        alternates={alternates}
        searchUrl={pageUrl("search", lang)}
        searchPlaceholder={t.search.placeholder}
      />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} />
    </>
  );
}
