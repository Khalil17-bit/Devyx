"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "./admin-auth";
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from "@/lib/validation/admin-user";

import type { AdminUserData, AdminActionResult } from "@/types/admin";
export type { AdminUserData, AdminActionResult };

async function assertSuperAdmin() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    throw new Error("Unauthorized: Administrative session required.");
  }
  if (session.role !== "Super Admin") {
    throw new Error("Access Denied: 'Super Admin' privilege is required to manage administrator credentials.");
  }
  return session;
}

/**
 * Fetch all administrator accounts from Supabase Auth
 */
export async function listAdminUsers(): Promise<AdminActionResult<AdminUserData[]>> {
  try {
    await assertSuperAdmin();
    const client = createAdminClient();

    const { data, error } = await client.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    });

    if (error) {
      console.error("[Admin Users] Error listing users:", error);
      return {
        success: false,
        message: error.message || "Failed to load admin accounts.",
      };
    }

    const users: AdminUserData[] = (data?.users || []).map((u) => ({
      id: u.id,
      email: u.email || "",
      full_name:
        (u.user_metadata?.full_name as string) ||
        (u.user_metadata?.name as string) ||
        "",
      role:
        (u.app_metadata?.role as string) ||
        (u.user_metadata?.role as string) ||
        "Administrator",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
      email_confirmed_at: u.email_confirmed_at || null,
    }));

    return {
      success: true,
      data: users,
    };
  } catch (err: any) {
    console.error("[Admin Users] Exception listing users:", err);
    return {
      success: false,
      message: err?.message || "Failed to retrieve administrator accounts.",
    };
  }
}

/**
 * Create a new administrator account in Supabase Auth
 */
export async function createAdminUser(
  rawInput: CreateAdminUserInput
): Promise<AdminActionResult<AdminUserData>> {
  try {
    await assertSuperAdmin();

    const parseResult = createAdminUserSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || "Invalid input data.";
      return {
        success: false,
        message: firstErrorMessage,
        errors: fieldErrors,
      };
    }

    const { email, password, full_name, role } = parseResult.data;
    const client = createAdminClient();

    const userRole = role && role.trim().length > 0 ? role.trim() : "Administrator";
    const userName = full_name && full_name.trim().length > 0 ? full_name.trim() : "";

    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: userName,
        role: userRole,
      },
      app_metadata: {
        role: userRole,
      },
    });

    if (error) {
      console.error("[Admin Users] Error creating user:", error);
      return {
        success: false,
        message: error.message || "Failed to create administrator account.",
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: "Authentication service returned empty user record.",
      };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: `Admin account '${email}' successfully provisioned.`,
      data: {
        id: data.user.id,
        email: data.user.email || email,
        full_name: userName,
        role: userRole,
        created_at: data.user.created_at,
        last_sign_in_at: null,
        email_confirmed_at: data.user.email_confirmed_at || new Date().toISOString(),
      },
    };
  } catch (err: any) {
    console.error("[Admin Users] Exception creating user:", err);
    return {
      success: false,
      message: err?.message || "Failed to provision administrator account.",
    };
  }
}

/**
 * Update an existing administrator account (email, password, display name, role)
 */
export async function updateAdminUser(
  rawInput: UpdateAdminUserInput
): Promise<AdminActionResult<AdminUserData>> {
  try {
    await assertSuperAdmin();

    const parseResult = updateAdminUserSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || "Invalid update data.";
      return {
        success: false,
        message: firstErrorMessage,
        errors: fieldErrors,
      };
    }

    const { userId, email, password, full_name, role } = parseResult.data;
    const client = createAdminClient();

    // Check if user exists
    const { data: existingUser, error: fetchError } =
      await client.auth.admin.getUserById(userId);

    if (fetchError || !existingUser.user) {
      return {
        success: false,
        message: "Administrator account not found.",
      };
    }

    const currentMeta = existingUser.user.user_metadata || {};
    const updatedMeta = {
      ...currentMeta,
      ...(full_name !== undefined ? { full_name: full_name.trim() } : {}),
      ...(role !== undefined ? { role: role.trim() } : {}),
    };

    const updatePayload: {
      email?: string;
      email_confirm?: boolean;
      password?: string;
      user_metadata?: Record<string, any>;
      app_metadata?: Record<string, any>;
    } = {
      user_metadata: updatedMeta,
      app_metadata: {
        ...(existingUser.user.app_metadata || {}),
        ...(role !== undefined ? { role: role.trim() } : {}),
      },
    };

    if (email && email.toLowerCase() !== existingUser.user.email?.toLowerCase()) {
      updatePayload.email = email;
      updatePayload.email_confirm = true;
    }

    if (password && password.trim().length >= 6) {
      updatePayload.password = password.trim();
    }

    const { data: updated, error: updateError } =
      await client.auth.admin.updateUserById(userId, updatePayload);

    if (updateError) {
      console.error("[Admin Users] Error updating user:", updateError);
      return {
        success: false,
        message: updateError.message || "Failed to update administrator account.",
      };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: `Admin account '${updated.user?.email || email}' successfully updated.`,
      data: {
        id: updated.user.id,
        email: updated.user.email || "",
        full_name:
          (updated.user.user_metadata?.full_name as string) ||
          full_name ||
          "",
        role:
          (updated.user.app_metadata?.role as string) ||
          role ||
          "Administrator",
        created_at: updated.user.created_at,
        last_sign_in_at: updated.user.last_sign_in_at || null,
        email_confirmed_at: updated.user.email_confirmed_at || null,
      },
    };
  } catch (err: any) {
    console.error("[Admin Users] Exception updating user:", err);
    return {
      success: false,
      message: err?.message || "Failed to update administrator account.",
    };
  }
}

/**
 * Delete an administrator account with safety guards
 */
export async function deleteAdminUser(
  userId: string
): Promise<AdminActionResult<void>> {
  try {
    const session = await assertSuperAdmin();
    const client = createAdminClient();

    // Guard 1: Don't allow an admin to delete their own currently active session
    if (session.id === userId) {
      return {
        success: false,
        message:
          "Security restriction: You cannot delete your own active administrator account while logged in.",
      };
    }

    // Guard 2: Don't allow deleting the only remaining administrator account
    const { data: userList, error: listError } = await client.auth.admin.listUsers({
      page: 1,
      perPage: 10,
    });

    if (!listError && userList?.users && userList.users.length <= 1) {
      return {
        success: false,
        message:
          "Critical safeguard: Cannot delete the only remaining administrator account.",
      };
    }

    const { error: deleteError } = await client.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("[Admin Users] Error deleting user:", deleteError);
      return {
        success: false,
        message: deleteError.message || "Failed to delete administrator account.",
      };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Administrator account removed successfully.",
    };
  } catch (err: any) {
    console.error("[Admin Users] Exception deleting user:", err);
    return {
      success: false,
      message: err?.message || "Failed to remove administrator account.",
    };
  }
}
