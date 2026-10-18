"use client";

import * as React from "react";
import {
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type AdminUserData,
} from "@/actions/admin-users";
import { type AdminRole } from "@/lib/security/roles";
import { formatDateSafe, formatDateTimeSafe } from "@/lib/utils/format-date";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  User,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Search,
  Eye,
  EyeOff,
  Terminal,
  Shield,
} from "lucide-react";

interface AdminUsersManagerProps {
  initialUsers: AdminUserData[];
  currentUserId: string | null;
  currentUserEmail: string | null;
}

export function AdminUsersManager({
  initialUsers,
  currentUserId,
  currentUserEmail,
}: AdminUsersManagerProps) {
  const [users, setUsers] = React.useState<AdminUserData[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUserData | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<AdminUserData | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Create form fields
  const [createEmail, setCreateEmail] = React.useState("");
  const [createPassword, setCreatePassword] = React.useState("");
  const [createName, setCreateName] = React.useState("");
  const [createRole, setCreateRole] = React.useState<AdminRole>("Administrator");

  // Edit form fields
  const [editEmail, setEditEmail] = React.useState("");
  const [editPassword, setEditPassword] = React.useState("");
  const [editName, setEditName] = React.useState("");
  const [editRole, setEditRole] = React.useState<AdminRole>("Administrator");

  function showBanner(type: "success" | "error", message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  // Filtered users
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Open Edit Modal
  function handleOpenEdit(user: AdminUserData) {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditPassword("");
    setEditName(user.full_name || "");
    setEditRole((user.role as AdminRole) || "Administrator");
    setFormError(null);
    setShowPassword(false);
  }

  // Handle Create User
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const res = await createAdminUser({
      email: createEmail,
      password: createPassword,
      full_name: createName,
      role: createRole,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setUsers((prev) => [res.data!, ...prev]);
      setIsCreateOpen(false);
      setCreateEmail("");
      setCreatePassword("");
      setCreateName("");
      setCreateRole("Administrator");
      showBanner("success", res.message || "Admin provisioned successfully.");
    } else {
      setFormError(res.message || "Failed to create administrator account.");
    }
  }

  // Handle Edit User
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    setFormError(null);

    const res = await updateAdminUser({
      userId: editingUser.id,
      email: editEmail,
      password: editPassword || undefined,
      full_name: editName,
      role: editRole,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? res.data! : u))
      );
      setEditingUser(null);
      showBanner("success", res.message || "Admin updated successfully.");
    } else {
      setFormError(res.message || "Failed to update administrator account.");
    }
  }

  // Handle Delete User
  async function handleDeleteConfirm() {
    if (!deletingUser) return;

    setIsSubmitting(true);
    const res = await deleteAdminUser(deletingUser.id);
    setIsSubmitting(false);

    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
      showBanner("success", res.message || "Admin account deleted.");
    } else {
      showBanner("error", res.message || "Failed to delete administrator.");
      setDeletingUser(null);
    }
  }

  return (
    <div className="space-y-6 select-none font-mono">
      {/* Header */}
      <div className="border-b border-border-grid pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-bg-surface border border-border-grid text-[10px] text-accent-signal uppercase tracking-technical mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-operational animate-pulse" />
            <span>SYS_ADMIN // ACCESS_CONTROL_MATRIX</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Administrator Accounts
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage authenticated cryptographic administrative credentials and operators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreateOpen(true);
            setFormError(null);
            setShowPassword(false);
          }}
          className="btn-primary clip-chamfer h-11 px-5 bg-accent-primary text-bg-primary text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Admin</span>
        </button>
      </div>

      {/* Status Banner */}
      {notification && (
        <div
          className={`p-3 border text-xs flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-status-operational/10 border-status-operational text-status-operational"
              : "bg-status-error/10 border-status-error text-status-error"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-bg-surface border border-border-grid flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">
              Total Administrators
            </span>
            <span className="font-display text-2xl font-bold text-text-primary">
              {users.length}
            </span>
          </div>
          <div className="w-9 h-9 bg-bg-elevated border border-border-grid flex items-center justify-center text-accent-primary">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 bg-bg-surface border border-border-grid flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">
              Active Security Guard
            </span>
            <span className="text-xs font-bold text-status-operational flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-status-operational animate-pulse" />
              SUPABASE_AUTH_ACTIVE
            </span>
          </div>
          <div className="w-9 h-9 bg-bg-elevated border border-border-grid flex items-center justify-center text-status-operational">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 bg-bg-surface border border-border-grid flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block truncate">
              Active Session Operator
            </span>
            <span className="text-xs font-bold text-text-primary block truncate mt-1" title={currentUserEmail || ""}>
              {currentUserEmail || "admin@devyx.com"}
            </span>
          </div>
          <div className="w-9 h-9 bg-bg-elevated border border-border-grid flex items-center justify-center text-accent-signal flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-bg-surface border border-border-grid p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-text-muted flex-shrink-0 ms-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by email, operator name, or administrative role..."
          className="bg-transparent border-none text-xs text-text-primary placeholder:text-text-muted focus:outline-none w-full"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-text-muted hover:text-text-primary text-[10px] uppercase px-2 py-0.5 border border-border-grid"
          >
            Clear
          </button>
        )}
      </div>

      {/* Administrators Table */}
      <div className="bg-bg-surface border border-border-grid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-border-grid bg-bg-elevated text-text-muted text-[10px] uppercase">
                <th className="py-3 px-4 text-start">Operator / Email</th>
                <th className="py-3 px-4 text-start">Assigned Role</th>
                <th className="py-3 px-4 text-start">Status</th>
                <th className="py-3 px-4 text-start">Created</th>
                <th className="py-3 px-4 text-start">Last Session</th>
                <th className="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grid">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    <Terminal className="w-5 h-5 mx-auto mb-2 text-text-muted opacity-50" />
                    <span>No administrator accounts match the specified query.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentSessionUser =
                    user.id === currentUserId ||
                    (currentUserEmail &&
                      user.email.toLowerCase() === currentUserEmail.toLowerCase());

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-bg-elevated transition-colors ${
                        isCurrentSessionUser ? "bg-accent-primary/5" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-bg-elevated border border-border-grid flex items-center justify-center text-text-secondary font-bold text-[11px] flex-shrink-0">
                            {user.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary truncate">
                                {user.email}
                              </span>
                              {isCurrentSessionUser && (
                                <span className="px-1.5 py-0.2 bg-accent-primary text-bg-primary text-[9px] font-bold uppercase tracking-wider">
                                  YOU
                                </span>
                              )}
                            </div>
                            {user.full_name && (
                              <span className="text-[11px] text-text-muted block truncate">
                                {user.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 bg-bg-elevated border border-border-grid text-[10px] font-bold text-accent-signal uppercase">
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-status-operational font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-operational" />
                          <span>CONFIRMED</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-text-muted text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-text-muted" />
                          <span suppressHydrationWarning>{formatDateSafe(user.created_at)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-text-muted text-[11px]">
                        {user.last_sign_in_at ? (
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <Clock className="w-3 h-3 text-accent-signal" />
                            <span suppressHydrationWarning>{formatDateTimeSafe(user.last_sign_in_at)}</span>
                          </div>
                        ) : (
                          <span className="text-text-muted opacity-60">Never</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            title="Edit Credentials"
                            className="p-1.5 text-text-secondary hover:text-accent-primary border border-border-grid hover:border-accent-primary bg-bg-elevated transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(user)}
                            disabled={isCurrentSessionUser || users.length <= 1}
                            title={
                              isCurrentSessionUser
                                ? "Cannot delete currently logged-in account"
                                : users.length <= 1
                                ? "Cannot delete the sole administrator"
                                : "Revoke Administrator Access"
                            }
                            className="p-1.5 text-status-error/70 hover:text-status-error border border-border-grid hover:border-status-error bg-bg-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-grid p-6 clip-chamfer shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border-grid pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-accent-primary" />
                <span className="font-display font-bold text-base text-text-primary uppercase tracking-wider">
                  Provision Administrator
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-status-error/10 border border-status-error text-status-error text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase block">
                  Admin Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="operator@devyx.com"
                    className="w-full h-10 ps-9 pe-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase block">
                  Initial Password * (min 6 characters)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 ps-9 pe-10 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block">
                    Full Name / Designation
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="e.g. Sarah Connor"
                      className="w-full h-10 ps-9 pe-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block">
                    Administrative Role
                  </label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as AdminRole)}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Lead Developer">Lead Developer</option>
                    <option value="Operations Officer">Operations Officer</option>
                    <option value="Content Editor">Content Editor</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border-grid">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-border-grid text-text-secondary hover:text-text-primary hover:bg-bg-elevated text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary clip-chamfer px-5 py-2.5 bg-accent-primary text-bg-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border-grid p-6 clip-chamfer shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border-grid pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-accent-primary" />
                <span className="font-display font-bold text-base text-text-primary uppercase tracking-wider">
                  Update Administrator Credentials
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-status-error/10 border border-status-error text-status-error text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase block">
                  Admin Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-10 ps-9 pe-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase block">
                  Reset Password (leave blank to keep unchanged)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Keep current password or enter new password..."
                    className="w-full h-10 ps-9 pe-10 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block">
                    Full Name / Designation
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-10 ps-9 pe-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block">
                    Administrative Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as AdminRole)}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Lead Developer">Lead Developer</option>
                    <option value="Operations Officer">Operations Officer</option>
                    <option value="Content Editor">Content Editor</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border-grid">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-border-grid text-text-secondary hover:text-text-primary hover:bg-bg-elevated text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary clip-chamfer px-5 py-2.5 bg-accent-primary text-bg-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-bg-surface border border-status-error/40 p-6 clip-chamfer shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-status-error">
              <div className="w-10 h-10 bg-status-error/10 border border-status-error flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm uppercase text-text-primary">
                  Revoke Administrator Access?
                </h3>
                <span className="text-[10px] text-text-muted block">
                  ACTION CANNOT BE REVERSED
                </span>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to permanently revoke credentials and delete administrator{" "}
              <strong className="text-status-error font-mono">{deletingUser.email}</strong>? They
              will immediately lose all access to the Devyx Control Center.
            </p>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-border-grid">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-border-grid text-text-secondary hover:text-text-primary text-xs uppercase"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 bg-status-error text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-status-error/90 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Revocation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
