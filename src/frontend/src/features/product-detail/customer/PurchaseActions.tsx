"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Share2, Minus, Plus, Fish } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/utils";
import { FishInstance, ProductItem } from "@/types/product.type";
import { useAppDispatch, useAppSelector } from "@/libs/redux/hook";
import { addItem } from "@/libs/redux/features/cartSlice";
import { useAddToCartMutation } from "@/services/cartApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, TriangleAlert, Thermometer, Droplets, Zap } from "lucide-react";
import { CompatibilityWarning } from "@/types/cart.type";

interface PurchaseActionsProps {
  product: ProductItem;
  selectedFish: FishInstance | null;
  isSticky?: boolean;
}

export function PurchaseActions({
  product,
  selectedFish,
  isSticky = false,
}: PurchaseActionsProps) {
  const {
    id: productId,
    storeId,
    storeName,
    productType,
    isOwner = false,
  } = product;
  const availableStock = product.availableStock ?? 0;

  const isLiveFish = productType === "LiveFish";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { accessToken } = useAppSelector((state) => state.auth);
  const [addToCart, { isLoading: isSyncing }] = useAddToCartMutation();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [warnings, setWarnings] = useState<CompatibilityWarning[]>([]);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // For live fish: enabled only when a fish is selected and it's available
  const canBuy =
    (isLiveFish ? selectedFish?.status === "Available" : availableStock > 0) &&
    !isOwner;

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, Math.min(value, (availableStock ?? 0) || 1)));
  };

  const handleAddToCart = async () => {
    if (isOwner) return;
    setIsAdding(true);
    try {
      const cartId = isLiveFish && selectedFish 
        ? `${productId}-${selectedFish.id}` 
        : productId;
      
      const price = isLiveFish && selectedFish 
        ? selectedFish.price 
        : (product.basePrice ?? 0);

      const image = isLiveFish && selectedFish && selectedFish.images?.length 
        ? selectedFish.images[0] 
        : (product.images?.[0] ?? "");

      const name = (isLiveFish && selectedFish 
        ? `${product.name} (${selectedFish.size} - ${selectedFish.color})`
        : product.name) || "Sản phẩm";

      const newItem = {
        cartId,
        productId,
        fishInstanceId: selectedFish?.id,
        productType,
        name,
        price,
        quantity: isLiveFish ? 1 : quantity,
        image,
        storeId,
        storeName,
        availableStock: isLiveFish ? 1 : availableStock,
      };

      dispatch(addItem(newItem));

      if (accessToken) {
        try {
          const response = await addToCart({
            productId,
            fishInstanceId: selectedFish?.id,
            quantity: isLiveFish ? 1 : quantity,
          }).unwrap();

          if (response.data?.warnings && response.data.warnings.length > 0) {
            setWarnings(response.data.warnings);
            setShowWarningDialog(true);
          } else {
            toast.success("Đã thêm vào giỏ hàng");
          }
        } catch (error) {
          console.error("Failed to sync cart to backend:", error);
          // We keep local state as optimistic
          toast.success("Đã thêm vào giỏ hàng (chế độ offline)");
        }
      } else {
        toast.success("Đã thêm vào giỏ hàng");
      }
    } catch {
      toast.error("Không thể thêm vào giỏ hàng");
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
        {/* Ownership Warning */}
        {isOwner && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs font-semibold text-primary">
              ℹ️ Đây là sản phẩm của bạn. Bạn không thể tự mua sản phẩm của
              chính mình.
            </p>
          </div>
        )}

        {/* Quantity (only for non-live-fish) */}
        {!isLiveFish && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Số lượng</p>
            <div className="flex items-center gap-3 bg-secondary/30 rounded-lg w-fit p-2">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                disabled={quantity <= 1 || isOwner}
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
                max={availableStock ?? 0}
                disabled={isOwner}
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                disabled={quantity >= (availableStock ?? 0) || isOwner}
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
                {isOwner
                  ? "Sản phẩm của bạn"
                  : !selectedFish
                    ? "Chọn cá trước"
                    : selectedFish.status === "Available"
                      ? "Đặt mua ngay"
                      : "Cá không khả dụng"}
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isOwner
                  ? "Sản phẩm của bạn"
                  : availableStock > 0
                    ? "Thêm vào giỏ hàng"
                    : "Hết hàng"}
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
              disabled={isOwner}
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
        {!isLiveFish && (availableStock ?? 0) <= 10 && (availableStock ?? 0) > 0 && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-xs font-semibold text-orange-600">
              ⚠️ Chỉ còn {availableStock} sản phẩm, đặt hàng ngay!
            </p>
          </div>
        )}
      </Card>

      {/* Compatibility Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl overflow-hidden p-0">
          <div className="bg-orange-500/10 p-6 flex items-center gap-4 border-b border-orange-500/20">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/30">
              <TriangleAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-orange-700">Cảnh báo tương thích</DialogTitle>
              <DialogDescription className="text-orange-600/80 font-medium">
                Phát hiện xung khắc với các loài cá trong giỏ
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
            {warnings.map((warning, index) => (
              <div 
                key={index} 
                className="p-4 bg-muted/50 rounded-2xl border border-border/50 space-y-2 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  {warning.warningType === "WaterType" && <Droplets className="h-4 w-4 text-blue-500" />}
                  {warning.warningType === "Temperament" && <Zap className="h-4 w-4 text-yellow-500" />}
                  {warning.warningType === "Temperature" && <Thermometer className="h-4 w-4 text-red-500" />}
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {warning.warningType === "WaterType" ? "Môi trường" : 
                     warning.warningType === "Temperament" ? "Tính cách" : "Nhiệt độ"}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground/90">
                  {warning.message}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="text-[10px] px-2 py-0.5 bg-background rounded-full border border-border/50 text-muted-foreground">
                    Xung đột với: <span className="text-foreground font-semibold">{warning.conflictWithProductName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-muted/20 border-t border-border/50 flex flex-col gap-3">
            <p className="text-[11px] text-center text-muted-foreground px-4">
              Bạn vẫn có thể tiếp tục mua, nhưng hãy đảm bảo bạn có hồ riêng biệt cho các loài xung khắc này.
            </p>
            <Button 
              onClick={() => setShowWarningDialog(false)}
              className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              Tôi đã hiểu, vẫn tiếp tục
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
