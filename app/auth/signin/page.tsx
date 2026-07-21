"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"telegram" | "email" | "signup">("telegram");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTelegramSignIn = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = callbackUrl;
      } else {
        toast.error(data.error || "Telegram login is not available yet. Please use Email & Password below.");
      }
    } catch (e) {
      toast.error("Telegram login is currently disabled. Use the Email tab.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      toast.error(error.message || "Login failed. Check your email/password or create an account first.");
    } else {
      // Ensure profile exists in public.users (in case trigger didn't run)
      if (data.user) {
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: data.user.email,
            username: data.user.email?.split('@')[0] || 'user',
            role: 'BUYER',
          }, { onConflict: 'id' });
        } catch (e) {
          console.warn('Profile upsert skipped (may need trigger)');
        }
      }
      toast.success("Logged in successfully!");
      window.location.href = callbackUrl;
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Password must be 8+ chars, include uppercase + number");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
          }
        }
      });

      if (error) throw error;

      // Try to ensure profile row exists (works even if trigger not run)
      if (data.user) {
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: data.user.email,
            username: username || data.user.email?.split('@')[0],
            display_name: displayName,
            role: 'BUYER',
          }, { onConflict: 'id' });
        } catch (profileErr) {
          console.warn('Profile creation skipped - run the SQL trigger if this persists');
        }
      }

      toast.success("Account created! You can now sign in with Email tab (or check email for confirmation).");
      setMode("email");
      // Auto-fill the email for convenience
      setEmail(email);
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(err.message || "Registration failed. Make sure Email provider is enabled in Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-foreground rounded flex items-center justify-center mb-4">
            <span className="text-background font-bold text-2xl tracking-tighter">BT4</span>
          </div>
          <h1 className="text-4xl tracking-tighter font-semibold mb-2">Sign in to BT4 Studio</h1>
          <p className="text-muted-foreground">Buy and sell premium code &amp; digital assets.</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b mb-6">
          <button 
            onClick={() => setMode("telegram")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${mode === "telegram" ? "border-foreground" : "border-transparent text-muted-foreground"}`}>
            Telegram (Recommended)
          </button>
          <button 
            onClick={() => setMode("email")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${mode === "email" ? "border-foreground" : "border-transparent text-muted-foreground"}`}>
            Email &amp; Password
          </button>
          <button 
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${mode === "signup" ? "border-foreground" : "border-transparent text-muted-foreground"}`}>
            Sign Up
          </button>
        </div>

        {/* TELEGRAM */}
        {mode === "telegram" && (
          <div className="space-y-4">
            <div className="border border-border rounded-2xl p-8 text-center bg-muted/40">
              <div className="text-4xl mb-4">📱</div>
              <div className="font-semibold text-xl mb-1">Continue with Telegram</div>
              <p className="text-sm text-muted-foreground mb-6">Instant login. Auto-populates username, avatar, and name.</p>

              <Button 
                onClick={handleTelegramSignIn} 
                disabled={isLoading}
                className="w-full h-12 text-base btn-primary"
              >
                {isLoading ? "Connecting..." : "Sign in with Telegram"}
              </Button>

              <p className="mt-4 text-[11px] text-muted-foreground">
                Uses official Telegram Login Widget. Your data stays private.
              </p>
            </div>
          </div>
        )}

        {/* EMAIL LOGIN */}
        {mode === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground" 
                placeholder="you@dev.com" 
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground" 
                placeholder="••••••••" 
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 text-base btn-primary">
              {isLoading ? "Signing in..." : "Sign in with Email"}
            </Button>

            <div className="text-center text-xs">
              <Link href="#" className="text-muted-foreground hover:underline">Forgot password?</Link>
            </div>
          </form>
        )}

        {/* SIGN UP */}
        {mode === "signup" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Display name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="Jane Cooper" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="janecodes" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="you@dev.com" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm" placeholder="••••••••" />
              <p className="text-[10px] text-muted-foreground mt-1">Min 8 chars • 1 uppercase • 1 number</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm" />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 btn-primary">
              {isLoading ? "Creating account..." : "Create account & continue"}
            </Button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground">
            By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
          <div className="mt-4">
            <Link href={callbackUrl !== "/" ? callbackUrl : "/"} className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[10px] text-muted-foreground font-mono">
          Demo: admin@bt4.studio / admin123 (Email tab) • buyer: jane@buyer.dev
        </div>
      </div>
    </div>
  );
}


export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center">Loading sign in...</div>}>
      <SignInContent />
    </Suspense>
  );
}

