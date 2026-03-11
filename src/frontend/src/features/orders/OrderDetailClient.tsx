"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Star,
  MessageSquareQuote,
  CheckCircle2,
  Clock,
  Truck,
  CircleDot,
  XCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  useGetOrderByIdQuery,
  useCreatePaymentUrlMutation,
} from "@/services/orderApi";
import { useGetOrderReviewsQuery } from "@/services/reviewApi";
import { Review } from "@/types/review.type";
import { ReviewForm } from "@/features/product-detail/customer/ReviewForm";
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

// ── Status stepper ─────────────────────────────────────────────────────────────
const STATUS_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "Pending", label: "Chờ xác nhận", icon: Clock },
  { key: "Confirmed", label: "Đã xác nhận", icon: CheckCircle2 },
  { key: "Processing", label: "Đang xử lý", icon: CircleDot },
  { key: "Shipping", label: "Đang giao", icon: Truck },
  { key: "Completed", label: "Hoàn thành", icon: CheckCircle2 },
];

function StatusStepper({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-destructive/8 border border-destructive/20">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 border border-destructive/30 shrink-0">
          <XCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold text-destructive">
            Đơn hàng đã bị huỷ
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đơn hàng không thể khôi phục sau khi huỷ
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  // For terminal "Completed" status, treat all steps as done (line = 100%)
  const isCompleted = status === "Completed";
  const progressPct = isCompleted
    ? 100
    : currentIdx <= 0
      ? 0
      : (currentIdx / (STATUS_STEPS.length - 1)) * 100;

  return (
    <div className="relative flex items-start justify-between gap-0">
      {/* connecting line — background track */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-border/50 z-0" />
      {/* connecting line — filled portion (right-4 mirrors the left-4 offset) */}
      <div
        className="absolute top-4 left-4 right-4 h-0.5 bg-primary z-0 transition-all duration-500 origin-left"
        style={{ transform: `scaleX(${progressPct / 100})` }}
      />

      {STATUS_STEPS.map((step, idx) => {
        const done = isCompleted ? true : idx < currentIdx;
        const active = !isCompleted && idx === currentIdx;
        const Icon = step.icon;
        return (
          <div
            key={step.key}
            className="relative z-10 flex flex-col items-center gap-1.5 flex-1"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                done
                  ? "bg-primary border-primary text-primary-foreground"
                  : active
                    ? "bg-primary/10 border-primary text-primary shadow-sm shadow-primary/20"
                    : "bg-background border-border text-muted-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium text-center leading-tight max-w-[60px]",
                active
                  ? "text-primary"
                  : done
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
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
  const total = images.length;
  if (total === 0 && !videoUrl) return null;

  return (
    <div className="space-y-2 mt-2">
      {total > 0 && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
          <Image
            src={images[activeIdx]}
            alt={`Ảnh cá ${activeIdx + 1}`}
            fill
            className="object-cover"
          />
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
      {total > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {images.map((url, i) => (
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
function OrderItemRow({
  item,
  orderStatus,
  review,
  onWriteReview,
}: {
  item: OrderItemResponse;
  orderStatus: OrderStatus;
  review?: Review;
  onWriteReview: (productId: string) => void;
}) {
  const isFish = !!item.fishInstanceId;
  const hasImages = isFish && (item.fishImages?.length ?? 0) > 0;
  const hasVideo = isFish && !!item.fishVideoUrl;
  const [expanded, setExpanded] = useState(false);
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative h-[72px] w-[72px] shrink-0 rounded-xl overflow-hidden bg-muted border border-border/30">
          {item.productImageUrl ? (
            <Image
              src={item.productImageUrl}
              alt={item.productName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Fish className="h-6 w-6 text-muted-foreground/40" />
            </div>
          )}
          {isFish && (
            <div className="absolute bottom-0 inset-x-0 bg-primary/85 text-primary-foreground text-[8px] font-bold text-center py-0.5 tracking-wide">
              CÁ SỐNG
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {item.productName}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.priceAtPurchase.toLocaleString("vi-VN")}đ × {item.quantity}
          </p>
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            {review ? (
              <button
                onClick={() => setShowReview(!showReview)}
                className="text-[10px] text-amber-600 font-semibold hover:underline flex items-center gap-1"
              >
                <MessageSquareQuote className="h-3 w-3" />
                {showReview ? "Ẩn đánh giá" : "Xem đánh giá của bạn"}
              </button>
            ) : (
              orderStatus === "Completed" && (
                <button
                  onClick={() => onWriteReview(item.productId)}
                  className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Star className="h-3 w-3" />
                  Viết đánh giá
                </button>
              )
            )}
            {isFish && (hasImages || hasVideo) && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[10px] text-primary/80 font-semibold hover:underline flex items-center gap-1"
              >
                <Images className="h-3 w-3" />
                {expanded
                  ? "Ẩn ảnh/video"
                  : `Xem ảnh/video (${(item.fishImages?.length ?? 0) + (hasVideo ? 1 : 0)})`}
              </button>
            )}
          </div>
        </div>

        {/* Line total */}
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-primary">
            {item.totalLineAmount.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      {/* Review display */}
      {review && showReview && (
        <div className="ml-[88px] p-3 rounded-xl bg-amber-50 border border-amber-100 animate-in fade-in slide-in-from-top-1">
          <p className="text-xs text-amber-900 leading-relaxed italic">
            "{review.comment}"
          </p>
          <p className="text-[10px] text-amber-700 mt-1 font-medium">
            Bạn đã đánh giá{" "}
            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      )}

      {/* Fish media */}
      {isFish && expanded && (hasImages || hasVideo) && (
        <div className="ml-[88px]">
          <FishMediaGallery
            images={item.fishImages ?? []}
            videoUrl={item.fishVideoUrl}
          />
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function OrderDetailClient({ orderId }: Props) {
  const { data: response, isLoading, isError } = useGetOrderByIdQuery(orderId);
  const order = response?.data;

  const { data: reviewsResponse } = useGetOrderReviewsQuery(orderId, {
    skip: !orderId,
  });
  const reviews = reviewsResponse?.data ?? [];

  const [reviewingProductId, setReviewingProductId] = useState<string | null>(
    null,
  );

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
    } catch {}
  };

  const reviewsMap = useMemo(() => {
    const map: Record<string, Review> = {};
    reviews.forEach((r) => {
      map[r.productId] = r;
    });
    return map;
  }, [reviews]);

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
  const fishItemCount = order.items.filter((i) => i.fishInstanceId).length;
  const formattedDate = new Date(order.createdAt).toLocaleString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border/50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-3 flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Fish className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-sm font-bold text-foreground">
              AquaMarket
            </span>
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Chi tiết đơn hàng
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 space-y-4">
        {/* ── Order title bar ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Đơn hàng{" "}
              <span className="font-mono text-primary">
                #{orderId.slice(0, 8).toUpperCase()}
              </span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
              {fishItemCount > 0 && (
                <>
                  <span>·</span>
                  <Fish className="h-3.5 w-3.5 text-primary" />
                  <span className="text-primary font-medium">
                    {fishItemCount} cá sống
                  </span>
                </>
              )}
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border mt-0.5",
              statusClass,
            )}
          >
            {statusLabel}
          </span>
        </div>

        {/* ── Status stepper ── */}
        <Card className="border-border/50 rounded-2xl p-5">
          <StatusStepper status={order.status as OrderStatus} />
        </Card>

        {/* ── Order items ── */}
        <Card className="border-border/50 rounded-2xl overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-3.5 border-b border-border/50 bg-muted/20 flex items-center gap-2">
            <Store className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              {order.storeName}
            </span>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              {order.items.length} sản phẩm
            </span>
          </div>

          {/* Items */}
          <div className="divide-y divide-border/30 px-5">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4">
                <OrderItemRow
                  item={item}
                  orderStatus={order.status as OrderStatus}
                  review={reviewsMap[item.productId]}
                  onWriteReview={(id) => setReviewingProductId(id)}
                />
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-5 py-4 bg-primary/5 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Tổng cộng
            </span>
            <span className="text-xl font-bold text-primary">
              {order.totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </Card>

        {/* ── Shipping & customer info ── */}
        <Card className="border-border/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/50 bg-muted/20 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              Thông tin giao hàng
            </span>
          </div>
          <div className="px-5 py-4 space-y-3">
            {/* Customer */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border/50">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {order.customerName}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {order.shippingAddress}
                </p>
              </div>
            </div>

            {/* Note */}
            {order.note && (
              <>
                <Separator className="bg-border/30" />
                <div className="rounded-xl bg-amber-50/60 border border-amber-200/50 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">
                    Ghi chú đơn hàng
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed italic">
                    {order.note}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* ── Payment status ── */}
        <Card className="border-border/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/50 bg-muted/20 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              Thanh toán
            </span>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Tổng tiền</p>
              <p className="text-lg font-bold text-primary">
                {order.totalAmount.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <Badge
              className={cn(
                "text-xs px-3 py-1 rounded-full font-semibold border",
                order.status === "Pending"
                  ? "border-amber-400 text-amber-600 bg-amber-50"
                  : "border-emerald-400 text-emerald-600 bg-emerald-50",
              )}
            >
              {order.status === "Pending" ? "Chờ thanh toán" : "Đã thanh toán"}
            </Badge>
          </div>
        </Card>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          {order.status === "Pending" && (
            <Button
              onClick={handleRetryPayment}
              disabled={paymentLoading}
              className="flex-1 rounded-xl h-11 font-semibold"
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
            className="flex-1 rounded-xl h-11 font-semibold"
          >
            <Link href="/products">
              <Fish className="h-4 w-4 mr-2" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      </div>

      {/* Review Form */}
      <ReviewForm
        productId={reviewingProductId || ""}
        orderId={orderId}
        open={!!reviewingProductId}
        onOpenChange={(open) => !open && setReviewingProductId(null)}
      />
    </main>
  );
}
