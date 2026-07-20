"use client";

import { useState } from "react";
import { products, users, orders } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPanel() {
  const [pendingProducts, setPendingProducts] = useState(
    products.filter(p => p.status === "pending" || p.status === "draft")
  );
  const [allProducts] = useState(products);

  const handleApprove = (id: string) => {
    toast.success("Product approved and published");
    // In real app: update DB and refresh
  };

  const handleReject = (id: string) => {
    toast.error("Product rejected");
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-4xl tracking-tighter font-semibold">Admin Panel</h1>
          <p className="text-muted-foreground">Platform moderation and insights</p>
        </div>
        <div className="text-right text-xs">
          <div>Platform revenue (20%)</div>
          <div className="font-mono text-2xl font-semibold tracking-tighter">${(totalRevenue * 0.2).toFixed(0)}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Stats */}
        <div className="md:col-span-12 grid grid-cols-4 gap-4">
          <div className="border p-5 rounded-2xl">
            <div className="text-xs text-muted-foreground">Total Users</div>
            <div className="text-4xl font-semibold tracking-tight">{users.length}</div>
          </div>
          <div className="border p-5 rounded-2xl">
            <div className="text-xs text-muted-foreground">Approved Products</div>
            <div className="text-4xl font-semibold tracking-tight">{allProducts.filter(p => p.status === "approved").length}</div>
          </div>
          <div className="border p-5 rounded-2xl">
            <div className="text-xs text-muted-foreground">Orders</div>
            <div className="text-4xl font-semibold tracking-tight">{orders.length}</div>
          </div>
          <div className="border p-5 rounded-2xl">
            <div className="text-xs text-muted-foreground">Pending Reviews</div>
            <div className="text-4xl font-semibold tracking-tight text-amber-600">{pendingProducts.length + 3}</div>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="md:col-span-7">
          <h3 className="font-semibold mb-3 text-lg tracking-tight">Moderation Queue</h3>
          <div className="border border-border rounded-2xl overflow-hidden">
            {allProducts.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">by {p.seller?.username} • {p.category?.name}</div>
                </div>
                <div className="flex gap-2">
                  {p.status !== "approved" ? (
                    <>
                      <Button size="sm" onClick={() => handleApprove(p.id)} className="btn-primary">Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(p.id)}>Reject</Button>
                    </>
                  ) : (
                    <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">Live</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Management */}
        <div className="md:col-span-5">
          <h3 className="font-semibold mb-3 text-lg tracking-tight">Recent Users</h3>
          <div className="border rounded-2xl overflow-hidden">
            {users.slice(0, 6).map(u => (
              <div key={u.id} className="px-4 py-3 flex items-center gap-3 border-b last:border-none text-sm">
                <img src={u.avatar} className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  {u.username} <span className="text-muted-foreground text-xs">• {u.role}</span>
                </div>
                <Button size="sm" variant="ghost">View</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Settings */}
        <div className="md:col-span-12 border rounded-2xl p-6 mt-2">
          <h4 className="font-medium mb-3">Platform settings</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>Platform fee: <span className="font-mono font-semibold">20%</span></div>
            <div>Min payout: <span className="font-mono font-semibold">$25</span></div>
            <div>Review required: <span className="font-semibold text-emerald-600">ON</span></div>
            <div>Telegram bot: <span className="font-semibold">Active</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
