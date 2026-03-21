"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Star,
  Trash2,
  Package,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import SavedPostsGrid from "@/features/feeds/SavedPostsGrid";

const wishlistItems = [
  {
    name: "Koi Showa Premium",
    shop: "Koi Garden Center",
    price: "5,500,000",
    originalPrice: "6,200,000",
    rating: 5.0,
    reviews: 31,
    image: "/images/product-koi.jpg",
    inStock: true,
  },
  {
    name: "ADA 60P Glass Tank",
    shop: "Nature Aquarium VN",
    price: "2,800,000",
    originalPrice: null,
    rating: 4.8,
    reviews: 86,
    image: "/images/product-tank.jpg",
    inStock: true,
  },
  {
    name: "LED Aquarium Light RGB",
    shop: "Tech Aqua Store",
    price: "1,650,000",
    originalPrice: null,
    rating: 4.5,
    reviews: 97,
    image: "/images/product-light.jpg",
    inStock: false,
  },
  {
    name: "CO2 Diffuser Pro Kit",
    shop: "AquaScape Studio",
    price: "890,000",
    originalPrice: null,
    rating: 4.6,
    reviews: 42,
    image: "/images/product-co2.jpg",
    inStock: true,
  },
];

export function Wishlist() {
  const [activeTab, setActiveTab] = useState<"products" | "posts">("products");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Yêu thích</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các sản phẩm và bài viết bạn đã lưu
          </p>
        </div>

        <div className="flex p-1 bg-muted/50 rounded-xl w-fit border border-border/50">
          <button
            onClick={() => setActiveTab("products")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "products"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Package className="h-4 w-4" />
            Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "posts"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Bài đăng
          </button>
        </div>
      </div>

      {activeTab === "products" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {wishlistItems.length} sản phẩm đã lưu
            </p>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9 rounded-xl"
            >
              <ShoppingCart className="h-4 w-4" />
              Thêm tất cả
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {wishlistItems.map((item) => (
              <div
                key={item.name}
                className="flex gap-4 rounded-2xl border border-border/50 bg-card p-4 hover:shadow-md transition-shadow group"
              >
                <div className="h-24 w-24 relative rounded-xl overflow-hidden bg-muted shrink-0">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-primary mb-0.5">
                        {item.shop}
                      </p>
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {item.name}
                      </h3>
                    </div>
                    <button
                      className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all shrink-0"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">
                      {item.rating}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      ({item.reviews} đánh giá)
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-primary">
                        {item.price}đ
                      </span>
                      {item.originalPrice && (
                        <span className="text-[11px] text-muted-foreground line-through decoration-muted-foreground/50">
                          {item.originalPrice}đ
                        </span>
                      )}
                    </div>
                    {item.inStock ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary hover:bg-primary/5 h-8 px-2 rounded-lg gap-1.5 text-xs font-bold"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Mua ngay
                      </Button>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold text-muted-foreground border-border bg-muted/30"
                      >
                        Hết hàng
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <SavedPostsGrid />
      )}
    </div>
  );
}
