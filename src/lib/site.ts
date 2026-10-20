// Central site configuration. Contact details and operator data come from the
// archived tickets2000.com and can be changed here in one place.
export const site = {
  name: "Tickets 2000",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://tickets2000.com",
  email: "sales@tickets2000.com",
  phone: "+16613499853",
  social: {
    facebook: "https://www.facebook.com/ParisTick",
    instagram: "https://www.instagram.com/parusticktours/",
  },
  // Copyright line as on the original site
  copyrightHolder: "Paristick",
  copyrightYear: 2022,
  // Operator named in the legal pages (Terms, Privacy, Refund)
  operator: {
    name: "APEBE s.r.o.",
    address: "Ružový háj 4281/55 929 01 Dunajská Streda, Slovakia",
    regNo: "54883318",
    taxId: "2121808348",
  },
  // Display/charge rate for the USD currency option (1 EUR = x USD)
  usdRate: 1.08,
};

export const LANGS = ["en", "fr", "es", "de", "sk", "it"] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (l: string): l is Lang => (LANGS as readonly string[]).includes(l);

export const LANG_LABEL: Record<Lang, { code: string; name: string; flag: string }> = {
  en: { code: "EN", name: "English", flag: "/storage/flags/thumb/united-kingdom_991x991.webp" },
  fr: { code: "FR", name: "French", flag: "/storage/flags/thumb/france_991x991.webp" },
  es: { code: "ES", name: "Spanish", flag: "/storage/flags/thumb/spain_991x991.webp" },
  de: { code: "DE", name: "Deutsch", flag: "/storage/flags/thumb/deutsch_991x991.webp" },
  sk: { code: "SK", name: "Slovak", flag: "/storage/flags/thumb/slovak-2_991x991.webp" },
  it: { code: "IT", name: "Italian", flag: "/storage/flags/thumb/italy_991x991.webp" },
};

export const localePrefix = (lang: Lang) => (lang === "en" ? "" : `/${lang}`);
