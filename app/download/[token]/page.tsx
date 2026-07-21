"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Shield, Clock } from "lucide-react";
import { toast } from "sonner";

export default function DownloadPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const handleDownload = () => {
    // In real app: this would be a signed URL from Supabase Storage (product-files bucket)
    toast.success("Starting download...");
    // Simulate download
    setTimeout(() => {
      window.open("https://example.com/files/demo-product.zip", "_blank");
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <div className="mx-auto w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
        <Download className="h-8 w-8 text-accent" />
      </div>

      <h1 className="text-4xl tracking-tighter font-semibold mb-3">Download Ready</h1>
      <p className="text-muted-foreground mb-8">Your purchase has been confirmed via Telegram.</p>

      <div className="bg-card border border-border rounded-3xl p-8 mb-8 text-left">
        <div className="flex justify-between text-sm mb-4">
          <div>License Key</div>
          <div className="font-mono text-accent">BT4-XXXXXX-XXXXXXXX</div>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" /> Expires in 7 days • 5 downloads remaining
        </div>
      </div>

      <Button onClick={handleDownload} size="lg" className="btn-primary px-10 h-14 text-base w-full max-w-xs">
        Download Now
      </Button>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" /> Secure • Single-use signed link
      </div>
    </div>
  );
}
