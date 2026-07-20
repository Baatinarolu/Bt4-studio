"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Shield } from "lucide-react";

export default function ForSellers() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="max-w-3xl">
        <div className="uppercase text-xs tracking-[2px] text-muted-foreground mb-2">FOR CREATORS</div>
        <h1 className="text-6xl tracking-tighter font-semibold leading-none">Sell your work.<br />Keep 80% of revenue.</h1>
        <p className="mt-6 text-xl text-muted-foreground">Join thousands of developers monetizing their best code, templates, and tools.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-14">
        {[
          { icon: <TrendingUp className="h-6 w-6" />, title: "Zero listing fees", desc: "Upload unlimited products. Only pay 20% when you sell." },
          { icon: <Users className="h-6 w-6" />, title: "Instant global reach", desc: "Get discovered by 42k developers across Telegram and web." },
          { icon: <Shield className="h-6 w-6" />, title: "Built-in trust", desc: "Verified badges, reviews, and secure Telegram payments." },
        ].map((f, i) => (
          <div key={i} className="border p-8 rounded-3xl">
            <div className="mb-5">{f.icon}</div>
            <div className="font-semibold text-xl tracking-tight mb-1">{f.title}</div>
            <p className="text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/seller/dashboard">
          <Button size="lg" className="btn-primary px-9 h-12">Go to Seller Dashboard <ArrowRight className="ml-2" /></Button>
        </Link>
        <div className="text-xs text-muted-foreground mt-4">Takes less than 3 minutes to list your first product</div>
      </div>
    </div>
  );
}
