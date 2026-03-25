"use client";

import { useAppDispatch, useAppSelector } from "@/libs/redux/hook";
import {
  removeItem,
  updateQuantity,
  clearCart,
  CartItem,
} from "@/libs/redux/features/cartSlice";
import {
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useValidateCheckoutMutation,
} from "@/services/cartApi";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Store,
  ChevronRight,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";

export default function CartPageClient() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items } = useAppSelector((state) => state.cart);
  const { accessToken } = useAppSelector((state) => state.auth);

  // Inventory validation state
  const [unavailableItems, setUnavailableItems] = useState<Set<string>>(new Set());
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [validateCheckout] = useValidateCheckoutMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCartBackend] = useClearCartMutation();

  // Validate inventory whenever items change
  useEffect(() => {
    const validateInventory = async () => {
      if (!items.length || !accessToken) {
        setUnavailableItems(new Set());
        setValidationMessage("");
        return;
      }

      // Group by store and validate each store's items
      const groupedByStore = items.reduce(
        (acc, item) => {
          if (!acc[item.storeId]) {
            acc[item.storeId] = [];
          }
          acc[item.storeId].push({
            productId: item.productId,
            fishInstanceId: item.fishInstanceId,
            quantity: item.quantity,
          });
          return acc;
        },
        {} as Record<string, any[]>
      );

      const unavailable = new Set<string>();

      for (const [storeId, storeItems] of Object.entries(groupedByStore)) {
        try {
          const result = await validateCheckout({
            storeId,
            items: storeItems,
          }).unwrap();

          if (!result.isValid && result.items) {
            result.items.forEach((item) => {
              if (!item.isAvailable) {
                const key = `${item.productId}_${item.fishInstanceId || ""}`;
                unavailable.add(key);
              }
            });
          }
        } catch (error) {
          console.error(`Failed to validate store ${storeId}:`, error);
        }
      }

      setUnavailableItems(unavailable);
      if (unavailable.size > 0) {
        setValidationMessage(
          "Một số sản phẩm đã hết hàng hoặc không đủ số lượng yêu cầu."
        );
      } else {
        setValidationMessage("");
      }
    };

    validateInventory();
  }, [items, accessToken, validateCheckout]);

  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (validationMessage) {
      setShowWarning(true);
    }
  }, [validationMessage]);

  // Group items by store
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.storeId]) {
        acc[item.storeId] = {
          storeName: item.storeName,
          items: [],
        };
      }
      acc[item.storeId].items.push(item);
      return acc;
    },
    {} as Record<string, { storeName: string; items: any[] }>,
  );

  const totalAmount = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ cartId: item.cartId, quantity: newQuantity }));

    if (accessToken && item.id) {
      try {
        await updateCartItem({ id: item.id, quantity: newQuantity }).unwrap();
      } catch (error) {
        console.error("Failed to sync quantity update:", error);
      }
    }
  };

  const handleRemove = async (item: CartItem) => {
    dispatch(removeItem(item.cartId));

    if (accessToken && item.id) {
      try {
        await removeFromCart(item.id).unwrap();
      } catch (error) {
        console.error("Failed to sync removal:", error);
      }
    }
  };

  const handleClearCart = async () => {
    dispatch(clearCart());

    if (accessToken) {
      try {
        await clearCartBackend().unwrap();
      } catch (error) {
        console.error("Failed to clear backend cart:", error);
      }
    }
  };

  const handleCheckoutStore = (storeId: string) => {
    const storeItems = groupedItems[storeId]?.items || [];
    const hasUnavailable = storeItems.some((item) => {
      const key = `${item.productId}_${item.fishInstanceId || ""}`;
      return unavailableItems.has(key);
    });

    if (hasUnavailable) {
      setValidationMessage(
        "Vui lòng xóa các sản phẩm hết hàng trước khi thanh toán."
      );
      return;
    }

    router.push(`/checkout?storeId=${storeId}&source=cart`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-secondary/30 rounded-full p-8 mb-6">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Giỏ hàng của bạn đang trống</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá hàng
          ngàn cá cảnh và phụ kiện tuyệt vời ngay nhé!
        </p>
        <Button
          asChild
          className="rounded-xl px-8 h-12 text-base font-semibold"
        >
          <Link href="/products">Tiếp tục mua hàng</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <WarningModal
        open={showWarning && !!validationMessage}
        message={validationMessage}
        onClose={() => setShowWarning(false)}
      />
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <ShoppingBag className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-black text-foreground">Giỏ Hàng</h1>
        <Badge
          variant="secondary"
          className="ml-2 rounded-lg text-sm px-2 py-0.5"
        >
          {items.length} sản phẩm
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {Object.entries(groupedItems).map(([storeId, group]) => (
            <Card
              key={storeId}
              className="border-border/50 overflow-hidden rounded-2xl shadow-sm"
            >
              <div className="bg-secondary/10 p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="font-bold text-sm">{group.storeName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 font-bold"
                  onClick={() => handleCheckoutStore(storeId)}
                >
                  Thanh toán cửa hàng này
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="divide-y divide-border/30">
                {group.items.map((item) => {
                  const itemKey = `${item.productId}_${item.fishInstanceId || ""}`;
                  const isUnavailable = unavailableItems.has(itemKey);

                  return (
                    <div
                      key={item.cartId}
                      className={`p-6 flex gap-6 group relative transition-all ${
                        isUnavailable
                          ? "opacity-60 bg-secondary/20"
                          : "hover:bg-secondary/5"
                      }`}
                    >
                      {/* Out of stock overlay */}
                      {isUnavailable && (
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex flex-col items-center justify-center gap-2 z-10">
                          <AlertCircle className="h-6 w-6 text-white" />
                          <span className="text-white font-bold text-sm text-center px-4">
                            Sản phẩm hết hàng
                          </span>
                        </div>
                      )}

                      <div className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border border-border/50 bg-secondary/10">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className={`object-cover ${isUnavailable ? "grayscale" : "group-hover:scale-105"} transition-transform duration-300`}
                        />
                      </div>

                      {/* FIX: restored proper nesting for flex-1 div */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-lg text-foreground line-clamp-1">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => handleRemove(item)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {isUnavailable && (
                              <Badge className="bg-destructive/10 text-destructive border-0 text-[10px]">
                                Hết hàng
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-medium border-border/50 capitalize ${
                                isUnavailable
                                  ? "text-muted-foreground/50"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {item.productType === "LiveFish"
                                ? "Cá cảnh"
                                : "Thiết bị"}
                            </Badge>
                            {item.productType === "LiveFish" && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                                Độc bản
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Đơn giá
                            </p>
                            <p className="font-black text-xl text-primary">
                              {item.price.toLocaleString("vi-VN")}đ
                            </p>
                          </div>

                          {item.productType === "LiveFish" ? (
                            <div className="text-xs font-medium text-muted-foreground bg-secondary/20 px-3 py-1.5 rounded-lg border border-border/50">
                              Số lượng cố định: 1
                            </div>
                          ) : (
                            <div className="flex items-center border border-border/50 rounded-xl bg-background shadow-xs overflow-hidden h-10">
                              <button
                                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                className="px-3 hover:bg-secondary/20 transition-colors disabled:opacity-20"
                                disabled={item.quantity <= 1 || isUnavailable}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center font-bold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                className="px-3 hover:bg-secondary/20 transition-colors disabled:opacity-20"
                                disabled={
                                  (item.availableStock !== undefined &&
                                  item.quantity >= item.availableStock) || isUnavailable
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-border/50 rounded-2xl p-6 shadow-sm space-y-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <h2 className="text-xl font-black text-foreground">
                Tổng kết giỏ hàng
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    Tổng số lượng
                  </span>
                  <span className="font-bold">
                    {items.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    Tổng tiền hàng
                  </span>
                  <span className="font-bold">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <Separator className="bg-border/30" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-base font-bold text-foreground">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-primary/80 leading-relaxed font-medium">
                  Do hệ thống quản lý theo từng cửa hàng, vui lòng thanh toán
                  riêng từng mục để đảm bảo quyền lợi và quá trình vận chuyển.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 text-base font-bold rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                onClick={handleClearCart}
              >
                Xóa toàn bộ giỏ hàng
              </Button>
            </Card>

            <div className="px-2">
              <p className="text-[10px] text-center text-muted-foreground leading-relaxed italic">
                Giá trên chưa bao gồm phí vận chuyển. Phí vận chuyển sẽ được
                tính toán chính xác nhất khi bạn nhập địa chỉ tại bước thanh
                toán.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}