"use client";

import Link from "next/link";

export default function AdminDisputes() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">Disputes &amp; Refunds</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="border rounded-2xl p-8 text-sm text-muted-foreground">
        Disputes list (from buyer reports via bot). Admin can issue refunds here.
        <div className="mt-4">No open disputes in demo.</div>
      </div>
    </div>
  );
}
