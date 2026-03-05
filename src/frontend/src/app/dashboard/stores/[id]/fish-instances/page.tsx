import FishInstances from "@/features/product-detail/store/fish-instance/FishInstances";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ productId?: string }>;
}

export default async function FishInstancesPageRoute({
  params,
  searchParams,
}: Props) {
  const { id: storeId } = await params;
  const { productId } = await searchParams;

  if (!productId) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  return <FishInstances storeId={storeId} productId={productId} />;
}
