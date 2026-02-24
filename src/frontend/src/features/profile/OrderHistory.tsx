"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Store,
  ExternalLink,
  CreditCard,
  Loader2,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetOrdersQuery,
  useCreatePaymentUrlMutation,
} from "@/services/orderApi";
import { useGetProfileQuery } from "@/services/userApi";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  OrderResponse,
  OrderStatus,
  PaymentStatus,
} from "@/types/order.type";
import { formatToVND, formatVietnameseDate } from "@/helper/formatter";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

const PAGE_SIZE = 8;

interface OrderCardProps {
  order: OrderResponse;
  viewAs: "buyer" | "seller";
}

function OrderCard({ order, viewAs }: OrderCardProps) {
  const [createPaymentUrl, { isLoading: paymentLoading }] =
    useCreatePaymentUrlMutation();

  const statusClass =
    ORDER_STATUS_COLORS[order.status as OrderStatus] ??
    "text-muted-foreground bg-muted border-muted";
  const paymentClass =
    PAYMENT_STATUS_COLORS[order.paymentStatus as PaymentStatus] ??
    "text-muted-foreground bg-muted border-muted";

  const canPay =
    viewAs === "buyer" &&
    order.status === "Pending" &&
    order.paymentStatus === "Unpaid";

  const handlePayment = async () => {
    try {
      const result = await createPaymentUrl({
        orderId: order.id,
        paymentMethod: "VNPay",
      }).unwrap();
      window.location.href = result.paymentUrl;
    } catch {
      toast.error("Không thể tạo liên kết thanh toán. Vui lòng thử lại.");
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-secondary/30">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={cn("text-xs border", statusClass)}
          >
            {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-xs border", paymentClass)}
          >
            {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
              order.paymentStatus}
          </Badge>
          <div>
            {/* <p className="text-xs font-mono text-muted-foreground">
              #{order.id.slice(0, 8).toUpperCase()}
            </p> */}
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatVietnameseDate(order.createdAt)}
            </p>
          </div>
        </div>
        <p className="text-sm font-bold text-foreground">
          {formatToVND(order.totalAmount)}
        </p>
      </div>

      <Separator />

      {/* Body */}
      <div className="px-5 py-4">
        {/* Context info row */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          {viewAs === "buyer" ? (
            <>
              <Store className="h-3.5 w-3.5" />
              <span>
                Từ{" "}
                <span className="font-medium text-foreground">
                  {order.storeName}
                </span>
              </span>
            </>
          ) : (
            <>
              <User className="h-3.5 w-3.5" />
              <span>
                khách hàng:{" "}
                <span className="font-medium text-foreground">
                  {order.customerName || "—"}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0">
                <img
                  src={item.productImageUrl ?? "/placeholder.svg"}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Số lượng: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground shrink-0">
                {formatToVND(item.priceAtPurchase)}
              </p>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{order.items.length - 3} sản phẩm khác
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/50 bg-secondary/20">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1.5 text-xs"
          asChild
        >
          <Link href={`/orders/${order.id}`}>
            <ExternalLink className="h-3.5 w-3.5" />
            Xem chi tiết
          </Link>
        </Button>

        {canPay && (
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1.5"
            onClick={handlePayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CreditCard className="h-3.5 w-3.5" />
            )}
            Thanh toán
          </Button>
        )}
      </div>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="px-5 py-4 bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Separator />
      <div className="px-5 py-4 flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface PaginationProps {
  pageIndex: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function OrderPagination({
  pageIndex,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={pageIndex <= 1}
        onClick={() => onPageChange(pageIndex - 1)}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </Button>
      <span className="text-sm text-muted-foreground px-2">
        Trang {pageIndex} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={pageIndex >= totalPages}
        onClick={() => onPageChange(pageIndex + 1)}
        className="gap-1"
      >
        Tiếp
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EmptyOrders({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <PackageSearch className="h-12 w-12 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface OrderListProps {
  userId: string;
  viewAs: "buyer" | "seller";
}

function OrderList({ userId, viewAs }: OrderListProps) {
  const [pageIndex, setPageIndex] = useState(1);

  // Buyer tab: pass customerId so the server returns only orders where user is customer.
  // Seller tab: no customerId filter — the backend security layer returns all accessible
  //             orders (both customer + store-owner). We then client-side filter to keep
  //             only orders where the current user is NOT the customer (i.e. store-side orders).
  const filter =
    viewAs === "buyer"
      ? { customerId: userId, pageIndex, pageSize: PAGE_SIZE }
      : { pageIndex, pageSize: PAGE_SIZE };

  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetOrdersQuery(filter, {
    skip: !userId,
  });

  const allItems = response?.data?.items ?? [];
  const orders =
    viewAs === "buyer"
      ? allItems
      : allItems.filter((o) => o.customerId !== userId);

  const totalCount = response?.data?.totalCount ?? 0;
  const totalPages = response?.data?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyOrders
        message={
          viewAs === "buyer"
            ? "Bạn chưa có đơn hàng nào."
            : "Cửa hàng chưa nhận được đơn hàng nào."
        }
      />
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        {viewAs === "buyer"
          ? `${totalCount} đơn hàng`
          : `${orders.length} đơn trên trang này`}
      </p>
      <div
        className={cn(
          "flex flex-col gap-4",
          isFetching && "opacity-60 pointer-events-none",
        )}
      >
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} viewAs={viewAs} />
        ))}
      </div>
      {viewAs === "buyer" && (
        <OrderPagination
          pageIndex={pageIndex}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPageIndex(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

export function OrderHistory() {
  const { data: profileResponse } = useGetProfileQuery();
  const userId = profileResponse?.data?.id ?? "";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold font-serif text-foreground">
          Lịch sử đơn hàng
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi và quản lý đơn hàng của bạn
        </p>
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="bg-muted/50 rounded-xl p-1 h-auto gap-1 mb-6">
          <TabsTrigger
            value="purchases"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Đơn mua
          </TabsTrigger>
          <TabsTrigger
            value="store-orders"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-2"
          >
            <Store className="h-4 w-4" />
            Đơn cửa hàng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-0">
          {userId ? (
            <OrderList userId={userId} viewAs="buyer" />
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="store-orders" className="mt-0">
          {userId ? (
            <OrderList userId={userId} viewAs="seller" />
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
