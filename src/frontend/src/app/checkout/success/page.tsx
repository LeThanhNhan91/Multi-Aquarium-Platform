"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Fish, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center animate-bounce-once">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Thanh toán thành công! 🎉
          </h1>
          <p className="text-muted-foreground">
            Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ xử lý và giao hàng
            sớm nhất có thể.
          </p>
        </div>

        <Card className="border-border/50 rounded-2xl p-6 text-left space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <Package className="h-5 w-5" />
            <span className="font-semibold text-sm">Thông tin đơn hàng</span>
          </div>
          {orderId && (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn hàng</span>
                <span className="font-mono font-medium text-foreground text-xs">
                  {orderId.slice(0, 8).toUpperCase()}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <span className="text-green-600 font-medium">Đã thanh toán</span>
              </div>
            </div>
          )}
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          {orderId && (
            <Button asChild className="flex-1 rounded-xl" variant="default">
              <Link href={`/orders/${orderId}`}>
                <Package className="h-4 w-4 mr-2" />
                Xem đơn hàng
              </Link>
            </Button>
          )}
          <Button asChild className="flex-1 rounded-xl" variant="outline">
            <Link href="/products">
              <Fish className="h-4 w-4 mr-2" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
