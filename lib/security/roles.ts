/**
 * Devyx Platform — Role-Based Access Control (RBAC) Matrix
 * Enforces granular administrative privileges across Server Actions, UI components, and API routes.
 */

export const ADMIN_ROLES = [
  "Super Admin",
  "Administrator",
  "Lead Developer",
  "Operations Officer",
  "Content Editor",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface RolePermissions {
  /** Can view, provision, update credentials, and delete administrator accounts */
  manageUsers: boolean;
  /** Can toggle master switches (enable_contact_form, chatbot_enabled, primary_cta) */
  manageSettings: boolean;
  /** Can access Leads CRM, view contact messages, update status, and take notes */
  manageLeads: boolean;
  /** Can modify trilingual page copy, hero headlines, and editorial text */
  manageContent: boolean;
  /** Can create, modify, reorder, and delete agency service offerings */
  manageServices: boolean;
  /** Can create, edit case studies, upload gallery images, and manage portfolio */
  manageProjects: boolean;
  /** Can configure WhatsApp, Telegram, and social media communication links */
  manageSocials: boolean;
}

export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  "Super Admin": {
    manageUsers: true,
    manageSettings: true,
    manageLeads: true,
    manageContent: true,
    manageServices: true,
    manageProjects: true,
    manageSocials: true,
  },
  Administrator: {
    manageUsers: false,
    manageSettings: true,
    manageLeads: true,
    manageContent: true,
    manageServices: true,
    manageProjects: true,
    manageSocials: true,
  },
  "Lead Developer": {
    manageUsers: false,
    manageSettings: false,
    manageLeads: false,
    manageContent: false,
    manageServices: true,
    manageProjects: true,
    manageSocials: false,
  },
  "Operations Officer": {
    manageUsers: false,
    manageSettings: false,
    manageLeads: true,
    manageContent: false,
    manageServices: false,
    manageProjects: false,
    manageSocials: true,
  },
  "Content Editor": {
    manageUsers: false,
    manageSettings: false,
    manageLeads: false,
    manageContent: true,
    manageServices: true,
    manageProjects: true,
    manageSocials: false,
  },
};

/**
 * Check if a given role has a specific permission
 */
export function hasPermission(
  role: AdminRole | string | null | undefined,
  permission: keyof RolePermissions
): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role as AdminRole];
  if (!perms) return false;
  return !!perms[permission];
}

/**
 * Retrieve permissions for a role, defaulting to least-privilege
 */
export function getPermissionsForRole(role: AdminRole | string | null | undefined): RolePermissions {
  if (role && (role in ROLE_PERMISSIONS)) {
    return ROLE_PERMISSIONS[role as AdminRole];
  }
  return {
    manageUsers: false,
    manageSettings: false,
    manageLeads: false,
    manageContent: false,
    manageServices: false,
    manageProjects: false,
    manageSocials: false,
  };
}
