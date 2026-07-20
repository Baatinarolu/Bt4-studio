"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  getPendingProducts, approveProduct, rejectProduct, getAllApprovedProducts,
  getAllUsers, getAllOrders, refundOrder 
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPanel() {
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const pending = await getPendingProducts();
      const approved = await getAllApprovedProducts();
      const realUsers = await getAllUsers();
      const realOrders = await getAllOrders();

      setPendingProducts(pending || []);
      setAllProducts(approved || []);
      setUsers(realUsers.length > 0 ? realUsers : [
        { id: 'u1', username: 'sarahcodes', role: 'SELLER' },
        { id: 'u2', username: 'alexbuilds', role: 'SELLER' },
        { id: 'u4', username: 'janebuyer', role: 'BUYER' },
        { id: 'u5', username: 'admin', role: 'ADMIN' },
      ]);
      setOrders(realOrders || []);
    }
    load();
  }, []);

  const handleApprove = async (id: string) => {
    await approveProduct(id);
    setPendingProducts(prev => prev.filter(p => p.id !== id));
    const updated = await getAllApprovedProducts();
    setAllProducts(updated || []);
    toast.success("Product approved");
  };

  const handleReject = async (id: string) => {
    await rejectProduct(id);
    setPendingProducts(prev => prev.filter(p => p.id !== id));
    toast.error("Product rejected");
  };

  const handleRefund = async (orderId: string) => {
    await refundOrder(orderId);
    const updated = await getAllOrders();
    setOrders(updated || []);
    toast.success("Order refunded");
  };

  const totalGMV = allProducts.reduce((sum, p: any) => sum + ((p.sales_count || 0) * (p.price || 0)), 0);
  const pendingCount = pendingProducts.length;
  const activeSellers = users.filter(u => u.role === 'SELLER').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl tracking-tighter font-semibold">Admin Panel</h1>
          <p className="text-muted-foreground">BT4 Studio Platform Control</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total GMV (30d)</div>
          <div className="text-3xl font-semibold tracking-tighter tabular-nums">${totalGMV.toFixed(0)}</div>
        </div>
      </div>

      {/* Quick Admin Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-8 text-sm">
        <Link href="/admin/products" className="p-3 border rounded-xl hover:bg-muted text-center">Products</Link>
        <Link href="/admin/orders" className="p-3 border rounded-xl hover:bg-muted text-center">Orders</Link>
        <Link href="/admin/users" className="p-3 border rounded-xl hover:bg-muted text-center">Users</Link>
        <Link href="/admin/payouts" className="p-3 border rounded-xl hover:bg-muted text-center">Payouts</Link>
        <Link href="/admin/disputes" className="p-3 border rounded-xl hover:bg-muted text-center">Disputes</Link>
        <Link href="/admin/broadcast" className="p-3 border rounded-xl hover:bg-muted text-center">Broadcast</Link>
        <Link href="/admin/settings" className="p-3 border rounded-xl hover:bg-muted text-center">Settings</Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">Pending Products</div>
          <div className="text-4xl font-semibold tracking-tight mt-1">{pendingCount}</div>
        </div>
        <div className="border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">Active Sellers</div>
          <div className="text-4xl font-semibold tracking-tight mt-1">{activeSellers}</div>
        </div>
        <div className="border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">Total Orders</div>
          <div className="text-4xl font-semibold tracking-tight mt-1">{orders.length}</div>
        </div>
        <div className="border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">Total Users</div>
          <div className="text-4xl font-semibold tracking-tight mt-1">{users.length}</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Moderation */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Product Moderation</h3>
            <Link href="/admin/products" className="text-xs underline">Full queue →</Link>
          </div>
          <div className="border rounded-2xl overflow-hidden">
            {pendingProducts.length > 0 ? pendingProducts.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 border-b last:border-b-0 text-sm">
                <div className="truncate pr-4">{p.title}</div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" onClick={() => handleApprove(p.id)} className="btn-primary">Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(p.id)}>Reject</Button>
                </div>
              </div>
            )) : <div className="p-6 text-sm text-muted-foreground">No items pending.</div>}
          </div>
        </div>

        {/* Orders */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs underline">All orders →</Link>
          </div>
          <div className="border rounded-2xl overflow-hidden">
            {orders.length > 0 ? orders.slice(0, 4).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-4 border-b last:border-b-0 text-sm">
                <div className="truncate pr-4">{o.product?.title || 'Order'} — ${o.amount}</div>
                <div>
                  {o.status === 'COMPLETED' && (
                    <Button size="sm" variant="outline" onClick={() => handleRefund(o.id)}>Refund</Button>
                  )}
                </div>
              </div>
            )) : <div className="p-6 text-sm text-muted-foreground">No orders yet.</div>}
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        Platform fee 20% • Crypto payouts (USDT TRC20) • Telegram-native payments only
      </div>
    </div>
  );
}
