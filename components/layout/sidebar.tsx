"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants/nav";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            GetFluxGrowth
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs text-muted-foreground">
          AI Client Acquisition Dashboard
        </p>
      </div>
    </aside>
  );
}
