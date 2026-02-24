import OrderDetailClient from "@/features/orders/OrderDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}
