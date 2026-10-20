"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type SearchItem = { id: number; title: string; alt: string; location: string; url: string; cover: string };
type T = { title: string; placeholder: string; hint: string; none: string };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function SearchResults({ items, t }: { items: SearchItem[]; t: T }) {
  const sp = useSearchParams();
  const router = useRouter();
  const q0 = sp.get("q") || "";
  const [q, setQ] = useState(q0);
  const terms = norm(q0).split(/\s+/).filter(Boolean);
  const results = terms.length ? items.filter((p) => terms.every((w) => norm(`${p.title} ${p.alt} ${p.location}`).includes(w))) : [];
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`?q=${encodeURIComponent(q.trim())}`);
        }}
        className="mb-6 flex max-w-xl gap-2"
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.placeholder} className="field" />
        <button className="btn-lime px-5">{t.title}</button>
      </form>
      {!q0 ? (
        <p className="text-[#666]">{t.hint}</p>
      ) : results.length === 0 ? (
        <p className="text-[#666]">{t.none}</p>
      ) : (
        <ul className="divide-y divide-[#eee]">
          {results.map((p) => (
            <li key={p.id}>
              <Link href={p.url} className="flex items-center gap-4 py-3 hover:text-brand-red">
                <span className="relative size-16 shrink-0 overflow-hidden rounded bg-paper">
                  <Image src={p.cover} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span>
                  <span className="block font-semibold">{p.title}</span>
                  <span className="text-sm text-muted uppercase">{p.location}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
