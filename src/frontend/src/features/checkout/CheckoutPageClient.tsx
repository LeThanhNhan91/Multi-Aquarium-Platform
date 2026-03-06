"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Fish,
  ChevronRight,
  MapPin,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Package,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useGetProductByIdQuery } from "@/services/productApi";
import {
  useCreateOrderMutation,
  useCreatePaymentUrlMutation,
} from "@/services/orderApi";
import { cn } from "@/utils/utils";
import { useAppSelector } from "@/libs/redux/hook";

export default function CheckoutPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const productId = searchParams.get("productId") ?? "";
  const storeId = searchParams.get("storeId") ?? "";
  const fishInstanceId = searchParams.get("fishInstanceId") ?? undefined;
  const quantity = parseInt(searchParams.get("quantity") ?? "1", 10);

  const { data: productResponse, isLoading: productLoading } =
    useGetProductByIdQuery(productId, { skip: !productId });
  const product = productResponse?.data;

  const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation();
  const [createPaymentUrl, { isLoading: paymentLoading }] =
    useCreatePaymentUrlMutation();

  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [addressError, setAddressError] = useState("");

  // Stable UUID for idempotency — generated once per page mount
  const idempotencyKey = useRef<string>(crypto.randomUUID()).current;

  const isLiveFish = product?.productType === "LiveFish";

  // Resolve the price for display
  const fishInstance = product?.fishInstances?.find(
    (f) => f.id === fishInstanceId,
  );
  const unitPrice = isLiveFish
    ? (fishInstance?.price ?? 0)
    : (product?.basePrice ?? 0);

  const totalPrice = unitPrice * quantity;

  const isProcessing = orderLoading || paymentLoading;

  const validateAddress = () => {
    if (!shippingAddress.trim()) {
      setAddressError("Vui lòng nhập địa chỉ giao hàng");
      return false;
    }
    if (shippingAddress.trim().length < 10) {
      setAddressError("Địa chỉ giao hàng phải có ít nhất 10 ký tự");
      return false;
    }
    setAddressError("");
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    if (!productId || !storeId) {
      toast.error("Thông tin sản phẩm không hợp lệ");
      return;
    }

    try {
      // Step 1: Create the order
      const orderResult = await createOrder({
        storeId,
        items: [
          {
            productId,
            fishInstanceId: fishInstanceId || undefined,
            quantity,
          },
        ],
        shippingAddress: shippingAddress.trim(),
        note: note.trim() || undefined,
        idempotencyKey,
      }).unwrap();

      const orderId = orderResult.data.id;
      toast.success("Tạo đơn hàng thành công!");

      // Step 2: Create payment URL
      const paymentResult = await createPaymentUrl({
        orderId,
        paymentMethod: "VNPay",
      }).unwrap();

      // Step 3: Redirect to payment gateway
      window.location.href = paymentResult.paymentUrl;
    } catch {
      // Errors are handled globally by baseQueryWithReauth via toast
    }
  };

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(
      `/checkout?${searchParams.toString()}`,
    );
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              Đăng nhập để tiếp tục
            </h2>
            <p className="text-sm text-muted-foreground">
              Bạn cần đăng nhập trước khi đặt hàng.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push(`/login?returnUrl=${returnUrl}`)}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/products">Quay lại cửa hàng</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!productId || !storeId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            Không tìm thấy thông tin sản phẩm
          </p>
          <Button asChild variant="outline">
            <Link href="/products">Quay lại cửa hàng</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3">
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
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Sản phẩm
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Đặt hàng
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">
          Xác nhận đơn hàng
        </h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — Shipping form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping Address */}
            <Card className="border-border/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Địa chỉ giao hàng
                </h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Địa chỉ cụ thể <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    if (addressError) setAddressError("");
                  }}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  rows={3}
                  className={cn(
                    "w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder-muted-foreground transition-colors outline-none resize-none",
                    "focus:ring-2 focus:ring-primary/30 focus:border-primary",
                    addressError
                      ? "border-destructive focus:ring-destructive/30"
                      : "border-border",
                  )}
                />
                {addressError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {addressError}
                  </p>
                )}
              </div>
            </Card>

            {/* Note */}
            <Card className="border-border/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Ghi chú đơn hàng
                </h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Ghi chú (không bắt buộc)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Yêu cầu đặc biệt, giao hàng giờ hành chính, đóng gói cẩn thận..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder-muted-foreground transition-colors outline-none resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </Card>

            {/* Payment method info */}
            <Card className="border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Phương thức thanh toán
                </h2>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="h-8 w-8 rounded-md bg-[#005BAA] flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-black leading-tight text-center">
                    VN
                    <br />
                    PAY
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">VNPay</p>
                  <p className="text-xs text-muted-foreground">
                    Thanh toán an toàn qua ví điện tử / ATM / Thẻ quốc tế
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <Card className="border-border/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">
                    Tóm tắt đơn hàng
                  </h2>
                </div>

                {productLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 rounded bg-muted w-3/4" />
                    <div className="h-4 rounded bg-muted w-1/2" />
                  </div>
                ) : product ? (
                  <div className="space-y-4">
                    {/* Product row */}
                    <div className="flex gap-3">
                      {product.images?.[0] ? (
                        <div className="relative h-16 w-16 shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="rounded-xl object-cover border border-border/50"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0">
                          <Fish className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground line-clamp-2">
                          {product.name}
                        </p>
                        {fishInstance && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {fishInstance.size} · {fishInstance.color} ·{" "}
                            {fishInstance.gender}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {product.storeName}
                        </p>
                        {!isLiveFish && (
                          <p className="text-xs text-muted-foreground">
                            Số lượng: {quantity}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-border/30" />

                    {/* Pricing */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Đơn giá</span>
                        <span className="font-medium">
                          {unitPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      {!isLiveFish && quantity > 1 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Số lượng
                          </span>
                          <span className="font-medium">{quantity}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-border/30" />

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">
                        Tổng cộng
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {totalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Không thể tải thông tin sản phẩm
                  </p>
                )}
              </Card>

              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || productLoading || !product}
                className="w-full py-6 text-base font-semibold rounded-xl bg-linear-to-r from-primary to-accent hover:shadow-lg transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {orderLoading ? "Đang tạo đơn..." : "Đang chuyển hướng..."}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Thanh toán với VNPay
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground px-4">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <span className="text-primary cursor-pointer hover:underline">
                  điều khoản dịch vụ
                </span>{" "}
                của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
