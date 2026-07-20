"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GitBranch as Github, CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SellerSetup() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [githubLinked, setGithubLinked] = useState(!!user?.github || true); // assume linked if GitHub auth
  const [stripeConnected, setStripeConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnectStripe = async () => {
    setLoading(true);
    // In real app: redirect to Stripe Connect OAuth
    await new Promise((r) => setTimeout(r, 1200));
    
    setStripeConnected(true);
    toast.success("Stripe Connect connected! (demo)");
    setLoading(false);
  };

  const isComplete = githubLinked && stripeConnected;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl tracking-tighter font-semibold">Seller Setup</h1>
        <p className="text-muted-foreground mt-2">
          Complete these steps before you can publish products.
        </p>
      </div>

      <div className="space-y-6">
        {/* GitHub */}
        <div className="border border-border rounded-2xl p-6 flex items-start gap-5">
          <div className="mt-1">
            <Github className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">Link GitHub Profile</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Required for seller verification and trust signals.
                </div>
              </div>
              {githubLinked ? (
                <div className="flex items-center text-emerald-500 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" /> Connected
                </div>
              ) : (
                <Button onClick={() => setGithubLinked(true)}>Link GitHub</Button>
              )}
            </div>
            {githubLinked && user && (
              <div className="mt-3 text-sm bg-muted p-3 rounded-lg font-mono">
                @{user.github || user.name?.toLowerCase().replace(/\s/g, "") || "your-github"}
              </div>
            )}
          </div>
        </div>

        {/* Stripe Connect */}
        <div className="border border-border rounded-2xl p-6 flex items-start gap-5">
          <div className="mt-1">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">Connect Stripe</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Receive payments directly. 80/20 revenue split (you keep 80%).
                </div>
              </div>
              {stripeConnected ? (
                <div className="flex items-center text-emerald-500 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" /> Connected
                </div>
              ) : (
                <Button 
                  onClick={handleConnectStripe} 
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Connecting..." : "Connect with Stripe"}
                </Button>
              )}
            </div>

            {stripeConnected && (
              <div className="mt-3 text-xs text-emerald-600 bg-emerald-950/50 px-3 py-1.5 rounded inline-block">
                Stripe Connect account created • Payouts enabled
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center">
        <Button
          size="lg"
          className="btn-primary px-10 h-12 text-base"
          disabled={!isComplete}
          onClick={() => {
            if (isComplete) {
              window.location.href = "/seller/dashboard";
            }
          }}
        >
          {isComplete ? "Go to Seller Dashboard" : "Complete setup to continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="mt-4 text-xs text-muted-foreground text-center max-w-xs">
          You’ll be able to upload and publish products once both steps are complete.
        </div>

        <Link href="/marketplace" className="mt-6 text-sm text-muted-foreground hover:text-foreground">
          Skip for now (you can complete this later)
        </Link>
      </div>
    </div>
  );
}
