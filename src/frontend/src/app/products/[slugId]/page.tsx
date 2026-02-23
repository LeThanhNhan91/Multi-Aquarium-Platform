import ProductDetailPage from "@/features/product-detail/ProductDetails";

interface Props {
  params: Promise<{ slugId: string }>;
}

export default async function Page({ params }: Props) {
  const { slugId } = await params;
  // URL pattern: /products/[slug]-[uuid]
  // UUID is exactly 36 chars (e.g. f52063f1-b4a6-446e-bf61-38352305c9e2)
  const productId = slugId.slice(-36);

  return <ProductDetailPage productId={productId} />;
}
