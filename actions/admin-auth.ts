"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerAuthClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/security/roles";
import type { AdminAuthResult, AdminSession } from "@/types/admin";
export type { AdminAuthResult, AdminSession };

/**
 * Server Action: Authenticate Admin via Supabase Auth
 */
export async function adminLogin(formData: FormData): Promise<AdminAuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = (formData.get("next") as string) || "/admin/dashboard";

  if (!email || !password) {
    return {
      success: false,
      message: "Please provide both email and administrative password.",
    };
  }

  try {
    const supabase = await createServerAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Local development fallback if live Supabase project is not yet configured
      if (
        (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ||
          !process.env.SUPABASE_SERVICE_ROLE_KEY) &&
        email === "admin@devyx.com" &&
        password === "admin123"
      ) {
        const cookieStore = await cookies();
        cookieStore.set("devyx_dev_admin_session", "authenticated", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        return { success: true };
      }

      return {
        success: false,
        message: error.message || "Invalid administrative credentials.",
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: "No user account returned from authentication provider.",
      };
    }

    return { success: true };
  } catch (err: any) {
    // Check dev fallback
    if (email === "admin@devyx.com" && password === "admin123") {
      const cookieStore = await cookies();
      cookieStore.set("devyx_dev_admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return { success: true };
    }

    return {
      success: false,
      message: err?.message || "Failed to establish secure session.",
    };
  }
}

/**
 * Server Action: Sign out Admin and clear session cookies
 */
export async function adminLogout() {
  try {
    const supabase = await createServerAuthClient();
    await supabase.auth.signOut();
  } catch {
    // Non-blocking
  }

  const cookieStore = await cookies();
  cookieStore.delete("devyx_dev_admin_session");
  redirect("/admin/login");
}

/**
 * Helper to verify current admin session
 */
export async function getAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const devSession = cookieStore.get("devyx_dev_admin_session")?.value;

  try {
    const supabase = await createServerAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const role =
        (user.app_metadata?.role as AdminRole) ||
        (user.user_metadata?.role as AdminRole) ||
        "Super Admin";

      return {
        authenticated: true,
        email: user.email || "admin@devyx.com",
        id: user.id,
        role,
      };
    }
  } catch {
    // Supabase auth client may fail in local stub
  }

  if (devSession === "authenticated") {
    return {
      authenticated: true,
      email: "admin@devyx.com",
      id: "dev-admin-id",
      role: "Super Admin",
    };
  }

  return {
    authenticated: false,
    email: null,
    id: null,
    role: null,
  };
}
