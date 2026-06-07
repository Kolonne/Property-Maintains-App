import TenantOnboardingClient from "@/components/properties/TenantOnboardingClient";

export default async function NewPropertyTenancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TenantOnboardingClient propertyId={Number(id)} />;
}
