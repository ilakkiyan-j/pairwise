"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, UserPlus, Sparkles, Users, MessageSquareHeart, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Explore", icon: Sparkles },
  { href: "/people", label: "People", icon: Users },
  { href: "/dates", label: "Agent Dates", icon: MessageSquareHeart },
  { href: "/rankings", label: "Rankings", icon: BarChart3 },
];

export function AppHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-[68px] max-w-[1120px] items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-105">
            <HeartHandshake className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Pair<span className="text-primary">Wise</span>
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-wider text-muted sm:inline-block">
              Agentic Matchmaking
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-btn px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-muted text-foreground shadow-subtle"
                    : "text-muted hover:bg-surface-muted/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Environment Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-secondary-soft bg-secondary-soft/60 px-2.5 py-1 text-[11px] font-semibold text-secondary sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            DEMO ACTIVE
          </div>

          <Link
            href="/people/new"
            className="flex items-center gap-1.5 rounded-btn bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-subtle transition-all hover:bg-primary-hover active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Person</span>
            <span className="sm:hidden">Add</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-btn border border-border text-foreground md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-btn px-3 py-2 text-sm font-medium",
                    isActive ? "bg-surface-muted font-semibold text-primary" : "text-muted hover:bg-surface-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
