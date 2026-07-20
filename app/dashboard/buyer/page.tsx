"use client";

import { useState } from "react";
import { orders, products } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Download, Key, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState<"purchases" | "downloads" | "messages">("purchases");

  // Mock buyer purchases (u4)
  const buyerOrders = orders.filter(o => o.buyer_id === "u4");

  const handleDownload = (order: any) => {
    toast.success("Download started", { description: `Downloading ${order.product?.title}` });
    // In real app: fetch signed URL from backend
    setTimeout(() => {
      window.open("https://example.com/files/demo-download.zip", "_blank");
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl tracking-tighter font-semibold">My Purchases</h1>
        <p className="text-muted-foreground">Welcome back, janebuyer</p>
      </div>

      <div className="flex gap-2 border-b mb-8">
        {(["purchases", "downloads", "messages"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-sm font-medium border-b-2 transition ${activeTab === tab ? "border-foreground" : "border-transparent text-muted-foreground"}`}>
            {tab === "purchases" ? "Orders" : tab === "downloads" ? "Downloads" : "Messages"}
          </button>
        ))}
      </div>

      {activeTab === "purchases" && (
        <div>
          {buyerOrders.length === 0 ? (
            <div className="border border-dashed p-12 text-center rounded-3xl">
              <p>No purchases yet.</p>
              <a href="/marketplace" className="text-sm underline mt-1 inline-block">Explore the marketplace</a>
            </div>
          ) : (
            <div className="space-y-3">
              {buyerOrders.map(order => (
                <div key={order.id} className="border border-border rounded-2xl p-5 flex gap-6">
                  <div className="flex-1">
                    <div className="font-medium text-lg">{order.product?.title}</div>
                    <div className="text-sm text-muted-foreground flex gap-2 items-center mt-0.5">
                      <span>{order.product?.seller?.username}</span> • Purchased {formatDate(order.created_at)}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="font-mono text-sm bg-muted px-3 py-px rounded">{order.license_key}</div>
                      <span className="text-xs px-2 py-px rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Active</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold tabular-nums text-lg tracking-tight">{formatCurrency(order.amount)}</div>
                    <Button size="sm" className="mt-3 gap-1.5" onClick={() => handleDownload(order)}>
                      <Download className="h-4 w-4" /> Download
                    </Button>
                    <div className="text-xs text-muted-foreground mt-1">2 / 5 downloads used</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "downloads" && (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">Download history</div>
          {buyerOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between border rounded-xl p-4">
              <div>
                {order.product?.title} • <span className="font-mono text-xs">{order.license_key}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="text-emerald-600 flex items-center gap-1"><Clock className="h-3 w-3" /> 28 days remaining</div>
                <Button size="sm" variant="outline" onClick={() => handleDownload(order)}>Re-download</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "messages" && (
        <div className="border border-border p-8 rounded-2xl text-sm">
          No messages yet. Use the product page to message the seller.
        </div>
      )}
    </div>
  );
}
