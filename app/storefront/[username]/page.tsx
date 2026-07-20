"use client";

import { useParams } from "next/navigation";
import { products, users } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SellerStorefront() {
  const params = useParams<{ username: string }>();
  const seller = users.find(u => u.username === params.username);
  const sellerProducts = products.filter(p => p.seller?.username === params.username && p.status === "approved");

  if (!seller) {
    return <div className="max-w-4xl mx-auto p-12 text-center">Seller not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex gap-6 items-start mb-10">
        <img src={seller.avatar} alt="" className="w-20 h-20 rounded-2xl" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl tracking-tighter font-semibold">{seller.username}</h1>
            {seller.verified && <span className="text-xs px-3 py-px bg-emerald-100 text-emerald-700 rounded-full">VERIFIED</span>}
          </div>
          <p className="text-muted-foreground mt-1">{seller.bio}</p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <a href={`https://github.com/${seller.github}`} target="_blank" className="text-accent hover:underline">GitHub</a>
            <span>{sellerProducts.length} products</span>
            <span>4.9 average rating</span>
          </div>
        </div>
        <Button variant="outline">Message seller</Button>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div className="font-semibold text-lg">Products by {seller.username}</div>
        <Link href="/marketplace" className="text-sm text-muted-foreground">View all products →</Link>
      </div>

      {sellerProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sellerProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-muted-foreground">This seller has no published products yet.</div>
      )}
    </div>
  );
}
