"use client";

import { useState } from "react";
import { IconClose, IconShare } from "../Icons";

export default function Share({ url, title, label, t }: { url: string; title: string; label: string; t: { copy: string; copied: string; email: string } }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const links = [
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "X / Twitter", href: `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(title)}` },
    { name: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${u}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { name: t.email, href: `mailto:?subject=${encodeURIComponent(title)}&body=${u}` },
  ];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-[15px] hover:text-brand-red">
        <IconShare className="size-4" /> {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h5 className="text-lg font-semibold">{label}</h5>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <IconClose className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {links.map((l) => (
                <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded border border-[#e3e3e3] px-3 py-2.5 text-center text-sm hover:border-lime">
                  {l.name}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(url);
                  setCopied(true);
                }}
                className="rounded border border-[#e3e3e3] px-3 py-2.5 text-sm hover:border-lime"
              >
                {copied ? t.copied : t.copy}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
