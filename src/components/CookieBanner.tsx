"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type T = { title: string; text: string; policy: string; accept: string; customize: string; necessary: string; analytics: string; marketing: string; save: string };
const KEY = "t2000:consent";

export default function CookieBanner({ t, privacyUrl }: { t: T; privacyUrl: string }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the banner depends on a stored choice
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const save = (p: { analytics: boolean; marketing: boolean }) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...p, at: Date.now() }));
    } catch {}
    window.dispatchEvent(new CustomEvent("t2000:consent", { detail: p }));
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md">
      <div className="rounded-lg bg-[#333] p-5 text-center text-white shadow-2xl">
        <div className="mb-2 text-lg font-bold">{t.title}</div>
        <p className="text-sm leading-relaxed text-white/90">{t.text}</p>
        <Link href={privacyUrl} className="mt-2 inline-block text-sm underline">
          {t.policy}
        </Link>
        {custom && (
          <div className="mt-4 space-y-2 rounded bg-white/5 p-3 text-left text-sm">
            <label className="flex items-center gap-2 opacity-70">
              <input type="checkbox" checked disabled /> {t.necessary}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })} className="accent-lime" /> {t.analytics}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })} className="accent-lime" /> {t.marketing}
            </label>
          </div>
        )}
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={() => save({ analytics: true, marketing: true })} className="bg-lime px-4 py-1.5 text-sm font-bold text-white">
            {t.accept}
          </button>
          {custom ? (
            <button type="button" onClick={() => save(prefs)} className="border border-white/50 px-3 py-1.5 text-sm text-white/90">
              {t.save}
            </button>
          ) : (
            <button type="button" onClick={() => setCustom(true)} className="border border-white/50 px-3 py-1.5 text-sm text-white/80">
              {t.customize}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
