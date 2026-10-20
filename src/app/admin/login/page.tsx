import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/server/admin-auth";

export const metadata = { title: "Belépés" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-7 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-color.svg" alt="Tickets 2000" className="mx-auto h-14 rounded bg-slate p-2" />
        <h1 className="mt-5 text-center text-lg font-semibold">Admin belépés</h1>
        <LoginForm />
      </div>
    </div>
  );
}
