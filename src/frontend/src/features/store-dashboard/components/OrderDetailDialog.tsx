"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from "@/services/orderApi";
import { formatCurrency, cn } from "@/utils/utils";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  OrderStatus,
} from "@/types/order.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Package,
  User,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  CheckCircle2,
  Phone,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface OrderDetailDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
}: OrderDetailDialogProps) {
  const {
    data: response,
    isLoading,
    isError,
  } = useGetOrderByIdQuery(orderId as string, {
    skip: !orderId || !open,
  });
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [note, setNote] = useState("");

  const order = response?.data;

  const getAvailableTransitions = (currentStatus: string): OrderStatus[] => {
    const statusOrder: OrderStatus[] = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipping",
      "Completed",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus as OrderStatus);

    if (currentStatus === "Cancelled" || currentStatus === "Completed")
      return [];

    const forwardTransitions = statusOrder.slice(currentIndex + 1);

    // Add "Cancelled" if not yet Shipping or Completed
    if (currentIndex < statusOrder.indexOf("Shipping")) {
      return [...forwardTransitions, "Cancelled"];
    }

    return forwardTransitions;
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!orderId) return;
    try {
      await updateStatus({
        id: orderId,
        status: newStatus,
        note:
          note || `Cập nhật sang trạng thái ${ORDER_STATUS_LABELS[newStatus]}`,
      }).unwrap();
      toast.success("Cập nhật trạng thái thành công");
      setNote("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const statusOptions: OrderStatus[] = [
    "Confirmed",
    "Processing",
    "Shipping",
    "Completed",
    "Cancelled",
  ];

  if (!orderId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden p-0 rounded-2xl border-none shadow-2xl flex flex-col gap-0">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex h-64 items-center justify-center text-destructive p-10 text-center">
            Có lỗi xảy ra khi tải thông tin đơn hàng. Vui lòng thử lại sau.
          </div>
        ) : order ? (
          <>
            <div className="relative bg-linear-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-5 border-b border-border/40 shrink-0">
              <DialogHeader>
                <div className="mt-5 flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                      Đơn hàng{" "}
                      <span className="text-primary font-mono">
                        #{orderId.split("-")[0].toUpperCase()}
                      </span>
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(
                        new Date(order.createdAt),
                        "dd MMMM, yyyy – HH:mm",
                        {
                          locale: vi,
                        },
                      )}
                    </DialogDescription>
                  </div>
                  <Badge
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border shadow-sm shrink-0 mt-0.5",
                      ORDER_STATUS_COLORS[order.status as OrderStatus],
                    )}
                  >
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </Badge>
                </div>
              </DialogHeader>
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Customer + Payment side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Customer */}
                <div className="bg-muted/30 rounded-xl border border-border/50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Khách hàng
                  </p>
                  <div className="space-y-1.5">
                    <p className="font-semibold text-sm text-foreground leading-tight">
                      {order.customerName}
                    </p>
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/60" />
                      <span className="leading-relaxed">
                        {order.shippingAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-muted/30 rounded-xl border border-border/50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Thanh toán
                  </p>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-primary leading-none">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs h-fit",
                        order.status === "Pending"
                          ? "border-amber-400 text-amber-600 bg-amber-50"
                          : "border-emerald-400 text-emerald-600 bg-emerald-50",
                      )}
                    >
                      {order.status === "Pending"
                        ? "Chờ thanh toán"
                        : "Đã thanh toán"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" /> Sản phẩm đã đặt
                </p>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-semibold text-muted-foreground">
                    <span>Sản phẩm</span>
                    <span className="text-center w-14">SL</span>
                    <span className="text-right w-24">Đơn giá</span>
                    <span className="text-right w-24">Thành tiền</span>
                  </div>
                  {/* Rows */}
                  <div className="divide-y divide-border/40">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3 hover:bg-muted/20 transition-colors"
                      >
                        {/* Product name + image */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-border/50 bg-white shrink-0">
                            <Image
                              src={item.productImageUrl || "/placeholder.png"}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                            {item.productName}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-center w-14">
                          {item.quantity}
                        </span>
                        <span className="text-sm text-muted-foreground text-right w-24">
                          {formatCurrency(item.priceAtPurchase)}
                        </span>
                        <span className="text-sm font-bold text-foreground text-right w-24">
                          {formatCurrency(item.totalLineAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Total row */}
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-t border-border/50">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Tổng đơn hàng
                    </span>
                    <span className="text-base font-bold text-primary">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {order.note && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Ghi chú
                  </p>
                  <div className="bg-amber-50/60 border border-amber-200/60 px-4 py-3 rounded-xl text-sm text-amber-800 italic leading-relaxed">
                    {order.note}
                  </div>
                </div>
              )}

              {/* Update Status */}
              {order.status !== "Completed" && order.status !== "Cancelled" && (
                <div className="space-y-3 bg-muted/20 rounded-xl border border-dashed border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Cập nhật trạng thái
                  </p>
                  <Textarea
                    placeholder="Ghi chú cập nhật (tùy chọn)..."
                    className="rounded-xl border-border/50 min-h-[72px] text-sm focus:ring-primary/20 resize-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {getAvailableTransitions(order.status).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          status === "Cancelled" ? "destructive" : "outline"
                        }
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(status)}
                        className={cn(
                          "rounded-lg text-xs font-semibold gap-1.5 h-8 px-3",
                          status !== "Cancelled" &&
                            "hover:bg-primary/10 hover:text-primary hover:border-primary/50",
                        )}
                      >
                        {status !== "Cancelled" && (
                          <ArrowRight className="h-3 w-3" />
                        )}
                        {ORDER_STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-muted/20 flex justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                variant="ghost"
                size="sm"
                className="rounded-lg px-6 text-sm font-semibold hover:bg-muted"
              >
                Đóng
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
