"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const user = session?.user as any;
  const role = (user?.role || "BUYER").toUpperCase();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
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
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            /* AUTHENTICATED: Avatar Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 w-9 overflow-hidden rounded-full border border-border hover:ring-2 hover:ring-accent transition-all focus:outline-none"
                >
                  {user.avatar || user.image ? (
                    <img
                      src={user.avatar || user.image}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-sm font-medium">
                      {user.username?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel>
                  {user.displayName || user.name || user.username}
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
                  onClick={() => signOut({ callbackUrl: "/" })}
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

          {/* Mobile Hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="sm:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background border-border">
              <div className="flex flex-col gap-1 mt-8 text-sm">
                <Link href="/marketplace" className="py-2">Marketplace</Link>
                <Link href="/for-sellers" className="py-2">For Sellers</Link>

                <div className="h-px bg-border my-2" />

                {user ? (
                  <>
                    <div className="py-2 text-xs text-muted-foreground">
                      {user.email || user.username}
                    </div>

                    <Link href="/dashboard/buyer" className="py-2">My Purchases</Link>

                    {role === "SELLER" || role === "ADMIN" ? (
                      <Link href="/seller/dashboard" className="py-2">Seller Dashboard</Link>
                    ) : (
                      <Link href="/seller/apply" className="py-2">Become a Seller</Link>
                    )}

                    {role === "ADMIN" && (
                      <Link href="/admin" className="py-2 font-medium text-accent">Admin Panel</Link>
                    )}

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="py-2 text-left text-red-400"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link href="/auth/signin" className="py-2">Sign In</Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
