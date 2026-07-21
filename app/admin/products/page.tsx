"use client";

import { useEffect, useState } from "react";
import { getPendingProducts, approveProduct, rejectProduct } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getPendingProducts().then(setProducts);
  }, []);

  const approve = async (id: string) => {
    await approveProduct(id);
    setProducts(p => p.filter(x => x.id !== id));
    toast.success("Product approved");
  };

  const reject = async (id: string) => {
    await rejectProduct(id);
    setProducts(p => p.filter(x => x.id !== id));
    toast.error("Product rejected");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">Product Moderation</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <p className="text-sm text-muted-foreground mb-4">Pending products waiting for review. Approve to make visible in marketplace.</p>

      <div className="border rounded-2xl overflow-hidden">
        {products.length === 0 && <div className="p-8 text-muted-foreground">No pending products. Sellers can upload via /seller/upload.</div>}
        {products.map(p => (
          <div key={p.id} className="flex flex-col md:flex-row justify-between p-4 border-b last:border-b-0 gap-3">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground">
                by {p.seller?.username || p.sellerId} • ${p.price} • {p.category}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => approve(p.id)} className="btn-primary">Approve</Button>
              <Button size="sm" variant="outline" onClick={() => reject(p.id)}>Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
