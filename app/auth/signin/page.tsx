"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignIn() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl tracking-tighter font-semibold mb-2">Welcome to BT4 Studio</h1>
          <p className="text-muted-foreground">Sign in to buy or sell premium code &amp; digital assets.</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => signIn("github")} 
            className="w-full h-12 text-base flex gap-3 btn-primary"
          >
            Continue with GitHub
          </Button>
          <Button 
            onClick={() => signIn("google")} 
            variant="outline" 
            className="w-full h-12 text-base"
          >
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing in you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
        </div>
      </div>
    </div>
  );
}
