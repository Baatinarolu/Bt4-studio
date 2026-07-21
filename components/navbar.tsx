"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const user = session?.user;

  // Real backend status indicator (client-only)
  const [backendStatus, setBackendStatus] = useState<{ mode: string; isReal: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/backend-status')
      .then(r => r.json())
      .then(data => setBackendStatus({ mode: data.mode, isReal: data.isReal }))
      .catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
              <span className="text-background font-semibold text-xl tracking-tighter">BT4</span>
            </div>
            <span className="font-semibold text-xl tracking-[-0.02em]">BT4 Studio</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Browse</Link>
            <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">Categories</Link>
            <Link href="/for-sellers" className="text-muted-foreground hover:text-foreground transition-colors">For Sellers</Link>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, libraries, templates..."
              className="w-full bg-muted pl-10 pr-4 py-2 text-sm rounded-full border border-transparent focus:border-border focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <ShoppingBag className="h-4 w-4" />
              Marketplace
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Real backend mode indicator (truthful) */}
          {backendStatus && (
            <div className="hidden md:flex items-center px-2 py-0.5 text-[10px] font-mono rounded border border-border bg-muted/50 mr-1">
              {backendStatus.isReal ? '🟢 REAL' : '⚪ MOCK'}
            </div>
          )}

          <div className="flex items-center gap-1.5 border-l pl-3 ml-1 border-border">
            {status === "loading" ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <>
                <Link href="/dashboard/buyer">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name || "Account"}</span>
                  </Button>
                </Link>
                <Link href="/seller/dashboard">
                  <Button size="sm" className="btn-primary px-4 text-sm">
                    Sell
                  </Button>
                </Link>
                {(user as any)?.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-xs hidden md:inline-flex">Admin</Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="hidden md:flex"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Button>
                </Link>
                <Link href="/seller/dashboard">
                  <Button size="sm" className="btn-primary px-4 text-sm">
                    Sell
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background px-6 py-4 space-y-3 text-sm">
          <Link href="/marketplace" className="block py-1.5">Browse</Link>
          <Link href="/categories" className="block py-1.5">Categories</Link>
          <Link href="/for-sellers" className="block py-1.5">For Sellers</Link>
          <div className="pt-3 border-t">
            {user ? (
              <>
                <Link href="/dashboard/buyer" className="block py-1.5">My Account</Link>
                <Link href="/seller/dashboard" className="block py-1.5">Seller Dashboard</Link>
                <button onClick={() => signOut()} className="block py-1.5 text-left w-full">Sign out</button>
              </>
            ) : (
              <Link href="/auth/signin" className="block py-1.5">Sign in</Link>
            )}
          </div>
          <form onSubmit={handleSearch} className="pt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-muted px-4 py-2 text-sm rounded-full border border-transparent"
            />
          </form>
        </div>
      )}
    </nav>
  );
}
