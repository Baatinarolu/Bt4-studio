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
    <nav className="sticky top-0 z-50 border-b border-border bg-slate-950">
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

          {/* Mobile Hamburger - CRISP solid design (per prompt: solid bg-slate-950, NO blur, NO opacity) */}
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
              className="w-80 border-l border-slate-800 bg-slate-950 p-0 sm:hidden"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                <span className="text-lg font-semibold text-slate-100">BT4 Studio</span>
              </div>

              {/* User Info */}
              {user && (
                <div className="border-b border-slate-800 px-6 py-4">
                  <p className="text-sm font-medium text-slate-100">
                    {user.displayName || user.username}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex flex-col gap-1 p-4">
                <Link
                  href="/marketplace"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                >
                  Marketplace
                </Link>

                <Link
                  href="/for-sellers"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                >
                  For Sellers
                </Link>

                {user ? (
                  <>
                    <div className="my-2 border-t border-slate-800" />

                    <Link
                      href="/dashboard/buyer"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                    >
                      My Purchases
                    </Link>

                    {(role === "SELLER" || role === "ADMIN") ? (
                      <Link
                        href="/seller/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                      >
                        Seller Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/seller/apply"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-slate-100"
                      >
                        Become a Seller
                      </Link>
                    )}

                    {role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-slate-900"
                      >
                        Admin Panel
                      </Link>
                    )}

                    <div className="my-2 border-t border-slate-800" />

                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30"
                    >
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
