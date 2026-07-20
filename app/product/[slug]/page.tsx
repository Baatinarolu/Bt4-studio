"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/db";
import { Star, Download, Shield, Calendar, Tag, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const product = getProductBySlug(params.slug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link href="/marketplace" className="mt-4 inline-block text-accent">Browse marketplace →</Link>
      </div>
    );
  }

  const handleBuyViaTelegram = async () => {
    setIsPurchasing(true);

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          price: product.price,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // Open Telegram with the secure deep link
      window.open(data.telegramUrl, "_blank");

      toast.success("Purchase started in Telegram", {
        description: "Complete payment in the bot to receive your license & download link.",
      });

      // For demo purposes: after 4 seconds we simulate the user paid
      // In production the Telegram bot would trigger this via webhook
      setTimeout(async () => {
        try {
          await fetch("/api/complete-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId }),
          });

          toast.success("Payment confirmed!", {
            description: "Check your Telegram chat for the download link and license key.",
            action: {
              label: "Open Telegram",
              onClick: () => window.open("https://t.me/BT4StudioBot", "_blank"),
            },
          });
        } catch (e) {
          // silent fallback
        }
        setIsPurchasing(false);
      }, 4000);

    } catch (error) {
      toast.error("Could not start purchase. Please try again.");
      setIsPurchasing(false);
    }
  };

  const images = product.preview_images && product.preview_images.length > 0 
    ? product.preview_images 
    : [product.preview_url || "https://picsum.photos/id/1015/1200/630"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
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
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(idx)} 
                  className={`w-20 h-14 rounded-md overflow-hidden border ${selectedImage === idx ? "border-accent" : "border-border"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <div className="mb-3">
              <div className="inline px-3 py-1 text-xs font-medium bg-muted rounded-full">
                {product.category?.name} • {product.version}
              </div>
            </div>

            <h1 className="text-4xl tracking-[-1.5px] font-semibold leading-none mb-2">{product.title}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center text-lg font-medium">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" /> 
                {product.rating_avg}
              </div>
              <div className="text-sm text-muted-foreground">({product.review_count} reviews)</div>
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
                className="w-full h-14 text-base btn-primary gap-2 text-lg font-medium"
              >
                {isPurchasing ? "Connecting to Telegram..." : "Buy via Telegram"}
                <span className="text-base opacity-70">→</span>
              </Button>
              <p className="text-[13px] text-center text-muted-foreground">Instant delivery via Telegram + email</p>
            </div>

            <div className="space-y-3 text-sm border border-border rounded-xl p-5 bg-card">
              <div className="flex justify-between"><span className="text-muted-foreground">License</span><span className="font-medium">{product.license}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">File size</span><span className="font-medium">{product.file_size}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sales</span><span className="font-medium">{product.sales_count.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Released</span><span className="font-medium">{formatDate(product.created_at)}</span></div>
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
              {product.license === "Commercial" && <li>✓ Commercial use license</li>}
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
                  {product.file_tree.map((item, i) => (
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
                  {product.seller?.username}
                </Link>
                <div className="text-xs text-muted-foreground">Verified seller • 8.4k sales</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-snug mb-4">{product.seller?.bio}</p>
            <Link href={`/storefront/${product.seller?.username}`} className="text-sm font-medium">View seller storefront →</Link>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-3 flex justify-between items-center">
              Reviews <span className="font-normal text-muted-foreground">({product.review_count})</span>
            </div>
            <div className="space-y-4">
              <div className="border-l-2 pl-4 text-sm border-emerald-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">janebuyer</span>
                  <div className="flex text-amber-500">★★★★★</div>
                </div>
                <div>"Absolutely incredible. Saved us weeks of work. The UI is polished beyond belief."</div>
                <div className="text-xs mt-1 text-muted-foreground">Dec 19, 2024</div>
              </div>
              <div className="border-l-2 pl-4 text-sm border-emerald-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">devtom</span>
                  <div className="flex text-amber-500">★★★★☆</div>
                </div>
                <div>"Great starter. Documentation is excellent. Minor issues with setup but quickly resolved."</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs flex items-center gap-2 text-muted-foreground">
            <Tag className="h-3.5 w-3.5" /> Tags: {product.tags.join(" • ")}
          </div>
        </div>
      </div>
    </div>
  );
}
