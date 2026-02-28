"use client";

import { useState } from "react";
import Image from "next/image";
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
  Play,
  ChevronLeft,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  useGetOrderByIdQuery,
  useCreatePaymentUrlMutation,
} from "@/services/orderApi";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  OrderStatus,
  OrderItemResponse,
} from "@/types/order.type";
import { cn } from "@/utils/utils";

interface Props {
  orderId: string;
}

// ── Fish media gallery ─────────────────────────────────────────────────────────
function FishMediaGallery({
  images,
  videoUrl,
}: {
  images: string[];
  videoUrl?: string | null;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const allMedia = [...images]; // images first (video shown separately)
  const total = allMedia.length;

  if (total === 0 && !videoUrl) return null;

  return (
    <div className="space-y-2">
      {/* Main display */}
      {allMedia.length > 0 && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
          <Image
            src={allMedia[activeIdx]}
            alt={`Ảnh cá ${activeIdx + 1}`}
            fill
            className="object-cover"
          />
          {/* Prev / Next */}
          {total > 1 && (
            <>
              <button
                onClick={() => setActiveIdx((p) => (p - 1 + total) % total)}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveIdx((p) => (p + 1) % total)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white font-medium">
                {activeIdx + 1}/{total}
              </div>
            </>
          )}
        </div>
      )}

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {allMedia.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                i === activeIdx
                  ? "border-primary"
                  : "border-border/50 hover:border-primary/50",
              )}
            >
              <Image src={url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Video link */}
      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-4 py-2.5 text-sm text-foreground hover:bg-muted/70 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <Play className="h-3.5 w-3.5 text-primary fill-primary" />
          </div>
          <span className="font-medium">Xem video cá này</span>
        </a>
      )}
    </div>
  );
}

// ── Order item row ────────────────────────────────────────────────────────────
function OrderItemRow({ item }: { item: OrderItemResponse }) {
  const isFish = !!item.fishInstanceId;
  const hasImages = isFish && (item.fishImages?.length ?? 0) > 0;
  const hasVideo = isFish && !!item.fishVideoUrl;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Thumbnail */}
        {item.productImageUrl ? (
          <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/30">
            <Image
              src={item.productImageUrl}
              alt={item.productName}
              fill
              className="object-cover"
            />
            {isFish && (
              <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-primary-foreground text-[8px] font-bold text-center py-0.5">
                CÁ SỐNG
              </div>
            )}
          </div>
        ) : (
          <div className="h-16 w-16 shrink-0 rounded-xl bg-muted border border-border/30 flex items-center justify-center">
            <Fish className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {item.productName}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.priceAtPurchase.toLocaleString("vi-VN")}đ × {item.quantity}
          </p>
          {isFish && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 h-auto border-primary/30 text-primary bg-primary/5 gap-1"
            >
              <Fish className="h-2.5 w-2.5" />
              Cá sống
            </Badge>
          )}
        </div>

        {/* Line total */}
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-primary">
            {item.totalLineAmount.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      {/* Fish media toggle */}
      {isFish && (hasImages || hasVideo) && (
        <div className="pl-[76px] space-y-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            <Images className="h-3.5 w-3.5" />
            {expanded
              ? "Ẩn ảnh/video cá"
              : `Xem ảnh/video cá (${(item.fishImages?.length ?? 0) + (hasVideo ? 1 : 0)})`}
          </button>
          {expanded && (
            <FishMediaGallery
              images={item.fishImages ?? []}
              videoUrl={item.fishVideoUrl}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
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

  const fishItemCount = order.items.filter((i) => i.fishInstanceId).length;

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
              <span className="hidden sm:inline text-sm font-bold  text-foreground">
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
              {fishItemCount > 0 && (
                <>
                  <span>·</span>
                  <Fish className="h-3 w-3 text-primary" />
                  <span className="text-primary font-medium">
                    {fishItemCount} cá sống
                  </span>
                </>
              )}
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
            <span className="ml-auto text-xs text-muted-foreground">
              {order.items.length} sản phẩm
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {order.items.map((item, idx) => (
              <div key={idx} className="px-6 py-4">
                <OrderItemRow item={item} />
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
