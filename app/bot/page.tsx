"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TelegramBot() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-5xl tracking-tighter font-semibold mb-2">BT4 Studio Telegram Bot</h1>
      <p className="text-xl text-muted-foreground mb-8">@BT4 StudioBot</p>

      <div className="prose dark:prose-invert">
        <h2>How it works</h2>
        <p>The bot powers our entire checkout experience. All purchases happen through Telegram Payments for instant, frictionless delivery.</p>

        <h3>Available Commands</h3>
        <ul>
          <li><code>/start</code> — Welcome + marketplace link</li>
          <li><code>/start purchase_TOKEN</code> — Start a purchase from the website</li>
          <li><code>/purchases</code> — View your purchases and download links</li>
          <li><code>/sales</code> — Seller view of recent sales</li>
          <li><code>/balance</code> — Seller earnings balance</li>
          <li><code>/withdraw</code> — Request a payout</li>
        </ul>

        <h3>Inline Product Sharing</h3>
        <p>In any chat, type <code>@BT4 StudioBot search term</code> to instantly share products.</p>

        <h3>Setup Instructions (for production)</h3>
        <ol>
          <li>Create a Telegram Bot with @BotFather</li>
          <li>Set webhook to <code>https://yourdomain.com/api/telegram-bot</code></li>
          <li>Enable Telegram Payments for your bot</li>
          <li>Configure environment variables (see README)</li>
        </ol>
      </div>

      <div className="mt-10">
        <Link href="https://t.me/BT4 StudioBot" target="_blank">
          <Button size="lg" className="btn-primary">Open @BT4 StudioBot</Button>
        </Link>
        <Link href="/marketplace" className="ml-4 text-sm">or go back to marketplace</Link>
      </div>
    </div>
  );
}
