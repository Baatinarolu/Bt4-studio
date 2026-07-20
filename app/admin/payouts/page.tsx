"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPayouts() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">Payout Requests</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="border rounded-2xl p-8 text-sm">
        <p className="mb-4">Payouts (USDT TRC20) — admin approval flow.</p>
        <Button>Process next batch (demo)</Button>
      </div>
    </div>
  );
}
