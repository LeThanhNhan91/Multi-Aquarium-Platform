"use client";

import Link from "next/link";
import {
  Fish,
  ChevronRight,
  Package,
  MapPin,
  Store,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetOrderByIdQuery, useCreatePaymentUrlMutation } from "@/services/orderApi";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  OrderStatus,
} from "@/types/order.type";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

interface Props {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: Props) {
  const { data: response, isLoading, isError } = useGetOrderByIdQuery(orderId);
  const order = response?.data;

  const [createPaymentUrl, { isLoading: paymentLoading }] =
    useCreatePaymentUrlMutation();

  const handleRetryPayment = async () => {
    if (!orderId) return;
    try {
      const result = await createPaymentUrl({
        orderId,
        paymentMethod: "VNPay",
      }).unwrap();
      window.location.href = result.paymentUrl;
    } catch {
      // handled globally
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này
          </p>
          <Button asChild variant="outline">
            <Link href="/products">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusClass =
    ORDER_STATUS_COLORS[order.status as OrderStatus] ??
    "text-muted-foreground bg-muted";
  const statusLabel =
    ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status;

  const formattedDate = new Date(order.createdAt).toLocaleString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Fish className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline text-sm font-bold font-serif text-foreground">
                AquaMarket
              </span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Chi tiết đơn hàng
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Đơn hàng #{orderId.slice(0, 8).toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <span
            className={cn(
              "self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-semibold border",
              statusClass,
            )}
          >
            {statusLabel}
          </span>
        </div>

        {/* Order Items */}
        <Card className="border-border/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Sản phẩm đã đặt
            </h2>
          </div>
          <div className="divide-y divide-border/30">
            {order.items.map((item, idx) => (
              <div key={idx} className="px-6 py-4 flex justify-between gap-4">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.priceAtPurchase.toLocaleString("vi-VN")}đ ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-primary whitespace-nowrap">
                  {item.totalLineAmount.toLocaleString("vi-VN")}đ
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-muted/20 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Tổng cộng</span>
              <span className="text-xl font-bold text-primary">
                {order.totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </Card>

        {/* Shipping & Store Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-border/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Địa chỉ giao hàng
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {order.shippingAddress}
            </p>
            <Separator className="bg-border/30" />
            <div className="text-sm">
              <span className="text-muted-foreground">Người đặt: </span>
              <span className="font-medium text-foreground">
                {order.customerName}
              </span>
            </div>
            {order.note && (
              <div className="text-sm">
                <span className="text-muted-foreground">Ghi chú: </span>
                <span className="text-foreground">{order.note}</span>
              </div>
            )}
          </Card>

          <Card className="border-border/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Thông tin cửa hàng
              </h3>
            </div>
            <p className="text-sm font-medium text-foreground">
              {order.storeName}
            </p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {order.status === "Pending" && (
            <Button
              onClick={handleRetryPayment}
              disabled={paymentLoading}
              className="flex-1 rounded-xl py-5 font-semibold"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang chuyển hướng...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Thanh toán ngay
                </>
              )}
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-xl py-5 font-semibold"
          >
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
