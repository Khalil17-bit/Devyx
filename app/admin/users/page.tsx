import * as React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/admin-auth";
import { listAdminUsers } from "@/actions/admin-users";
import { AdminUsersManager } from "@/components/admin/admin-users-manager";

export const metadata = {
  title: "Admin Accounts // Devyx Control Center",
  description: "Administrative access control and operator credential management",
};

export default async function AdminUsersPage() {
  const session = await getAdminSession();

  if (!session.authenticated) {
    redirect("/admin/login");
  }

  if (session.role !== "Super Admin") {
    redirect("/admin/dashboard");
  }

  const result = await listAdminUsers();
  const users = result.success && result.data ? result.data : [];

  return (
    <AdminUsersManager
      initialUsers={users}
      currentUserId={session.id}
      currentUserEmail={session.email}
    />
  );
}
