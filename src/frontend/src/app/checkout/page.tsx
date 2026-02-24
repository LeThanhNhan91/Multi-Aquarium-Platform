import { Suspense } from "react";
import CheckoutPageClient from "@/features/checkout/CheckoutPageClient";
import { FishLoading } from "@/app/Loading";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<FishLoading isLoading={true} />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
