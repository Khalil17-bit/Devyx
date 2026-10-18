import { getCachedProjects } from "@/lib/data/cached-queries";
import { ProjectsManager } from "@/components/admin/projects-manager";

export default async function AdminProjectsPage() {
  const projects = await getCachedProjects();
  return <ProjectsManager initialProjects={projects} />;
}
