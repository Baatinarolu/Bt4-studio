"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { getAllApprovedProducts } from "@/lib/data";
import { Plus, TrendingUp, DollarSign, Users, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Product } from "@/lib/types";

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"products" | "analytics" | "payouts">("products");
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = session?.user as any;
  const isSellerSetupComplete = true;

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const all = await getAllApprovedProducts();
      
      // Filter by current logged-in seller
      // In production: use user.id from session
      const sellerId = user?.id || "u1"; // fallback for demo accounts
      const mine = all.filter(p => p.seller_id === sellerId || p.seller?.username === (user?.name?.toLowerCase() || "sarahcodes"));
      
      setSellerProducts(mine.length > 0 ? mine : all.slice(0, 4));
      setIsLoading(false);
    }
    load();
  }, [user]);

  if (!isSellerSetupComplete) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold mb-4">Finish your seller setup</h1>
        <p className="text-muted-foreground mb-8">You need to connect GitHub and Stripe before publishing products.</p>
        <Link href="/seller/setup">
          <Button size="lg" className="btn-primary px-8">Complete Seller Setup →</Button>
        </Link>
      </div>
    );
  }

  const totalRevenue = sellerProducts.reduce((sum, p) => sum + (p.sales_count * p.price), 0);
  const totalSales = sellerProducts.reduce((sum, p) => sum + p.sales_count, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-9">
        <div>
          <h1 className="text-4xl tracking-tighter font-semibold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "seller"} • 4.9 ★</p>
        </div>
        <Link href="/seller/upload">
          <Button className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> Upload new product
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 mb-8 border-b">
        {(["products", "analytics", "payouts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-9">
        <div className="stat-card p-5 rounded-2xl">
          <div className="flex justify-between text-sm mb-1 text-muted-foreground">Total Revenue <DollarSign className="h-4 w-4" /></div>
          <div className="text-4xl font-semibold tracking-tighter tabular-nums">{formatCurrency(totalRevenue)}</div>
          <div className="text-emerald-600 text-xs mt-1">+32% from last month</div>
        </div>
        <div className="stat-card p-5 rounded-2xl">
          <div className="flex justify-between text-sm mb-1 text-muted-foreground">Total Sales <Users className="h-4 w-4" /></div>
          <div className="text-4xl font-semibold tracking-tighter tabular-nums">{totalSales}</div>
          <div className="text-emerald-600 text-xs mt-1">+18 this month</div>
        </div>
        <div className="stat-card p-5 rounded-2xl">
          <div className="flex justify-between text-sm mb-1 text-muted-foreground">Avg Rating <TrendingUp className="h-4 w-4" /></div>
          <div className="text-4xl font-semibold tracking-tighter tabular-nums">4.8</div>
          <div className="text-xs text-muted-foreground mt-1">from recent sales</div>
        </div>
        <div className="stat-card p-5 rounded-2xl">
          <div className="flex justify-between text-sm mb-1 text-muted-foreground">Platform Fee <Download className="h-4 w-4" /></div>
          <div className="text-4xl font-semibold tracking-tighter tabular-nums">{formatCurrency(totalRevenue * 0.2)}</div>
          <div className="text-xs text-muted-foreground mt-1">20% platform fee</div>
        </div>
      </div>

      {activeTab === "products" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Your products ({sellerProducts.length})</h3>
            <Link href="/seller/upload">
              <Button size="sm" variant="outline">New product</Button>
            </Link>
          </div>
          
          <div className="border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/70 text-xs">
                  <th>Product</th>
                  <th>Price</th>
                  <th>Sales</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sellerProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                    </td>
                    <td className="font-mono">{formatCurrency(p.price)}</td>
                    <td>{p.sales_count}</td>
                    <td>★ {p.rating_avg}</td>
                    <td>
                      <span className="px-2 py-px text-xs rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <Button size="sm" variant="ghost">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-border rounded-2xl p-6">
            <h4 className="font-medium mb-4">Revenue last 30 days</h4>
            <div className="h-56 flex items-end gap-2">
              {[28, 41, 35, 62, 54, 89, 72, 45, 91, 110, 65, 83].map((val, i) => (
                <div key={i} className="flex-1 bg-accent rounded-t" style={{ height: `${Math.max(val / 1.6, 12)}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs mt-2 text-muted-foreground">
              <div>Dec 18</div><div>Jan 16</div>
            </div>
          </div>

          <div className="border border-border rounded-2xl p-6">
            <h4 className="font-medium mb-4">Top traffic sources</h4>
            <div className="space-y-4 text-sm">
              {["Direct (42%)", "Twitter (29%)", "Product Hunt (15%)", "GitHub (8%)"].map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>{s}</div>
                  <div className="h-2 w-32 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${[42,29,15,8][i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "payouts" && (
        <div>
          <div className="flex justify-between mb-4">
            <div>
              <div className="text-sm">Available balance</div>
              <div className="text-4xl font-semibold tracking-tighter tabular-nums">{formatCurrency(totalRevenue * 0.8)}</div>
            </div>
            <Button className="btn-primary">Request payout →</Button>
          </div>

          <div className="text-xs text-muted-foreground mb-3">Next auto-payout: Jan 27, 2026</div>

          <div className="border border-border rounded-2xl p-1 text-sm">
            <table className="w-full">
              <thead><tr className="text-xs border-b"><th className="pl-4 py-3">Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td className="pl-4 py-3">Dec 20</td><td className="font-mono">$1,584.00</td><td><span className="text-emerald-600">Paid</span></td></tr>
                <tr><td className="pl-4 py-3">Jan 6</td><td className="font-mono">$742.00</td><td><span className="text-emerald-600">Paid</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
