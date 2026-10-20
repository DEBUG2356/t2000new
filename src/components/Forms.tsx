"use client";

import Link from "next/link";
import { useState } from "react";

type NewsletterText = { title: string; name: string; email: string; submit: string; consent: string; policy: string; thanks: string };

export function Newsletter({ t, lang, privacyUrl }: { t: NewsletterText; lang: string; privacyUrl: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("busy");
    const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(fd), lang }) }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  };
  return (
    <section className="bg-[#f6f6f6] py-12">
      <div className="container-site">
        <div className="mb-6 flex items-center justify-center gap-2 text-center font-display text-[1.6em] font-semibold text-ink">
          {t.title}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/storage/flags/thumb/france_991x991.webp" alt="" width={24} height={16} className="h-4 w-6" />
        </div>
        {state === "done" ? (
          <p className="text-center text-lg text-[#4b7a0a]">{t.thanks}</p>
        ) : (
          <form onSubmit={onSubmit} className="mx-auto max-w-[740px]">
            <div className="grid gap-2.5 sm:grid-cols-3">
              <input name="name" required placeholder={t.name} className="field" />
              <input name="email" type="email" required placeholder={t.email} className="field" />
              <button disabled={state === "busy"} className="rounded bg-[#999] px-4 py-2 text-white transition-colors hover:bg-[#777] disabled:opacity-60">
                {t.submit}
              </button>
            </div>
            <label className="mt-3 flex items-start justify-center gap-2 text-center text-[15px] text-[#666]">
              <input type="checkbox" required className="mt-1 accent-lime-dark" />
              <span>
                {t.consent}{" "}
                <Link href={privacyUrl} className="underline">
                  {t.policy}
                </Link>
                .
              </span>
            </label>
          </form>
        )}
      </div>
    </section>
  );
}

type ContactText = { title: string; name: string; email: string; subject: string; message: string; send: string; sent: string; error: string };

export function ContactForm({ t, consent, policy, privacyUrl, lang }: { t: ContactText; consent: string; policy: string; privacyUrl: string; lang: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("busy");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(fd), lang }) }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  };
  if (state === "done") return <p className="rounded-md bg-lime-soft/60 p-5 text-[#3d5a07]">{t.sent}</p>;
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder={t.name} className="field" />
        <input name="email" type="email" required placeholder={t.email} className="field" />
      </div>
      <input name="subject" required placeholder={t.subject} className="field" />
      <textarea name="message" required rows={6} placeholder={t.message} className="field resize-y" />
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex items-start gap-2 text-[15px] text-[#666]">
        <input type="checkbox" required className="mt-1 accent-lime-dark" />
        <span>
          {consent}{" "}
          <Link href={privacyUrl} className="underline">
            {policy}
          </Link>
          .
        </span>
      </label>
      {state === "error" && <p className="text-sm text-brand-red">{t.error}</p>}
      <button disabled={state === "busy"} className="btn-lime px-8 py-2 disabled:opacity-60">
        {t.send}
      </button>
    </form>
  );
}
