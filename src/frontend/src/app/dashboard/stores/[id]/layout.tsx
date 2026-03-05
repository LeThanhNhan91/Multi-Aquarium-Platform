import StoreDashboardLayout from "@/features/store-dashboard/components/StoreDashboardLayout";

/**
 * Shared layout for all /dashboard/stores/[id]/* routes.
 * Renders the sidebar + header shell around each page's content.
 */
export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: storeId } = await params;

  return (
    <StoreDashboardLayout storeId={storeId}>{children}</StoreDashboardLayout>
  );
}
