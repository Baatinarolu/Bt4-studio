"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  const promoteToSeller = (id: string) => {
    // In real: call API to update role
    toast.success("User promoted to SELLER (demo)");
    setUsers(u => u.map(x => x.id === id ? { ...x, role: 'SELLER' } : x));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">User Management</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="border rounded-2xl overflow-hidden">
        {users.length === 0 && <div className="p-8 text-muted-foreground">No users.</div>}
        {users.map((u: any) => (
          <div key={u.id} className="flex justify-between p-4 border-b last:border-b-0 text-sm items-center">
            <div>
              <span className="font-medium">{u.username || u.email}</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] rounded bg-muted">{u.role}</span>
              {u.isSellerApproved && <span className="ml-1 text-emerald-600 text-xs">SELLER-APPROVED</span>}
            </div>
            <div className="flex gap-2">
              {u.role === 'BUYER' && (
                <Button size="sm" variant="outline" onClick={() => promoteToSeller(u.id)}>Promote to Seller</Button>
              )}
              <Button size="sm" variant="ghost">Details</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
