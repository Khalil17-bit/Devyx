import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/admin-auth";
import { hasPermission } from "@/lib/security/roles";
import { getCachedProjects } from "@/lib/data/cached-queries";
import { ProjectsManager } from "@/components/admin/projects-manager";

export default async function AdminProjectsPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }
  if (!hasPermission(session.role, "manageProjects")) {
    redirect("/admin/dashboard");
  }

  const projects = await getCachedProjects();
  return <ProjectsManager initialProjects={projects} />;
}
