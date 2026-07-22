"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Download, Shield, Tag } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { createReview } from "@/lib/data";

interface ProductClientProps {
  product: any;
  reviews: any[];
  isVerifiedBuyer: boolean;
  currentBuyerId: string;
}

export default function ProductClient({ product, reviews, isVerifiedBuyer, currentBuyerId }: ProductClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews || []);

  const handleBuyViaTelegram = async () => {
    // Strong guard: require real logged-in user
    if (!currentBuyerId || currentBuyerId === "demo-buyer" || currentBuyerId.startsWith("demo")) {
      toast.error("You must be logged in to purchase");
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    // Open a blank popup right away (avoids popup blockers)
    const popup = window.open('', '_blank');

    setIsPurchasing(true);

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          price: product.price,
          buyerId: currentBuyerId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create purchase");
      }

      const data = await res.json();

      if (!data.telegramUrl) {
        throw new Error("Server did not return a valid Telegram link");
      }

      // Navigate the popup to Telegram
      if (popup && !popup.closed) {
        popup.location.href = data.telegramUrl;
      } else {
        window.location.href = data.telegramUrl;
      }

      toast.success("Opened Telegram", {
        description: "Finish checkout inside @BT4StudioBot",
      });

      setIsPurchasing(false);

    } catch (error: any) {
      console.error("Purchase error:", error);
      if (popup) popup.close();
      toast.error(error.message || "Could not start purchase. Please log in.");
      setIsPurchasing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = await createReview({
        productId: product.id,
        buyerId: currentBuyerId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setLocalReviews(prev => [newReview, ...prev]);
      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);

      toast.success("Thank you for your review!");
    } catch (e) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const images = product.preview_images && product.preview_images.length > 0 
    ? product.preview_images 
    : [product.preview_url || "https://picsum.photos/id/1015/1200/630"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-9 gap-y-8">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="aspect-video bg-muted rounded-2xl overflow-hidden border border-border mb-3">
            <img 
              src={images[selectedImage]} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(idx)} 
                  className={`w-16 h-12 sm:w-20 sm:h-14 flex-shrink-0 rounded-md overflow-hidden border ${selectedImage === idx ? "border-accent" : "border-border"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-4 lg:top-20">
            <div className="mb-3">
              <div className="inline px-3 py-1 text-xs font-medium bg-muted rounded-full">
                {product.category?.name || product.category} • {product.version}
              </div>
            </div>

            <h1 className="text-4xl tracking-[-1.5px] font-semibold leading-none mb-2">{product.title}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center text-lg font-medium">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" /> 
                {product.rating_avg || product.ratingAvg || 4.8}
              </div>
              <div className="text-sm text-muted-foreground">({product.review_count || product.ratingCount || localReviews.length} reviews)</div>
              <div className="text-xs px-2 py-px bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded">VERIFIED SELLER</div>
            </div>

            <div className="mb-8">
              <div className="text-5xl font-semibold tracking-tighter tabular-nums font-mono">
                {formatCurrency(product.price)}
              </div>
              <div className="text-sm text-muted-foreground">One-time purchase • Lifetime access</div>
            </div>

            <div className="space-y-2 mb-8">
              <Button 
                onClick={handleBuyViaTelegram} 
                disabled={isPurchasing}
                className="w-full h-14 text-base btn-primary gap-2 text-lg font-medium min-h-[44px]"
              >
                {isPurchasing ? "Connecting to Telegram..." : "💬 Purchase on Telegram — " + formatCurrency(product.price)}
              </Button>
              <p className="text-[13px] text-center text-muted-foreground">Instant delivery via Telegram + email</p>
            </div>

            <div className="space-y-3 text-sm border border-border rounded-xl p-5 bg-card">
              <div className="flex justify-between"><span className="text-muted-foreground">License</span><span className="font-medium">{product.license || product.licenseType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">File size</span><span className="font-medium">{product.file_size || "12.8 MB"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sales</span><span className="font-medium">{(product.sales_count || product.salesCount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Released</span><span className="font-medium">{formatDate(product.created_at || product.createdAt)}</span></div>
              {product.demo_url && (
                <div className="pt-2 border-t">
                  <a href={product.demo_url} target="_blank" className="font-medium flex items-center gap-1.5 text-accent hover:underline">
                    View live demo <span>↗</span>
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" /> 30-day money-back guarantee • Verified seller
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-7 pt-4">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h3 className="font-semibold text-lg tracking-tight mb-3">Overview</h3>
            <p className="text-[15px] leading-relaxed text-foreground/90">{product.description}</p>
            
            <h3 className="font-semibold text-lg tracking-tight mt-10 mb-3">What's included</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-1.5 text-sm">
              <li>✓ Full source code + documentation</li>
              <li>✓ Production-ready configuration</li>
              <li>✓ TypeScript support</li>
              <li>✓ Responsive UI components</li>
              <li>✓ Example data and seed scripts</li>
              <li>✓ Lifetime updates</li>
              {(product.license || product.licenseType) === "Commercial" && <li>✓ Commercial use license</li>}
              <li>✓ Support via Telegram for 90 days</li>
            </ul>

            {product.readme && (
              <div className="mt-10">
                <h3 className="font-semibold text-lg tracking-tight mb-3">Documentation</h3>
                <div className="code-block p-5 text-xs whitespace-pre-wrap font-mono leading-relaxed border border-border rounded-lg">
                  {product.readme}
                </div>
              </div>
            )}

            {/* File tree preview */}
            {product.file_tree && product.file_tree.length > 0 && (
              <div className="mt-9">
                <h3 className="font-semibold text-lg tracking-tight mb-3">Files included</h3>
                <div className="font-mono text-xs bg-muted p-4 rounded-xl border border-border">
                  {product.file_tree.map((item: any, i: number) => (
                    <div key={i} className="py-0.5 flex items-center gap-1.5">
                      {item.type === "dir" ? "📁" : "📄"} {item.name} {item.size && <span className="text-muted-foreground">({item.size})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seller + Reviews */}
        <div className="lg:col-span-5 pt-3">
          <div className="border border-border p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <img src={product.seller?.avatar} className="w-10 h-10 rounded-full" alt="" />
              <div>
                <Link href={`/storefront/${product.seller?.username}`} className="font-semibold hover:underline">
                  {product.seller?.username || product.seller?.displayName}
                </Link>
                <div className="text-xs text-muted-foreground">Verified seller • 8.4k sales</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-snug mb-4">{product.seller?.bio}</p>
            <Link href={`/storefront/${product.seller?.username}`} className="text-sm font-medium">View seller storefront →</Link>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-3 flex justify-between items-center">
              Reviews <span className="font-normal text-muted-foreground">({localReviews.length})</span>
            </div>

            {isVerifiedBuyer && !showReviewForm && (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="mb-4 text-sm px-3 py-1.5 border border-border rounded-md hover:bg-muted transition text-accent"
              >
                + Write a review (verified buyer)
              </button>
            )}

            {showReviewForm && (
              <div className="border border-border rounded-xl p-4 mb-4 bg-card">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewRating(n)} className={`text-2xl ${n <= reviewRating ? 'text-amber-500' : 'text-muted'}`}>★</button>
                  ))}
                </div>
                <textarea 
                  value={reviewComment} 
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="What did you think of this product?"
                  className="w-full h-20 text-sm border border-border rounded-md p-3 bg-background"
                />
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleSubmitReview} disabled={isSubmittingReview}>
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {localReviews.length > 0 ? (
                localReviews.slice(0, 4).map((review: any, idx: number) => (
                  <div key={idx} className="border-l-2 pl-4 text-sm border-emerald-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.buyer?.username || review.buyer?.displayName || 'Verified buyer'}</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: review.rating }).map((_, i) => <span key={i}>★</span>)}
                      </div>
                    </div>
                    <div>{review.comment}</div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {formatDate(review.createdAt || review.created_at)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No reviews yet. Be the first to review after purchasing.</div>
              )}
            </div>
          </div>

          <div className="mt-6 text-xs flex items-center gap-2 text-muted-foreground">
            <Tag className="h-3.5 w-3.5" /> Tags: {(product.tags || []).join(" • ")}
          </div>
        </div>
      </div>
    </div>
  );
}
