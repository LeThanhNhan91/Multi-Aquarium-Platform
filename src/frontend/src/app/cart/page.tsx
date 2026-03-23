import CartPageClient from "@/features/cart/CartPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giỏ hàng | MultiAqua",
  description: "Xem và quản lý giỏ hàng của bạn tại MultiAqua",
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background pt-20">
      <CartPageClient />
    </main>
  );
}
