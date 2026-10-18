"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface NavbarProps {
  primaryCtaAction?: "open_chat" | "navigate_contact";
}

/**
 * Global Blueprint Navigation Header
 * Features brand logo, active route indicators, mechanical hardware theme switcher,
 * locale switcher, and chamfered primary CTA.
 */
export function Navbar({ primaryCtaAction = "open_chat" }: NavbarProps) {
  const t = useTranslations("nav");
  const tCta = useTranslations("cta");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/projects", label: t("projects") },
    { href: "/contact", label: t("contact") },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-bg-surface/95 backdrop-blur-sm border-b border-border-grid transition-colors">
      <div className="blueprint-container px-4 sm:px-6 lg:px-8">
        {/* Blueprint Corner Crosshairs */}
        <span className="blueprint-crosshair top-0 left-0 hidden md:flex">+</span>
        <span className="blueprint-crosshair top-0 right-0 hidden md:flex">+</span>
        <span className="blueprint-crosshair bottom-0 left-0 hidden md:flex">+</span>
        <span className="blueprint-crosshair bottom-0 right-0 hidden md:flex">+</span>

        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-2 font-mono text-xs uppercase tracking-wider"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 border transition-all duration-150 ${
                    active
                      ? "border-accent-primary bg-bg-elevated text-accent-primary font-bold"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-grid"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="inline-block me-1 text-text-muted">
                    {active ? "//" : "/"}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Controls: Locale Switcher, Theme Switcher, CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />

            {/* Primary Action Button */}
            <Link
              href="/contact"
              className="btn-primary clip-chamfer inline-flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
            >
              <span>{tCta("initialize")}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile Menu Trigger & Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Theme toggle visible on tablet/larger mobile */}
            <div className="hidden sm:inline-flex">
              <ThemeToggle />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] p-2.5 border border-border-grid bg-bg-surface text-text-primary hover:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary flex items-center justify-center transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t("close") : t("menu")}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Blur Scrim */}
          <div
            className="lg:hidden fixed inset-0 top-16 md:top-20 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Surface */}
          <div
            className="lg:hidden fixed inset-x-0 top-16 md:top-20 z-50 bg-bg-surface border-b border-border-grid shadow-2xl max-h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain transition-all"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="blueprint-container px-4 py-6 space-y-5">
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link, idx) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between min-h-[48px] px-4 py-3 border font-mono text-sm uppercase tracking-wider transition-colors ${
                        active
                          ? "border-accent-primary bg-bg-elevated text-accent-primary font-bold"
                          : "border-border-grid text-text-primary hover:bg-bg-elevated"
                      }`}
                    >
                      <span>{link.label}</span>
                      <span className="text-text-muted text-xs">// 0{idx + 1}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile System Settings (Theme & Locale) */}
              <div className="p-3.5 bg-bg-elevated/60 border border-border-grid space-y-3 font-mono">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-text-muted text-[11px] uppercase tracking-wider">// THEME</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border-grid/60">
                  <span className="text-text-muted text-[11px] uppercase tracking-wider">// LANGUAGE</span>
                  <LocaleSwitcher />
                </div>
              </div>

              {/* Full Width Primary CTA */}
              <div className="pt-2">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-primary clip-chamfer min-h-[48px] flex items-center justify-center gap-2 py-3.5 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider text-center transition-transform active:scale-[0.98]"
                >
                  <span>{tCta("initialize")}</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
