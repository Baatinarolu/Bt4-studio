"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminBroadcast() {
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");

  const sendBroadcast = () => {
    if (!message.trim()) return;
    toast.success(`Broadcast sent to ${target} (demo - uses Telegram bot in production)`);
    setMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">Broadcast Messages</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="border border-border rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm mb-1.5">Send to</label>
          <select value={target} onChange={e => setTarget(e.target.value)} className="bg-background border border-border rounded px-3 py-2">
            <option value="all">All users</option>
            <option value="sellers">Sellers only</option>
            <option value="buyers">Buyers only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1.5">Message</label>
          <textarea 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            className="w-full h-32 bg-background border border-border rounded p-3"
            placeholder="Platform update: ..."
          />
        </div>

        <Button onClick={sendBroadcast} className="btn-primary">Send Broadcast</Button>
        <p className="text-xs text-muted-foreground">In production this uses the Telegram bot to send messages (rate limited).</p>
      </div>
    </div>
  );
}
