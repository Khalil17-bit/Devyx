"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/actions/admin-auth";
import {
  LayoutDashboard,
  FileText,
  Layers,
  FolderGit2,
  Share2,
  Inbox,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Terminal,
  Shield,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string;
  unreadLeadsCount?: number;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "Page Copy & Hero",
    href: "/admin/content",
    icon: FileText,
    badge: null,
  },
  {
    label: "Services Catalog",
    href: "/admin/services",
    icon: Layers,
    badge: null,
  },
  {
    label: "Projects & Cases",
    href: "/admin/projects",
    icon: FolderGit2,
    badge: null,
  },
  {
    label: "Social Hub",
    href: "/admin/socials",
    icon: Share2,
    badge: null,
  },
  {
    label: "Leads CRM",
    href: "/admin/leads",
    icon: Inbox,
    badge: "unread",
  },
];

export function AdminShell({
  children,
  userEmail,
  unreadLeadsCount = 0,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // If viewing login page, render children without sidebar shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col antialiased selection:bg-accent-primary selection:text-bg-primary">
      {/* Top Coordinate Bar */}
      <header className="h-14 bg-bg-surface border-b border-border-grid px-4 sm:px-6 flex items-center justify-between z-30 font-mono text-xs select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-text-muted hover:text-text-primary border border-border-grid"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-operational animate-pulse" />
            <span className="font-bold tracking-wider text-text-primary uppercase">
              DEVYX // CMS_CONTROL_ROOM
            </span>
          </Link>

          <span className="hidden md:inline-block text-[10px] text-text-muted px-2 py-0.5 border border-border-grid">
            NODE: PROD_EAST_01
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/en"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-text-secondary hover:text-accent-primary transition-colors px-2 py-1 border border-border-grid hover:border-accent-primary"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-text-muted text-[11px]">
            <Shield className="w-3 h-3 text-accent-signal" />
            <span>{userEmail}</span>
          </div>

          <form action={adminLogout}>
            <button
              type="submit"
              title="Sign Out"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-status-error/10 border border-status-error text-status-error hover:bg-status-error hover:text-white transition-colors text-[11px]"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-bg-surface border-r border-border-grid flex flex-col justify-between hidden lg:flex select-none">
          <div className="p-4 space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-technical text-text-muted px-3 block mb-3">
              // CMS_NAVIGATION
            </span>
            <nav className="space-y-1 font-mono text-xs">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 transition-colors border ${
                      isActive
                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary font-bold"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge === "unread" && unreadLeadsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-status-operational text-bg-primary text-[10px] font-bold">
                        {unreadLeadsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-border-grid font-mono text-[10px] text-text-muted space-y-1">
            <div className="flex justify-between">
              <span>ZERO_SSR:</span>
              <span className="text-status-operational">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>REVALIDATION:</span>
              <span className="text-text-primary">ON_MUTATION</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-bg-primary/95 backdrop-blur-md pt-16 p-6 flex flex-col select-none">
            <nav className="space-y-2 font-mono text-sm">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 border ${
                      isActive
                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary font-bold"
                        : "border-border-grid text-text-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge === "unread" && unreadLeadsCount > 0 && (
                      <span className="px-2 py-0.5 bg-status-operational text-bg-primary text-xs font-bold">
                        {unreadLeadsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Administrative Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
