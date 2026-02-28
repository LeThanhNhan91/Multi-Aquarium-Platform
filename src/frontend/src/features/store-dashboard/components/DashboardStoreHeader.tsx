"use client";

import React from "react";
import { Settings, MapPin, Star, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreResponse } from "@/types/store.type";

interface DashboardStoreHeaderProps {
  store: StoreResponse;
}

export default function DashboardStoreHeader({
  store,
}: DashboardStoreHeaderProps) {
  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl bg-card border border-border/50 shadow-sm">
      <div className="relative h-48 overflow-hidden group">
        <img
          src={store.coverUrl || "/images/shop-showcase.jpg"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt="Store cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <Button
          size="sm"
          variant="outline"
          className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 gap-2"
        >
          <Settings className="h-4 w-4" />
          Chỉnh sửa ảnh bìa
        </Button>
      </div>

      <div className="px-8 py-6 flex flex-col md:flex-row md:items-end gap-6 -mt-10 relative z-10">
        <div className="relative shrink-0">
          <div className="h-24 w-24 rounded-2xl border-4 border-card bg-muted overflow-hidden shadow-xl shadow-black/10">
            <img
              src={store.logoUrl || "/images/hero-aquarium.jpg"}
              className="h-full w-full object-cover"
              alt="Store logo"
            />
          </div>
          <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-4 border-card hover:scale-105 transition-transform">
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 pb-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold  text-foreground">
              {store.name}
            </h2>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3">
              {store.status === "Active" ? "Active" : "Pending Approval"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {store.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
              {store.averageRating} ({store.totalReviews} Reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> 1.2k Followers
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20"
          >
            <Settings className="h-4 w-4" />
            Cài đặt cửa hàng
          </Button>
          {/* <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
            <Package className="h-4 w-4" />
            Xem Shop của tôi
          </Button> */}
        </div>
      </div>
    </div>
  );
}
