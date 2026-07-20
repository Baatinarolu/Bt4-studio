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
    toast.success("Approved");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">Product Moderation</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="border rounded-2xl overflow-hidden">
        {products.length === 0 && <div className="p-8 text-muted-foreground">No pending products.</div>}
        {products.map(p => (
          <div key={p.id} className="flex justify-between p-4 border-b last:border-b-0">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.seller?.username}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => approve(p.id)}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => { /* reject stub */ }}>Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
