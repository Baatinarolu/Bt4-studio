"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserOrders, createReview } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Download, Clock, Star } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function MyPurchases() {
  const { data: session } = useSession();
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // In a real app we'd use session.user.id
  // For demo we use the buyer from the Telegram flow + fallback to u4
  const currentBuyerId = (session?.user as any)?.id || "demo-buyer";

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const orders = await getUserOrders(currentBuyerId);
        setBuyerOrders(orders || []);
      } catch (e) {
        setBuyerOrders([]);
      }
      setIsLoading(false);
    }
    loadOrders();
  }, [currentBuyerId]);

  const getDownloadCount = (orderId: string) => {
    return downloadCounts[orderId] || 0;
  };

  const handleDownload = (order: any) => {
    const currentCount = getDownloadCount(order.id);
    const maxDownloads = 5;

    if (currentCount >= maxDownloads) {
      toast.error("Download limit reached", {
        description: "Contact support for additional downloads.",
      });
      return;
    }

    // Increment count
    setDownloadCounts(prev => ({
      ...prev,
      [order.id]: currentCount + 1,
    }));

    if (order.download_token) {
      // Real signed download page
      window.open(`/download/${order.download_token}`, "_blank");
    } else {
      // Fallback for demo orders
      toast.success("Download started", {
        description: order.product?.title,
      });
      window.open("https://example.com/files/demo-product.zip", "_blank");
    }

    toast.success("Download initiated", {
      description: `${maxDownloads - (currentCount + 1)} downloads remaining`,
    });
  };

  const isExpired = (order: any) => {
    if (!order.download_expires) return false;
    return new Date(order.download_expires) < new Date();
  };

  const openReview = (order: any) => {
    setReviewingOrderId(order.id);
    setReviewText("");
    setReviewRating(5);
  };

  const submitReview = async (order: any) => {
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }
    try {
      await createReview({
        productId: order.productId || order.product_id || order.product?.id,
        buyerId: currentBuyerId,
        rating: reviewRating,
        comment: reviewText.trim(),
      });
      toast.success("Review submitted. Thank you!");
      setReviewingOrderId(null);
      setReviewText("");
    } catch (e) {
      toast.error("Could not submit review");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl tracking-tighter font-semibold">My Purchases</h1>
          <p className="text-muted-foreground mt-1">
            {buyerOrders.length} purchase{buyerOrders.length !== 1 ? "s" : ""} • Instant delivery via Telegram
          </p>
        </div>
        <Link href="/marketplace">
          <Button variant="outline">Browse more products</Button>
        </Link>
      </div>

      {buyerOrders.length === 0 ? (
        <div className="border border-dashed rounded-3xl p-16 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Download className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
          <p className="text-muted-foreground mb-6">When you buy products through Telegram, they will appear here.</p>
          <Link href="/marketplace">
            <Button className="btn-primary">Explore the marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {buyerOrders.map((order) => {
            const remaining = 5 - getDownloadCount(order.id);
            const expired = isExpired(order);

            return (
              <div
                key={order.id}
                className="border border-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-4">
                    {order.product?.preview_url && (
                      <img
                        src={order.product.preview_url}
                        alt=""
                        className="w-20 h-14 object-cover rounded-lg border border-border flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-lg tracking-tight">
                        {order.product?.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        Purchased {formatDate(order.created_at)} • by {order.product?.seller?.username}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <div className="font-mono bg-muted px-3 py-1 rounded text-xs border border-border">
                          {order.license_key || "License pending"}
                        </div>
                        <span className={`text-xs px-2.5 py-px rounded-full ${
                          order.status === "completed" 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between gap-4 md:gap-0 md:text-right">
                  <div>
                    <div className="font-semibold text-xl tabular-nums tracking-tighter">
                      {formatCurrency(order.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">One-time purchase</div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    {order.download_token && !expired ? (
                      <Button 
                        onClick={() => handleDownload(order)} 
                        className="btn-primary gap-2 w-full md:w-auto"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    ) : expired ? (
                      <Button variant="outline" disabled className="w-full md:w-auto">
                        Link expired
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleDownload(order)} 
                        variant="outline"
                        className="gap-2 w-full md:w-auto"
                      >
                        <Download className="h-4 w-4" />
                        Download (demo)
                      </Button>
                    )}

                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 md:justify-end">
                      <Clock className="h-3 w-3" />
                      {remaining} / 5 downloads left
                      {order.download_expires && (
                        <> • expires {new Date(order.download_expires).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-xs text-center text-muted-foreground">
        All purchases delivered instantly via Telegram. Need help? Message the seller directly in Telegram.
      </div>
    </div>
  );
}
