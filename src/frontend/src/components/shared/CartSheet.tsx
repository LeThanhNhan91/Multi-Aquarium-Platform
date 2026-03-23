"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/libs/redux/hook";
import {
  removeItem,
  updateQuantity,
  toggleCart,
  setCartOpen,
} from "@/libs/redux/features/cartSlice";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartSheet() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, isOpen } = useAppSelector((state) => state.cart);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    router.push("/cart");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => dispatch(setCartOpen(open))}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-border/50 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Giỏ hàng ({items.length})
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-secondary/30 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  Giỏ hàng trống
                </p>
                <p className="text-sm text-muted-foreground px-10">
                  Hãy thêm vài sản phẩm tuyệt vời vào giỏ hàng của bạn nhé!
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => dispatch(setCartOpen(false))}
                className="mt-4 rounded-xl"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="group relative flex gap-4 animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-secondary/20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => dispatch(removeItem(item.cartId))}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cửa hàng: {item.storeName}
                      </p>
                      {item.productType === "LiveFish" && (
                        <p className="text-[10px] text-primary font-medium py-0.5 px-2 bg-primary/10 rounded-full w-fit">
                          Cá cảnh
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold text-primary">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </p>

                      {item.productType !== "LiveFish" ? (
                        <div className="flex items-center border border-border/50 rounded-lg bg-secondary/10 overflow-hidden h-8">
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  cartId: item.cartId,
                                  quantity: item.quantity - 1,
                                }),
                              )
                            }
                            className="px-2 hover:bg-secondary/30 transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  cartId: item.cartId,
                                  quantity: item.quantity + 1,
                                }),
                              )
                            }
                            className="px-2 hover:bg-secondary/30 transition-colors disabled:opacity-30"
                            disabled={
                              item.availableStock !== undefined &&
                              item.quantity >= item.availableStock
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium italic">
                          SL: 1
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-6 space-y-4 bg-secondary/5 border-t border-border/50">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  Tạm tính
                </span>
                <span className="text-foreground font-semibold">
                  {subtotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  Phí vận chuyển
                </span>
                <span className="text-xs italic text-muted-foreground">
                  Tính khi thanh toán
                </span>
              </div>
              <Separator className="my-2 bg-border/50" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">
                  Tổng cộng
                </span>
                <span className="text-xl font-black text-primary">
                  {subtotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-bold rounded-xl bg-linear-to-r from-primary to-accent hover:shadow-lg transition-all"
              onClick={handleCheckout}
            >
              Thanh toán ngay
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-[10px] text-center text-muted-foreground italic">
              *Đơn hàng sẽ được chia theo từng cửa hàng để thuận tiện xử lý
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
