"use client";

import React, { useState, Suspense, useEffect } from "react";
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

  const handleTelegramSignIn = () => {
    // MUST use the NUMERIC bot ID (8862600842), not the username.
    const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || '8862600842';

    // CRITICAL: Telegram OAuth "domain invalid" error happens when origin
    // does not exactly match a domain you whitelisted in @BotFather → Bot Settings → Login Widget → Domain
    // We force the production domain here.
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://bt4-studio-pro.vercel.app';
    const returnTo = `${origin}/auth/signin`;

    const url = `https://oauth.telegram.org/auth?bot_id=${encodeURIComponent(botId)}&origin=${encodeURIComponent(origin)}&return_to=${encodeURIComponent(returnTo)}`;
    window.location.href = url;
  };

  // Handle redirect from Telegram (params: id, hash, auth_date, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const hash = params.get('hash');

    if (id && hash) {
      const tgData = {
        id: parseInt(id),
        first_name: params.get('first_name') || '',
        last_name: params.get('last_name') || '',
        username: params.get('username') || '',
        photo_url: params.get('photo_url') || '',
        auth_date: parseInt(params.get('auth_date') || '0'),
        hash,
      };

      (async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tgData),
          });

          const result = await res.json();

          if (!res.ok || !result.success) {
            throw new Error(result.error || 'Telegram login failed');
          }

          // Set real session on the client
          if (result.session) {
            await supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
            });
          }

          // Ensure profile row + FORCE baatinarolu@gmail.com to ADMIN
          if (result.user) {
            const isAdmin = result.user.email === 'baatinarolu@gmail.com';
            await supabase.from('users').upsert({
              id: result.user.id,
              email: result.user.email,
              username: result.user.username || `tg_${result.user.telegram_id}`,
              display_name: result.user.display_name,
              avatar: result.user.avatar,
              telegram_id: result.user.telegram_id?.toString(),
              role: isAdmin ? 'ADMIN' : 'BUYER',
            }, { onConflict: 'id' });
          }

          toast.success(`Welcome${result.user?.display_name ? `, ${result.user.display_name}` : ''}!`);
          window.location.href = callbackUrl;

        } catch (err: any) {
          console.error('Real Telegram auth error:', err);
          toast.error(err.message || 'Telegram login failed');
        } finally {
          setIsLoading(false);
          window.history.replaceState({}, '', '/auth/signin');
        }
      })();
    }
  }, [callbackUrl]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
        },
      });
      if (error) throw error;
      // Supabase will redirect the user
    } catch (e: any) {
      toast.error(e.message || "Google sign in failed");
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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
      // Ensure profile + FORCE baatinarolu@gmail.com to be ADMIN
      if (data.user) {
        const isAdmin = data.user.email === "baatinarolu@gmail.com";
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: data.user.email,
            username: data.user.email?.split('@')[0] || 'user',
            role: isAdmin ? 'ADMIN' : 'BUYER',
          }, { onConflict: 'id' });
        } catch (e) {
          console.warn('Profile upsert skipped');
        }
      }
      toast.success("Logged in successfully!");
      // Force full navigation so middleware sees the session
      window.location.href = callbackUrl;
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
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

        {/* Social logins - always visible */}
        <div className="space-y-3 mb-6">
          <Button 
            onClick={handleGoogleSignIn} 
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 text-base flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-900"
          >
            <span>🔵</span> Continue with Google
          </Button>

          <Button 
            onClick={handleTelegramSignIn} 
            disabled={isLoading}
            className="w-full h-12 text-base btn-primary flex items-center justify-center gap-2"
          >
            <span className="inline-block w-5 h-5">
              {/* Clean Telegram paper plane icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </span>
            Continue with Telegram
          </Button>
          <p className="text-[11px] text-center text-muted-foreground -mt-1">
            Opens Telegram • no code/OTP sent
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Mode Tabs for Email */}
        <div className="flex border-b mb-6">
          <button 
            onClick={() => setMode("email")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${mode === "email" ? "border-foreground" : "border-transparent text-muted-foreground"}`}>
            Sign in with Email
          </button>
          <button 
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${mode === "signup" ? "border-foreground" : "border-transparent text-muted-foreground"}`}>
            Create Account
          </button>
        </div>

        {/* EMAIL LOGIN FORM */}
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

        {/* SIGN UP FORM */}
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

