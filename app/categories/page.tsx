"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categories } from "@/lib/db";
import { getAllApprovedProducts } from "@/lib/data";
import { Product } from "@/lib/types";

export default function Categories() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getAllApprovedProducts();
      setProducts(data);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl tracking-tighter font-semibold mb-2">Browse by category</h1>
      <p className="text-muted-foreground mb-10">High-quality, production-ready digital goods</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter((p: any) => 
            (p.category_id === cat.id || (p.category && p.category.toLowerCase() === cat.slug.toLowerCase())) && 
            (p.status === "approved" || p.status === "APPROVED")
          ).length;
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
