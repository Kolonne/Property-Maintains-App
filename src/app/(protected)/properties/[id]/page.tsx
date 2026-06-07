import PropertyDashboardClient from "@/components/properties/PropertyDashboardClient";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PropertyDashboardClient propertyId={Number(id)} />;
}
