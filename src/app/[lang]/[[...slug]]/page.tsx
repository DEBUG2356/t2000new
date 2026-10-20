import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import { alternates, productCover, productHeading, productText, type Route } from "@/lib/catalog";
import { getDict } from "@/lib/i18n";
import { getCatalog } from "@/lib/server/catalog";
import { LANGS, isLang, type Lang } from "@/lib/site";
import CategoryView from "@/views/CategoryView";
import HomeView from "@/views/HomeView";
import PageView, { pageTitle } from "@/views/PageViews";
import ProductView from "@/views/ProductView";

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const catalog = await getCatalog();
  return catalog.segments(params.lang as Lang).map((slug) => ({ slug }));
}

async function load(props: PageProps<"/[lang]/[[...slug]]">) {
  const { lang, slug } = await props.params;
  if (!isLang(lang)) notFound();
  const catalog = await getCatalog();
  const route = catalog.resolve(lang, slug);
  if (!route) notFound();
  return { lang, route, catalog };
}

const strip = (html?: string) => (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function titleOf(route: Route, lang: Lang) {
  const t = getDict(lang);
  if (route.kind === "home") return `Tickets 2000 | ${t.home.title}`;
  if (route.kind === "category") return `Tickets 2000 | ${route.category.title[lang]}`;
  if (route.kind === "product") return productHeading(route.product, lang);
  return `Tickets 2000 | ${pageTitle(route.page, lang)}`;
}

export async function generateMetadata(props: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  const { lang, route } = await load(props);
  const alt = alternates(route);
  let description: string | undefined;
  let image: string | undefined;
  if (route.kind === "product") {
    const text = productText(route.product, lang);
    description = (route.product.i18n[lang]?.metaDescription || strip(text.overview)).slice(0, 180) || undefined;
    image = productCover(route.product);
  } else if (route.kind === "home" || route.kind === "category") {
    description = getDict(lang).home.topOffersSub;
  }
  const noindex = route.kind === "page" && ["checkout", "success", "cancel"].includes(route.page);
  return {
    title: titleOf(route, lang),
    description,
    alternates: {
      canonical: alt[lang],
      languages: Object.fromEntries([...LANGS.map((l) => [l, alt[l]]), ["x-default", alt.en]]),
    },
    openGraph: { title: titleOf(route, lang), description, url: alt[lang], ...(image ? { images: [image] } : {}) },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function Page(props: PageProps<"/[lang]/[[...slug]]">) {
  const { lang, route, catalog } = await load(props);
  return (
    <Shell lang={lang} alternates={alternates(route)}>
      {route.kind === "home" && <HomeView lang={lang} catalog={catalog} />}
      {route.kind === "category" && <CategoryView category={route.category} lang={lang} catalog={catalog} />}
      {route.kind === "product" && <ProductView product={route.product} category={route.category} lang={lang} catalog={catalog} />}
      {route.kind === "page" && <PageView page={route.page} lang={lang} catalog={catalog} />}
    </Shell>
  );
}
