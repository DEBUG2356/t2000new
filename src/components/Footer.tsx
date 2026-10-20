import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { pageUrl } from "@/lib/catalog";
import { site, type Lang } from "@/lib/site";
import { IconFacebook, IconInstagram } from "./Icons";

export default function Footer({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const f = t.footer;
  return (
    <footer className="mt-auto bg-slate text-white/80">
      <div className="container-site grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_auto]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-white.svg" alt="Tickets 2000" width={200} height={84} className="h-[84px] w-auto" />
          <p className="mt-6 text-[15px] text-white">{t.hero}</p>
        </div>
        <div>
          <div className="mb-3 font-display text-lg font-semibold text-white">{f.about}</div>
          <ul className="space-y-2 text-[15px]">
            <li>
              <Link href={pageUrl("partner", lang)} className="hover:text-lime">
                {f.becomePartner}
              </Link>
            </li>
            <li>
              <Link href={pageUrl("sitemap", lang)} className="hover:text-lime">
                {f.sitemap}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-display text-lg font-semibold text-white">{f.contactUs}</div>
          <ul className="space-y-2 text-[15px]">
            <li>
              <a href={`tel:${site.phone}`} className="hover:text-lime">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-lime">
                {site.email}
              </a>
            </li>
            <li>
              <Link href={pageUrl("contact", lang)} className="hover:text-lime">
                {f.contactUs}
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex gap-4 md:justify-end">
          <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-lime">
            <IconFacebook className="size-7" />
          </a>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-lime">
            <IconInstagram className="size-7" />
          </a>
        </div>
      </div>
      <div className="container-site">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/15 py-5 text-center text-sm">
          <Link href={pageUrl("privacy", lang)} className="hover:text-lime">
            {f.privacy}
          </Link>
          <Link href={pageUrl("terms", lang)} className="hover:text-lime">
            {f.terms}
          </Link>
          <Link href={pageUrl("refund", lang)} className="hover:text-lime">
            {f.refund}
          </Link>
          <span>
            © {site.copyrightYear}. {site.copyrightHolder} {f.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
