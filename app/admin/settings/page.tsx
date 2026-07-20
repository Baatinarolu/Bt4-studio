"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">Platform Settings</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-2xl p-6">
          <h4 className="font-medium mb-4">Platform Wallet Addresses</h4>
          <div className="space-y-3 text-sm">
            <div>USDT TRC20: <span className="font-mono">TE7p...xYz9</span></div>
            <div>USDT ERC20: <span className="font-mono">0x...</span></div>
            <div>BTC: <span className="font-mono">bc1q...</span></div>
          </div>
        </div>

        <div className="border rounded-2xl p-6">
          <h4 className="font-medium mb-4">Fees &amp; Limits</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Platform fee: <span className="font-semibold">20%</span></div>
            <div>Minimum payout: <span className="font-semibold">$25</span></div>
            <div>Download limit: <span className="font-semibold">5</span></div>
            <div>Download expiry: <span className="font-semibold">7 days</span></div>
          </div>
        </div>

        <Button className="w-fit">Save Settings (demo)</Button>
      </div>
    </div>
  );
}
