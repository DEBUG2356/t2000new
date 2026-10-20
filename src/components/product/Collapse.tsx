"use client";

import { useState, type ReactNode } from "react";
import { IconChevron } from "../Icons";

export default function Collapse({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <section id={id} className="border-t border-[#dee2e6] px-0 pt-6 pb-4 lg:px-3">
      <button type="button" onClick={() => setOpen((o) => !o)} className="mb-3 flex items-center gap-2 font-poppins text-[1.45rem] font-semibold text-ink" aria-expanded={open}>
        {title}
        <IconChevron dir={open ? "up" : "down"} className="size-5" />
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}
