import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProductBySlug, getProductReviews, createReview, hasUserPurchasedProduct } from "@/lib/data";
import { Star, Download, Shield, Tag } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

// Client component for interactive parts (gallery + reviews + purchase)
import ProductClient from "./ProductClient";

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link href="/marketplace" className="mt-4 inline-block text-accent">Browse marketplace →</Link>
      </div>
    );
  }

  // Load real reviews
  const reviews = await getProductReviews(product.id);
  // For demo, determine a current buyer id (would come from session)
  const demoBuyerId = "u4"; // janebuyer from seed
  const isVerifiedBuyer = await hasUserPurchasedProduct(demoBuyerId, product.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <ProductClient 
        product={product as any} 
        reviews={reviews as any} 
        isVerifiedBuyer={isVerifiedBuyer} 
        currentBuyerId={demoBuyerId}
      />
    </div>
  );
}
