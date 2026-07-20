"use client";

import { useEffect, useState } from "react";
import { getAllOrders, refundOrder } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    getAllOrders().then(setOrders);
  }, []);

  const refund = async (id: string) => {
    await refundOrder(id);
    setOrders(o => o.map(x => x.id === id ? {...x, status: "REFUNDED"} : x));
    toast.success("Refunded");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">Order Management</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="border rounded-2xl overflow-hidden">
        {orders.length === 0 && <div className="p-8 text-muted-foreground">No orders yet.</div>}
        {orders.map(o => (
          <div key={o.id} className="flex justify-between p-4 border-b text-sm">
            <div>{o.product?.title || "Product"} — ${o.amount} — {o.status}</div>
            <div>
              {o.status === "COMPLETED" && <Button size="sm" variant="outline" onClick={() => refund(o.id)}>Refund</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
