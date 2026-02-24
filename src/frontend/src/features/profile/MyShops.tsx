"use client";

import {
  Plus,
  Star,
  MapPin,
  Package,
  TrendingUp,
  MoreHorizontal,
  ExternalLink,
  Eye,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useGetProfileQuery } from "@/services/userApi";
import { RegisterShopForm } from "@/features/profile/RegisterShopForm";

const shops = [
  {
    name: "Ocean Dream Aquatics",
    slug: "ocean-dream-aquatics",
    image: "/images/shop-showcase.jpg",
    logo: "/images/hero-aquarium.jpg",
    status: "Active",
    rating: 4.9,
    reviewCount: 128,
    totalProducts: 87,
    totalOrders: 1243,
    revenue: "156,800,000",
    location: "District 1, HCMC",
    joinedDate: "Jan 2024",
    monthlyViews: "12.4K",
    pendingOrders: 5,
    completionRate: 96,
    categories: ["Tropical Fish", "Planted Tanks", "Accessories"],
  },
  {
    name: "Saigon Reef House",
    slug: "saigon-reef-house",
    image: "/images/product-tank.jpg",
    logo: "/images/product-discus.jpg",
    status: "Active",
    rating: 4.7,
    reviewCount: 64,
    totalProducts: 42,
    totalOrders: 587,
    revenue: "82,500,000",
    location: "District 7, HCMC",
    joinedDate: "Mar 2024",
    monthlyViews: "6.8K",
    pendingOrders: 2,
    completionRate: 91,
    categories: ["Marine Fish", "Corals", "Equipment"],
  },
  {
    name: "Mekong Aqua Supply",
    slug: "mekong-aqua-supply",
    image: "/images/product-light.jpg",
    logo: "/images/product-co2.jpg",
    status: "Paused",
    rating: 4.5,
    reviewCount: 23,
    totalProducts: 18,
    totalOrders: 156,
    revenue: "24,300,000",
    location: "Can Tho City",
    joinedDate: "Aug 2024",
    monthlyViews: "1.2K",
    pendingOrders: 0,
    completionRate: 88,
    categories: ["Lighting", "CO2 Systems", "Filters"],
  },
];

function ShopCard({ shop }: { shop: (typeof shops)[0] }) {
  const statusStyles =
    shop.status === "Active"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : "bg-amber-500/10 text-amber-600 border-amber-500/20";

  const completionColor =
    shop.completionRate >= 95
      ? "[&>div]:bg-emerald-500"
      : shop.completionRate >= 85
        ? "[&>div]:bg-amber-500"
        : "[&>div]:bg-destructive";

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="relative aspect-[2.5/1] overflow-hidden">
        <img
          src={shop.image || "/placeholder.svg"}
          alt={shop.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <Badge
          className={`absolute top-3 right-3 border ${statusStyles} text-xs`}
        >
          {shop.status}
        </Badge>
        <button
          className="absolute top-3 left-3 h-8 w-8 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-background/80 hover:bg-card/40 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Shop info */}
      <div className="relative px-5 pb-5">
        <div className="-mt-8 mb-3 flex items-end gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-4 border-card shadow-md">
            <img
              src={shop.logo || "/placeholder.svg"}
              alt={`${shop.name} logo`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 pb-1">
            <h3 className="text-base font-bold font-serif text-foreground truncate">
              {shop.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{shop.location}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">
              {shop.rating}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({shop.reviewCount} reviews)
          </span>
          <div className="ml-auto flex flex-wrap gap-1">
            {shop.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="inline-block rounded-md bg-secondary/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {cat}
              </span>
            ))}
            {shop.categories.length > 2 && (
              <span className="inline-block rounded-md bg-secondary/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{shop.categories.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Order completion */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Order Completion
          </span>
          <span className="text-sm font-bold text-foreground">
            {shop.completionRate}%
          </span>
        </div>
        <Progress
          value={shop.completionRate}
          className={`h-2 mb-4 ${completionColor}`}
        />

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/50 p-2.5">
            <Package className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {shop.totalProducts}
            </span>
            <span className="text-[10px] text-muted-foreground">Products</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/50 p-2.5">
            <ShoppingCart className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {shop.totalOrders}
            </span>
            <span className="text-[10px] text-muted-foreground">Orders</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/50 p-2.5">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {shop.monthlyViews}
            </span>
            <span className="text-[10px] text-muted-foreground">Views</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/50 p-2.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {shop.pendingOrders}
            </span>
            <span className="text-[10px] text-muted-foreground">Pending</span>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Revenue & actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Revenue (VND)
            </p>
            <p className="text-base font-bold font-serif text-foreground flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              {shop.revenue}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="bg-transparent border-border text-foreground hover:bg-primary hover:text-primary-foreground gap-1.5 text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Manage
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function MyShops() {
  const { data: profileResponse } = useGetProfileQuery();
  const isStoreOwner = profileResponse?.data?.role === "StoreOwner";

  if (!isStoreOwner) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-bold font-serif text-foreground">
            My Shops
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Mở cửa hàng để bắt đầu bán sản phẩm của bạn
          </p>
        </div>
        <RegisterShopForm />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold font-serif text-foreground">
            My Shops
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your aquarium shops and track performance
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Shop
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Revenue",
            value: "263.6M VND",
            icon: TrendingUp,
            trend: "+12.5%",
          },
          { label: "Total Products", value: "147", icon: Package, trend: "+8" },
          {
            label: "Total Orders",
            value: "1,986",
            icon: ShoppingCart,
            trend: "+34",
          },
          { label: "Avg Rating", value: "4.7", icon: Star, trend: "+0.1" },
        ].map((item) => (
          <Card key={item.label} className="border-border/50 bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  {item.trend}
                </span>
              </div>
              <p className="text-lg font-bold font-serif text-foreground">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shop cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <ShopCard key={shop.slug} shop={shop} />
        ))}
      </div>
    </div>
  );
}
