"use client";

import { useState } from "react";
import { useSupabaseAuth } from "@/lib/supabase/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function BecomeSeller() {
  const { data: session } = useSupabaseAuth();
  const [payoutWallet, setPayoutWallet] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutWallet || payoutWallet.length < 10) {
      toast.error("Please enter a valid USDT TRC20 wallet address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutWallet, githubLink, bio }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Seller application submitted! Admin will review soon.");
        setTimeout(() => window.location.href = "/seller/dashboard", 1200);
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch {
      toast.error("Could not submit application");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto pt-20 text-center">
        <p>Please sign in first.</p>
        <Link href="/auth/signin" className="text-sm underline">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-4xl tracking-tighter font-semibold mb-2">Become a Seller</h1>
      <p className="text-muted-foreground mb-8">Fill the details below. You keep 80% of every sale. Admin approval required before you can list products.</p>

      <form onSubmit={handleSubmit} className="space-y-6 border border-border rounded-2xl p-8">
        <div>
          <label className="block text-sm font-medium mb-1.5">USDT TRC20 Payout Wallet *</label>
          <input value={payoutWallet} onChange={e => setPayoutWallet(e.target.value)} placeholder="TE7p...xYz9" className="w-full px-4 py-3 bg-background border border-border rounded-xl font-mono text-sm" required />
          <p className="text-xs text-muted-foreground mt-1">Payments sent here. Required for crypto payouts.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">GitHub Profile</label>
          <input value={githubLink} onChange={e => setGithubLink(e.target.value)} placeholder="https://github.com/yourusername" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Short Bio (optional)</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl h-24 text-sm" placeholder="Building production-ready developer tools..." />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 btn-primary">
          {loading ? "Submitting..." : "Submit Seller Application"}
        </Button>
      </form>
    </div>
  );
}
