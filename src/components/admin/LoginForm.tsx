"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-5 space-y-3">
      <input name="password" type="password" required autoFocus placeholder="Jelszó" autoComplete="current-password" className="field" />
      {state?.error && <p className="text-sm text-brand-red">{state.error}</p>}
      <button disabled={pending} className="btn-lime w-full py-2.5 font-semibold disabled:opacity-60">
        {pending ? "…" : "Belépés"}
      </button>
    </form>
  );
}
