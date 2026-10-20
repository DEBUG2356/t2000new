import Link from "next/link";
import { logout } from "../actions";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/server/admin-auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-slate text-white shadow">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-6 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-color.svg" alt="" className="h-9" />
            <span className="text-sm text-white/70">admin</span>
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-4 text-sm">
            <a href="/" target="_blank" className="text-white/80 hover:text-lime">
              Weboldal ↗
            </a>
            <form action={logout}>
              <button className="rounded border border-white/30 px-3 py-1 hover:border-lime hover:text-lime">Kilépés</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-4 md:p-6">{children}</main>
    </div>
  );
}
