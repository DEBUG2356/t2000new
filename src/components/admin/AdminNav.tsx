"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Rendelések" },
  { href: "/admin/products", label: "Termékek" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1">
      {items.map((i) => {
        const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={`rounded px-3 py-1.5 text-sm font-semibold ${active ? "bg-white/15 text-lime" : "text-white hover:text-lime"}`}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
