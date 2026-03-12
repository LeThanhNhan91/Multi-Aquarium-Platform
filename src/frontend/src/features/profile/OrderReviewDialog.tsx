"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import {
  Star,
  MessageSquareQuote,
  ShoppingBasket,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderResponse, OrderItemResponse } from "@/types/order.type";
import { ReviewForm } from "@/features/reviews/ReviewForm";
import { formatToVND } from "@/helper/formatter";
import Link from "next/link";
import { orderApi } from "@/services/orderApi";

interface OrderReviewDialogProps {
  order: OrderResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderReviewDialog({
  order,
  open,
  onOpenChange,
}: OrderReviewDialogProps) {
  const dispatch = useDispatch();
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(
    null,
  );

  const handleReview = (productId: string) => {
    setReviewingProductId(productId);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-none shadow-2xl text-foreground">
          <DialogHeader className="p-6 pb-4 bg-linear-to-r from-amber-50 to-orange-50/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm">
                <Star className="h-4 w-4 fill-current" />
              </div>
              <DialogTitle className="text-xl font-bold text-amber-900">
                Đánh giá đơn hàng
              </DialogTitle>
            </div>
            <DialogDescription className="text-amber-700/70 font-medium">
              Đơn hàng #{order.id.slice(0, 8).toUpperCase()} ·{" "}
              {order.items.length} sản phẩm
            </DialogDescription>
          </DialogHeader>

          <Separator className="bg-amber-100/50" />

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="group relative flex gap-4 p-3 rounded-2xl border border-transparent hover:border-amber-100 hover:bg-amber-50/30 transition-all duration-300"
              >
                {/* Product Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-shadow">
                  <Image
                    src={item.productImageUrl ?? "/placeholder.svg"}
                    alt={item.productName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-foreground truncate group-hover:text-amber-700 transition-colors">
                    {item.productName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatToVND(item.priceAtPurchase)}
                    </p>
                    <span className="text-[10px] text-muted-foreground/40">
                      •
                    </span>
                    <p className="text-xs text-muted-foreground">
                      SL: {item.quantity}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center">
                  {item.isReviewed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 gap-1.5 text-xs font-bold transition-all shadow-sm"
                      onClick={() => handleReview(item.productId)}
                    >
                      <MessageSquareQuote className="h-3.5 w-3.5" />
                      Sửa
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white gap-1.5 text-xs font-bold transition-all shadow-md active:scale-95"
                      onClick={() => handleReview(item.productId)}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Đánh giá
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-amber-100/50" />

          <div className="p-4 bg-secondary/10 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground text-xs font-medium bg-secondary/40 rounded-full"
            >
              <Link href={`/orders/${order.id}`}>
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Chi tiết đơn hàng
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold rounded-full hover:bg-secondary/40"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {reviewingProductId && (
        <ReviewForm
          productId={reviewingProductId}
          orderId={order.id}
          open={!!reviewingProductId}
          onOpenChange={(open) => !open && setReviewingProductId(null)}
          onSuccess={() => {
            dispatch(
              orderApi.util.invalidateTags([{ type: "Order", id: "LIST" }]),
            );
          }}
        />
      )}
    </>
  );
}
