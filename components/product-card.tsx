"use client";

import Link from "next/link";
import { Star, Users } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="product-card bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col">
        {product.preview_url && (
          <div className="relative aspect-[16/9] bg-muted overflow-hidden">
            <img
              src={product.preview_url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 bg-background/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-medium border border-border">
              {product.category?.name}
            </div>
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-[15px] leading-tight tracking-[-0.015em] line-clamp-2 group-hover:text-accent transition-colors">
              {product.title}
            </h3>
            <div className="font-mono text-sm font-semibold text-right shrink-0 tabular-nums">
              {formatCurrency(product.price)}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="ml-1 font-medium text-foreground">{product.rating_avg}</span>
              </div>
              <span className="text-muted-foreground">({product.review_count})</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{product.sales_count.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <img
                src={product.seller?.avatar}
                alt={product.seller?.username}
                className="w-5 h-5 rounded-full border"
              />
              <span className="text-muted-foreground font-medium">{product.seller?.username}</span>
            </div>
            {product.seller?.verified && (
              <span className="text-emerald-600 text-[10px] px-1.5 py-px bg-emerald-50 dark:bg-emerald-950 rounded">VERIFIED</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
