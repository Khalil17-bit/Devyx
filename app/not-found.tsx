"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center font-mono p-4">
        <div className="text-center space-y-4 p-8 border border-border-grid bg-bg-surface clip-chamfer max-w-md">
          <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block">
            // STATUS_CODE: 404
          </span>
          <h1 className="text-3xl font-bold tracking-tight">404 // NOT_FOUND</h1>
          <p className="text-xs text-text-muted">
            The requested technical coordinate or route node does not exist in the routing table.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-accent-primary text-bg-primary text-xs font-bold uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
          >
            Return to Hub
          </Link>
        </div>
      </body>
    </html>
  );
}
