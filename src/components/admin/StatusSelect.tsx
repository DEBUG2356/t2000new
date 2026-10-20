"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/types";

const COLORS: Record<OrderStatus, string> = {
  paid: "bg-[#dcfce7] text-[#166534]",
  pending: "bg-[#fef9c3] text-[#854d0e]",
  cancelled: "bg-[#fee2e2] text-[#991b1b]",
  refunded: "bg-[#e5e7eb] text-[#374151]",
};

export default function StatusSelect({ id, value }: { id: string; value: OrderStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value as OrderStatus;
        if (!confirm(`Biztosan átállítod a státuszt erre: ${v}?`)) return;
        start(async () => {
          await setOrderStatus(id, v);
          router.refresh();
        });
      }}
      className={`rounded px-2 py-1 text-xs font-semibold ${COLORS[value]} disabled:opacity-50`}
    >
      <option value="paid">Fizetve</option>
      <option value="pending">Fizetésre vár</option>
      <option value="cancelled">Törölve</option>
      <option value="refunded">Visszatérítve</option>
    </select>
  );
}
