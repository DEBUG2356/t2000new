import type { Metadata } from "next";
import { League_Spartan, Open_Sans, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import CookieBanner from "@/components/CookieBanner";
import { CurrencyProvider } from "@/components/Currency";
import { pageUrl } from "@/lib/catalog";
import { getDict } from "@/lib/i18n";
import { LANGS, isLang, site } from "@/lib/site";
import "../globals.css";

const spartan = League_Spartan({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500", "600", "800"], variable: "--font-league-spartan" });
const openSans = Open_Sans({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "600", "700"], variable: "--font-open-sans" });
const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "600"], variable: "--font-poppins" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Tickets 2000 | Home", template: "%s" },
  icons: { icon: "/assets/front/favicon.ico" },
  openGraph: { siteName: "Tickets 2000", type: "website", images: ["/images/fb-preview-img.jpg"] },
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  return (
    <html lang={lang} className={`${spartan.variable} ${openSans.variable} ${poppins.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CurrencyProvider>
          {children}
          <CookieBanner t={t.cookie} privacyUrl={pageUrl("privacy", lang)} />
        </CurrencyProvider>
      </body>
    </html>
  );
}
