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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">User Management</h1>
        <Link href="/admin" className="text-sm underline">← Back to Admin</Link>
      </div>

      <div className="border rounded-2xl overflow-hidden">
        {users.length === 0 && <div className="p-8 text-muted-foreground">No users.</div>}
        {users.map(u => (
          <div key={u.id} className="flex justify-between p-4 border-b text-sm">
            <div>{u.username} — {u.role}</div>
            <Button size="sm" variant="ghost">View</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
