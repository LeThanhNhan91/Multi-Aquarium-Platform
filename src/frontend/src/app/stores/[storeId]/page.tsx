import StoreDetailPageClient from "@/features/stores/StoreDetailPageClient";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const resolvedParams = await params;
  return <StoreDetailPageClient storeId={resolvedParams.storeId} />;
}
