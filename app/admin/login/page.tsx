"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin } from "@/actions/admin-auth";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, Terminal } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin/dashboard";

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("next", nextUrl);

    const result = await adminLogin(formData);

    if (result.success) {
      router.push(nextUrl);
      router.refresh();
    } else {
      setIsLoading(false);
      setErrorMessage(result.message || "Authentication rejected.");
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-4 selection:bg-accent-primary selection:text-bg-primary">
      {/* Background blueprint coordinate markings */}
      <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-surface border border-border-grid font-mono text-[10px] text-accent-signal uppercase tracking-technical">
            <span className="w-2 h-2 rounded-full bg-status-operational animate-pulse" />
            <span>SYS_ADMIN // SECURE_AUTH_NODE</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary">
            Devyx CMS Terminal
          </h1>
          <p className="font-mono text-xs text-text-muted">
            Administrative credentials required for system modifications.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-bg-surface border border-border-grid p-6 sm:p-8 clip-chamfer shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3 bg-status-error/10 border border-status-error text-status-error font-mono text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5 text-start">
              <label htmlFor="email" className="text-text-muted uppercase text-[10px] block">
                Administrative Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  defaultValue="admin@devyx.com"
                  placeholder="admin@devyx.com"
                  className="w-full h-11 ps-9 pe-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-start">
              <label htmlFor="password" className="text-text-muted uppercase text-[10px] block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  defaultValue="admin123"
                  placeholder="••••••••••••"
                  className="w-full h-11 ps-9 pe-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary clip-chamfer h-12 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Access Control Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-border-grid text-center font-mono text-[10px] text-text-muted">
            <span>DEFAULT_DEV_ACCESS: </span>
            <span className="text-text-primary">admin@devyx.com // admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
