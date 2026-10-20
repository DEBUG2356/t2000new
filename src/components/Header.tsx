"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/site";
import { useCurrency, type Cur } from "./Currency";
import { IconChevron, IconClose, IconMenu, IconSearch } from "./Icons";

type Props = {
  lang: Lang;
  home: string;
  nav: { label: string; href: string }[];
  alternates: Record<Lang, string>;
  searchUrl: string;
  searchPlaceholder: string;
};

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, close]);
  return ref;
}

function Dropdown({ label, children, align = "right" }: { label: React.ReactNode; children: (close: () => void) => React.ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useOutside(open, close);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 py-2 text-[15px] text-white hover:text-lime" aria-expanded={open}>
        {label}
        <IconChevron className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className={`absolute top-full z-50 mt-1 min-w-40 overflow-hidden rounded-md bg-white py-1 text-ink shadow-lg ring-1 ring-black/5 ${align === "right" ? "right-0" : "left-0"}`}>
          {children(close)}
        </div>
      )}
    </div>
  );
}

export default function Header({ lang, home, nav, alternates, searchUrl, searchPlaceholder }: Props) {
  const router = useRouter();
  const { cur, setCur } = useCurrency();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search) inputRef.current?.focus();
  }, [search]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(false);
    setMenu(false);
    router.push(`${searchUrl}?q=${encodeURIComponent(q.trim())}`);
  };

  const L = LANG_LABEL[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
      <div className="container-site flex h-[72px] items-center gap-6">
        <Link href={home} aria-label="logo" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-color.svg" alt="Tickets 2000" width={120} height={50} className="h-[50px] w-auto" />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-3 py-2 font-display text-[15px] font-medium tracking-wide text-white transition-colors hover:text-lime">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <button type="button" onClick={() => setSearch(true)} className="p-2 text-white hover:text-lime" aria-label="Search">
            <IconSearch className="size-5" />
          </button>
          <div className="hidden items-center gap-4 sm:flex">
            <Dropdown
              label={
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={L.flag} alt={L.code} width={24} height={16} className="h-4 w-6 object-cover" /> {L.code}
                </>
              }
            >
              {(close) =>
                LANGS.map((l) => (
                  <Link key={l} href={alternates[l]} onClick={close} className={`flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-paper ${l === lang ? "font-semibold" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={LANG_LABEL[l].flag} alt="" width={24} height={16} className="h-4 w-6 object-cover" />
                    {LANG_LABEL[l].name}
                  </Link>
                ))
              }
            </Dropdown>
            <Dropdown label={<>{cur === "EUR" ? "€ EUR" : "$ USD"}</>}>
              {(close) =>
                (["EUR", "USD"] as Cur[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCur(c);
                      close();
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-paper ${c === cur ? "font-semibold" : ""}`}
                  >
                    {c === "EUR" ? "€ EUR" : "$ USD"}
                  </button>
                ))
              }
            </Dropdown>
          </div>
          <button type="button" onClick={() => setMenu((m) => !m)} className="p-1 text-white lg:hidden" aria-label="Menu" aria-expanded={menu}>
            {menu ? <IconClose className="size-7" /> : <IconMenu className="size-7" />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="border-t border-white/10 bg-slate pb-4 lg:hidden">
          <nav className="container-site flex flex-col">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="border-b border-white/10 py-3 font-display text-lg text-white">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="container-site mt-3 flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <Link key={l} href={alternates[l]} onClick={() => setMenu(false)} className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-sm text-white ${l === lang ? "border-lime" : "border-white/20"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LANG_LABEL[l].flag} alt="" width={20} height={14} className="h-3.5 w-5 object-cover" />
                {LANG_LABEL[l].code}
              </Link>
            ))}
            {(["EUR", "USD"] as Cur[]).map((c) => (
              <button key={c} type="button" onClick={() => setCur(c)} className={`rounded border px-2.5 py-1.5 text-sm text-white ${c === cur ? "border-lime" : "border-white/20"}`}>
                {c === "EUR" ? "€ EUR" : "$ USD"}
              </button>
            ))}
          </div>
        </div>
      )}

      {search && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-28" onClick={() => setSearch(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="flex w-full max-w-2xl items-center gap-2 rounded-md bg-white p-2 shadow-2xl">
            <IconSearch className="ml-2 size-5 text-muted" />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="flex-1 px-2 py-2.5 text-lg outline-none" />
            <button type="button" onClick={() => setSearch(false)} className="p-2 text-muted hover:text-ink" aria-label="Close">
              <IconClose className="size-5" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
