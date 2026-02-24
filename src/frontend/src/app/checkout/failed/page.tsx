"use client";

import Link from "next/link";
import { XCircle, Fish, RefreshCw, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Failed icon */}
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Thanh toán thất bại
          </h1>
          <p className="text-muted-foreground">
            Giao dịch của bạn chưa thành công. Đơn hàng vẫn được giữ, bạn có
            thể thử thanh toán lại.
          </p>
        </div>

        <Card className="border-red-200 dark:border-red-800/40 rounded-2xl p-4 bg-red-50 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">
            Nếu tiền đã bị trừ khỏi tài khoản, vui lòng liên hệ với chúng tôi
            hoặc ngân hàng của bạn để được hỗ trợ hoàn tiền.
          </p>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 rounded-xl" variant="default">
            <Link href="/products">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Link>
          </Button>
          <Button asChild className="flex-1 rounded-xl" variant="outline">
            <Link href="/products">
              <Fish className="h-4 w-4 mr-2" />
              Về trang chủ
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <PhoneCall className="h-3 w-3" />
          <span>Hỗ trợ khách hàng: 1900-xxxx</span>
        </div>
      </div>
    </main>
  );
}
