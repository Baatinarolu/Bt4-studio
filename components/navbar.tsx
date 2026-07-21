"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu, X, Sun, Moon, LogOut, Store, ShoppingBag, User, LayoutDashboard, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";

const supabase = createClient();

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  role: string;
  name?: string; // fallback
}

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Supabase auth state
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email || authUser.email || '',
            username: profile.username,
            display_name: profile.display_name,
            avatar: profile.avatar,
            role: profile.role || 'BUYER',
          });
        }
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const role = (user?.role || "BUYER").toUpperCase();
  const isLoading = loading;

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-slate-950">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* LEFT: Logo + Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
              <span className="text-background font-semibold text-xl tracking-tighter">BT4</span>
            </div>
            <span className="font-semibold text-xl tracking-[-0.02em]">BT4 Studio</span>
          </Link>

          <div className="hidden sm:flex items-center gap-5 text-sm font-medium">
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link href="/for-sellers" className="text-muted-foreground hover:text-foreground transition-colors">
              Sell
            </Link>
          </div>
        </div>

        {/* RIGHT: Search + Auth */}
        <div className="flex items-center gap-3">
          {/* Search (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-64 bg-muted pl-9 pr-4 py-1.5 text-sm rounded-full border border-transparent focus:border-border focus:outline-none"
              />
            </div>
          </form>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Auth */}
          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            /* AUTHENTICATED: Avatar Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 w-9 overflow-hidden rounded-full border border-border hover:ring-2 hover:ring-accent transition-all focus:outline-none"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-sm font-medium">
                      {user.username?.[0]?.toUpperCase() || (user.display_name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent 
                align="end" 
                sideOffset={8}
                className="z-50 w-56 rounded-lg border border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-black/50"
              >
                <DropdownMenuLabel>
                  {user.display_name || user.name || user.username || user.email?.split('@')[0]}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/buyer" className="cursor-pointer">
                    My Purchases
                  </Link>
                </DropdownMenuItem>

                {/* Seller / Apply */}
                {role === "SELLER" || role === "ADMIN" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/seller/dashboard" className="cursor-pointer">
                      Seller Dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/seller/apply" className="cursor-pointer">
                      Become a Seller
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* ADMIN ONLY */}
                {role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer font-medium">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => supabase.auth.signOut()}
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* UNAUTHENTICATED */
            <Link 
              href={`/auth/signin?callbackUrl=${encodeURIComponent(
                typeof window !== 'undefined' 
                  ? window.location.pathname + window.location.search 
                  : '/'
              )}`}
            >
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Hamburger - CRISP solid design (exactly per prompt: solid bg-slate-950, no blur, no opacity) */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="z-50 w-80 border-l border-slate-800 bg-slate-950 p-0 shadow-2xl sm:hidden"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Header with solid background */}
              <div className="border-b border-slate-800 bg-slate-950 px-6 py-4">
                <span className="text-lg font-semibold text-slate-100">BT4 Studio</span>
              </div>

              {/* User Info (if logged in) */}
              {user && (
                <div className="border-b border-slate-800 px-6 py-4">
                  <p className="text-sm font-medium text-slate-100">
                    {user.display_name || user.username || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1 bg-slate-950 p-4">
                <Link
                  href="/marketplace"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                >
                  <Store className="h-4 w-4" />
                  Marketplace
                </Link>

                <Link
                  href="/for-sellers"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                >
                  <ShoppingBag className="h-4 w-4" />
                  For Sellers
                </Link>

                {user ? (
                  <>
                    <div className="my-2 border-t border-slate-800" />

                    <Link
                      href="/dashboard/buyer"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                    >
                      <User className="h-4 w-4" />
                      My Purchases
                    </Link>

                    {(role === "SELLER" || role === "ADMIN") ? (
                      <Link
                        href="/seller/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Seller Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/seller/apply"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                      >
                        <User className="h-4 w-4" />
                        Become a Seller
                      </Link>
                    )}

                    {role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-slate-900"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="my-2 border-t border-slate-800" />

                    <button
                      type="button"
                      onClick={() => supabase.auth.signOut()}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="my-2 border-t border-slate-800" />
                    <Link
                      href="/auth/signin"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                    >
                      <User className="h-4 w-4" />
                      Sign In
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
