"use client";

import { useState } from "react";
import { useSupabaseAuth } from "@/lib/supabase/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Code2, ArrowRight, GitBranch as Github } from "lucide-react";
import { toast } from "sonner";

export default function Onboard() {
  const { data: session, update } = useSupabaseAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<"BUYER" | "SELLER" | null>(null);

  const user = session?.user as any;

  const handleSelect = async (role: "BUYER" | "SELLER") => {
    setSelected(role);
    setLoading(true);

    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Failed to save preference");

      await update({ role });

      toast.success(
        role === "SELLER"
          ? "Welcome, seller! Let's get your first product ready."
          : "Great! You're ready to start browsing."
      );

      if (role === "SELLER") {
        router.push("/seller/setup");
      } else {
        router.push("/marketplace");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-muted text-sm mb-4">
            Welcome to BT4 Studio
          </div>
          <h1 className="text-5xl tracking-tighter font-semibold mb-3">How do you want to use BT4 Studio?</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            You can always change this later in settings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => handleSelect("BUYER")}
            disabled={loading}
            className={`group relative flex flex-col items-start border rounded-3xl p-8 text-left transition-all hover:border-accent hover:shadow-md ${
              selected === "BUYER" ? "border-accent ring-1 ring-accent/30" : "border-border"
            }`}
          >
            <div className="p-3 rounded-2xl bg-muted mb-6">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div className="font-semibold text-2xl tracking-tight mb-2">I want to buy</div>
            <div className="text-muted-foreground mb-6 leading-snug">
              Discover and purchase production-ready code, templates, UI kits, and tools from top developers.
            </div>
            <div className="mt-auto flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all">
              Browse marketplace <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </button>

          <button
            onClick={() => handleSelect("SELLER")}
            disabled={loading}
            className={`group relative flex flex-col items-start border rounded-3xl p-8 text-left transition-all hover:border-accent hover:shadow-md ${
              selected === "SELLER" ? "border-accent ring-1 ring-accent/30" : "border-border"
            }`}
          >
            <div className="p-3 rounded-2xl bg-muted mb-6">
              <Code2 className="h-7 w-7" />
            </div>
            <div className="font-semibold text-2xl tracking-tight mb-2">I want to sell</div>
            <div className="text-muted-foreground mb-6 leading-snug">
              Monetize your code, SaaS starters, design systems, and developer tools. Keep 80% of every sale.
            </div>
            <div className="flex items-center gap-2 text-sm mt-auto">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Github className="h-4 w-4" /> GitHub required
              </div>
              <div className="text-muted-foreground">• Stripe Connect</div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Your choice helps us show you the right experience. You can switch anytime.
        </div>
      </div>
    </div>
  );
}
