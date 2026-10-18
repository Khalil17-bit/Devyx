import * as React from "react";
import "@/app/globals.css";
import { getAdminSession } from "@/actions/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";
import {
  spaceGrotesk,
  plusJakartaSans,
  jetbrainsMono,
} from "@/lib/fonts";

export const metadata = {
  title: "Devyx CMS // Admin Control Room",
  description: "Devyx administrative headless CMS control center",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  let unreadCount = 0;
  try {
    let client;
    try {
      client = createAdminClient();
    } catch {
      client = createStaticClient();
    }

    const { count, error } = await client
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "new");

    if (!error && count !== null) {
      unreadCount = count;
    }
  } catch {
    // Non-blocking in dev
  }

  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="dark"
      className={`
        ${spaceGrotesk.variable}
        ${plusJakartaSans.variable}
        ${jetbrainsMono.variable}
        dark
      `}
    >
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased font-sans">
        <AdminShell
          userEmail={session.email || "admin@devyx.com"}
          userRole={session.role}
          unreadLeadsCount={unreadCount}
        >
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
