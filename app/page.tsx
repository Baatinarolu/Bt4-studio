"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, Users, Shield, Zap } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getAllApprovedProducts } from "@/lib/data";
import { categories } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

export default function LandingPage() {
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

  const featured = products.slice(0, 6);
  const trending = [...products].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 4);
  const topSellers = products.slice(0, 3);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-6 py-24 text-center">Loading featured products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero */}
      <div className="pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-muted text-sm font-medium mb-6">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 8,427 products sold this month
        </div>

        <h1 className="text-6xl sm:text-7xl tracking-tighter font-semibold max-w-5xl mx-auto leading-none">
          Premium code.<br />Built by developers,<br />for developers.
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-lg mx-auto">
          Buy and sell high-quality source code, SaaS starters, UI kits, APIs, and developer tools. 
          Instant delivery via Telegram.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/marketplace">
            <Button size="lg" className="btn-primary px-9 h-12 text-base gap-2">
              Browse marketplace <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/for-sellers">
            <Button variant="outline" size="lg" className="px-9 h-12 text-base">
              Start selling
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-x-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> 100% verified sellers</div>
          <div className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> Instant delivery</div>
          <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 42k+ developers</div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-b py-4 mb-14 flex items-center justify-center gap-x-12 text-sm text-muted-foreground">
        <div>Trusted by engineers at</div>
        <div className="flex gap-8 font-medium tracking-tight">
          <span>Vercel</span>
          <span>Stripe</span>
          <span>Figma</span>
          <span>Linear</span>
          <span>Notion</span>
        </div>
      </div>

      {/* Featured */}
      <div className="mb-20">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="uppercase tracking-[1px] text-xs font-medium text-muted-foreground mb-1">CURATED</div>
            <h2 className="text-3xl tracking-tighter font-semibold">Featured this week</h2>
          </div>
          <Link href="/marketplace" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-medium">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-20">
        <div className="mb-6">
          <div className="uppercase tracking-[1px] text-xs font-medium text-muted-foreground mb-1">EXPLORE BY</div>
          <h2 className="text-3xl tracking-tighter font-semibold">Categories</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/marketplace?category=${cat.slug}`}
              className="group border border-border hover:border-accent rounded-xl p-5 transition-all flex items-center gap-3 bg-card"
            >
              <div className="text-3xl">{cat.icon}</div>
              <div>
                <div className="font-semibold text-sm group-hover:text-accent transition-colors">{cat.name}</div>
                <div className="text-xs text-muted-foreground">{cat.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="mb-20">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="uppercase tracking-[1px] text-xs font-medium text-muted-foreground mb-1">TRENDING</div>
            <h2 className="text-3xl tracking-tighter font-semibold">Best sellers</h2>
          </div>
          <Link href="/marketplace?sort=bestselling" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-medium">
            See all bestsellers <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {trending.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-muted/60 rounded-3xl p-12 mb-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="uppercase tracking-widest text-xs font-medium mb-3 text-muted-foreground">SIMPLE. FAST. SECURE.</div>
          <h2 className="text-3xl font-semibold tracking-tighter mb-8">How BT4 Studio works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { icon: <Users className="h-6 w-6" />, title: "Discover", desc: "Browse vetted, high-quality code by developers who ship real products." },
              { icon: <Zap className="h-6 w-6" />, title: "Buy via Telegram", desc: "One tap to purchase. Pay securely via Telegram Payments. Instant access." },
              { icon: <Shield className="h-6 w-6" />, title: "Instant delivery", desc: "Download links and license keys delivered directly in Telegram + email." },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="mb-4 p-2.5 bg-background border rounded-lg">{step.icon}</div>
                <div className="font-semibold mb-2">{step.title}</div>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top sellers */}
      <div className="mb-20">
        <h2 className="text-2xl tracking-tighter font-semibold mb-5">Top sellers this month</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topSellers.map((p, idx) => (
            <Link href={`/storefront/${p.seller?.username}`} key={idx} className="flex items-center gap-4 border border-border p-4 rounded-2xl bg-card hover:bg-accent/5 transition">
              <img src={p.seller?.avatar} alt="" className="w-12 h-12 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{p.seller?.username}</div>
                <div className="text-sm text-muted-foreground truncate">{p.seller?.bio}</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-mono text-emerald-600 font-medium">{p.sales_count.toLocaleString()} sales</div>
                <div className="text-muted-foreground">4.9 avg</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t py-16 text-center">
        <div className="max-w-lg mx-auto">
          <h3 className="font-semibold text-3xl tracking-tight">Ready to ship your next product faster?</h3>
          <p className="mt-2 mb-8 text-muted-foreground">Join 4,200+ developers who sell their work on BT4 Studio.</p>
          <Link href="/seller/dashboard">
            <Button size="lg" className="btn-primary px-10">Become a seller</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
