import { getCachedServices } from "@/lib/data/cached-queries";
import { ServicesManager } from "@/components/admin/services-manager";

export default async function AdminServicesPage() {
  const services = await getCachedServices();
  return <ServicesManager initialServices={services} />;
}
