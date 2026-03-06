"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Star,
  MapPin,
  Phone,
  Package,
  TrendingUp,
  MoreHorizontal,
  ExternalLink,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useGetProfileQuery } from "@/services/userApi";
import { RegisterShopForm } from "@/features/profile/RegisterShopForm";
import { useGetStoresQuery } from "@/services/storeApi";
import { StoreResponse } from "@/types/store.type";
import { FishLoading } from "@/app/Loading";
import { StoreOwnerCTA } from "./StoreOwnerCTA";

function ShopCard({ shop }: { shop: StoreResponse }) {
  const statusStyles =
    shop.status === "Active"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : shop.status === "Pending"
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-red-500/10 text-red-600 border-red-500/20";

  const completionRate = 100;

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 py-0">
      <div className="relative aspect-3/1 overflow-hidden">
        <Image
          src={shop.coverUrl || "/images/shop-showcase.jpg"}
          alt={shop.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <Badge
          className={`absolute top-3 right-3 border ${statusStyles} text-[10px] tracking-wide`}
        >
          {shop.status}
        </Badge>
      </div>

      {/* Shop info */}
      <div className="relative px-5 pb-5">
        <div className="-mt-8 mb-3 flex items-end gap-3">
          <div className="h-16 w-16 relative shrink-0 overflow-hidden rounded-xl border-4 border-card shadow-md bg-muted">
            <Image
              src={shop.logoUrl || "/images/hero-aquarium.jpg"}
              alt={`${shop.name} logo`}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 pb-1 flex-1">
            <h3 className="text-base font-bold  text-foreground truncate">
              {shop.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 h-4 border-border/50 font-bold uppercase"
              >
                {shop.role}
              </Badge>
              <span className="truncate text-[10px] opacity-70">
                /{shop.slug}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{shop.address}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span>{shop.phoneNumber}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4 bg-secondary/60 rounded-lg px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-foreground">
                {shop.averageRating || 0}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              ({shop.totalReviews || 0} nhận xét)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[15px] font-bold text-foreground">
                {shop.productCount}
              </span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">
                Sản phẩm
              </span>
            </div>
            <div className="w-px h-4 bg-border/50" />
            <div className="flex flex-col items-end">
              <span className="text-[15px] font-bold text-foreground">
                {shop.orderCount}
              </span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">
                Đơn hàng
              </span>
            </div>
          </div>
        </div>

        <Separator className="mb-4 opacity-50" />

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
              Trạng thái
            </span>
            <span
              className={cn(
                "text-xs font-bold",
                shop.status === "Active"
                  ? "text-emerald-600"
                  : shop.status === "Pending"
                    ? "text-amber-600"
                    : "text-red-600",
              )}
            >
              {shop.status === "Active"
                ? "Đang hoạt động"
                : shop.status === "Pending"
                  ? "Chờ duyệt"
                  : "Bị từ chối"}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 bg-transparent border-border text-foreground hover:bg-primary hover:text-primary-foreground gap-1.5 text-xs font-bold"
            asChild
          >
            <Link href={`/dashboard/stores/${shop.id}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              Quản lý
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function MyShops() {
  const [showRegister, setShowRegister] = useState(false);
  const { data: profileResponse } = useGetProfileQuery();
  const userId = profileResponse?.data?.id;

  const { data: storesResponse, isLoading } = useGetStoresQuery(
    { userId: userId },
    { skip: !userId },
  );

  const hasShops = storesResponse && storesResponse.items.length > 0;

  if (isLoading) return <FishLoading isLoading={true} />;

  if (showRegister) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setShowRegister(false)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
        <RegisterShopForm />
      </div>
    );
  }

  if (!hasShops) {
    return (
      <div className="py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold  text-foreground">
            Cửa hàng của tôi
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Bạn chưa tham gia vào cửa hàng nào trên AquaMarket.
          </p>
        </div>
        <StoreOwnerCTA onOpenShop={() => setShowRegister(true)} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold  text-foreground">
            Cửa hàng của tôi
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý và theo dõi hiệu suất các cửa hàng của bạn
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowRegister(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg shadow-primary/10"
        >
          <Plus className="h-4 w-4" />
          Tạo cửa hàng mới
        </Button>
      </div>

      {/* Summary cards - Mocking for now as we need another API for aggregated stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: "Tổng doanh thu",
            value: "0 VND",
            icon: TrendingUp,
            trend: "+0%",
          },
          { label: "Tổng sản phẩm", value: "0", icon: Package, trend: "+0" },
          {
            label: "Tổng đơn hàng",
            value: "0",
            icon: ShoppingCart,
            trend: "+0",
          },
          { label: "Đánh giá trung bình", value: "0", icon: Star, trend: "+0" },
        ].map((item) => (
          <Card
            key={item.label}
            className="border-border/50 bg-card overflow-hidden"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  {item.trend}
                </span>
              </div>
              <p className="text-xl font-bold  text-foreground">{item.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1">
                {item.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shop cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {storesResponse.items.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}
