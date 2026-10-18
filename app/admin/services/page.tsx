import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/admin-auth";
import { hasPermission } from "@/lib/security/roles";
import { getCachedServices } from "@/lib/data/cached-queries";
import { ServicesManager } from "@/components/admin/services-manager";

export default async function AdminServicesPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }
  if (!hasPermission(session.role, "manageServices")) {
    redirect("/admin/dashboard");
  }

  const services = await getCachedServices();
  return <ServicesManager initialServices={services} />;
}
