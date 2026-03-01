"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Share2, Minus, Plus, Fish } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/utils";
import { FishInstance } from "@/types/product.type";

interface PurchaseActionsProps {
  productId: string;
  storeId: string;
  isLiveFish: boolean;
  availableStock: number;
  selectedFish: FishInstance | null;
  isSticky?: boolean;
}

export function PurchaseActions({
  productId,
  storeId,
  isLiveFish,
  availableStock,
  selectedFish,
  isSticky = false,
}: PurchaseActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // For live fish: enabled only when a fish is selected and it's available
  const canBuy = isLiveFish
    ? selectedFish?.status === "Available"
    : availableStock > 0;

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, Math.min(value, availableStock || 1)));
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const params = new URLSearchParams({
        productId,
        storeId,
        quantity: quantity.toString(),
      });
      if (isLiveFish && selectedFish) {
        params.set("fishInstanceId", selectedFish.id);
      }
      router.push(`/checkout?${params.toString()}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sản phẩm AquaMarket",
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const containerClass = isSticky
    ? "fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4"
    : "";

  return (
    <div className={containerClass}>
      <Card
        className={cn(
          "border-border/50 bg-card rounded-2xl p-6 space-y-4",
          isSticky && "sm:rounded-2xl",
        )}
      >
        {/* Quantity (only for non-live-fish) */}
        {!isLiveFish && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Số lượng</p>
            <div className="flex items-center gap-3 bg-secondary/30 rounded-lg w-fit p-2">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4 text-foreground/70" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                className="w-12 bg-transparent text-center font-semibold text-foreground outline-none"
                min="1"
                max={availableStock}
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                disabled={quantity >= availableStock}
              >
                <Plus className="h-4 w-4 text-foreground/70" />
              </button>
            </div>
          </div>
        )}

        {/* Live fish hint */}
        {isLiveFish && !selectedFish && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Fish className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-primary font-medium">
              Chọn một cá bên dưới để tiến hành đặt mua
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAddToCart}
            disabled={!canBuy || isAdding}
            className={cn(
              "w-full py-3 font-semibold rounded-lg transition-all",
              canBuy
                ? "bg-linear-to-r from-primary to-accent hover:shadow-lg text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {isLiveFish ? (
              <>
                <Fish className="h-5 w-5 mr-2" />
                {!selectedFish
                  ? "Chọn cá trước"
                  : selectedFish.status === "Available"
                    ? "Đặt mua ngay"
                    : "Cá không khả dụng"}
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {availableStock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setIsWishlisted(!isWishlisted)}
              variant="outline"
              className={cn(
                "rounded-lg font-semibold transition-all",
                isWishlisted &&
                  "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20",
              )}
            >
              <Heart
                className={cn("h-5 w-5", isWishlisted && "fill-current")}
              />
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="rounded-lg font-semibold"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stock warning (non-live-fish) */}
        {!isLiveFish && availableStock <= 10 && availableStock > 0 && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-xs font-semibold text-orange-600">
              ⚠️ Chỉ còn {availableStock} sản phẩm, đặt hàng ngay!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
