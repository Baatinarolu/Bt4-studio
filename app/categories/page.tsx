"use client";

import Link from "next/link";
import { categories, products } from "@/lib/db";

export default function Categories() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl tracking-tighter font-semibold mb-2">Browse by category</h1>
      <p className="text-muted-foreground mb-10">High-quality, production-ready digital goods</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter(p => p.category_id === cat.id && p.status === "approved").length;
          return (
            <Link 
              href={`/marketplace?category=${cat.slug}`} 
              key={cat.id}
              className="border border-border rounded-2xl p-8 hover:border-accent transition group flex gap-5"
            >
              <div className="text-6xl opacity-90">{cat.icon}</div>
              <div>
                <div className="font-semibold text-2xl tracking-tight group-hover:text-accent">{cat.name}</div>
                <div className="text-muted-foreground mt-1">{cat.description}</div>
                <div className="text-sm text-emerald-600 mt-5 font-medium">{count} products</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
