"use client";

import { useEffect, useState } from "react";
import { getAllOrders, refundOrder, completeOrder, updateOrderPayment } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    getAllOrders().then(setOrders);
  }, []);

  const refresh = async () => {
    const data = await getAllOrders();
    setOrders(data || []);
  };

  const refund = async (id: string) => {
    await refundOrder(id);
    await refresh();
    toast.success("Order refunded");
  };

  const confirmPayment = async (id: string, hasProof?: boolean) => {
    // Mark payment received (from manual proof) and complete
    await updateOrderPayment(id, hasProof ? "ADMIN_CONFIRMED_MANUAL_PROOF" : undefined, "admin");
    const completed = await completeOrder(id);
    await refresh();
    toast.success("Payment confirmed — order completed. Buyer notified via Telegram.");
  };

  const markProofReceived = async (id: string) => {
    await updateOrderPayment(id, "MANUAL_PROOF_RECEIVED_FROM_BOT", "admin");
    await refresh();
    toast.success("Proof recorded. Ready to confirm.");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">Order Management</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        MVP flow: Buyer pays via Telegram → sends proof → admin confirms here → order completed + download delivered.
      </div>

      <div className="border rounded-2xl overflow-hidden">
        {orders.length === 0 && <div className="p-8 text-muted-foreground">No orders yet.</div>}
        {orders.map((o: any) => (
          <div key={o.id} className="flex flex-col md:flex-row justify-between p-4 border-b last:border-b-0 gap-3 text-sm">
            <div className="flex-1 min-w-0">
              <div className="font-medium">{o.product?.title || "Product"} — ${o.amount}</div>
              <div className="text-xs text-muted-foreground">
                Buyer: {o.buyer?.username || o.buyerId} • {o.status}
                {o.paymentProof && <span className="ml-2 text-emerald-600">• Proof: {o.paymentProof.slice(0, 28)}...</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {o.status === 'PENDING' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => markProofReceived(o.id)}>Mark proof received</Button>
                  <Button size="sm" onClick={() => confirmPayment(o.id, !!o.paymentProof)}>Confirm payment &amp; complete</Button>
                </>
              )}
              {(o.status === 'COMPLETED' || o.status === 'PAYMENT_RECEIVED') && (
                <Button size="sm" variant="outline" onClick={() => refund(o.id)}>Refund</Button>
              )}
              {o.status === 'PAYMENT_RECEIVED' && (
                <Button size="sm" onClick={() => confirmPayment(o.id)}>Complete order</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Telegram bot now collects proof automatically. Use this page to confirm and trigger delivery.
      </div>
    </div>
  );
}
