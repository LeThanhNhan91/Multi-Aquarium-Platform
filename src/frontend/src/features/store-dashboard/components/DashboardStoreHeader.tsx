"use client";

import React from "react";
import {
  Settings,
  MapPin,
  Star,
  Users,
  Package,
  Phone,
  Truck,
  Eye,
  Camera,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreResponse } from "@/types/store.type";
import { cn } from "@/utils/utils";
import { useRef, useState } from "react";
import {
  useUpdateStoreLogoMutation,
  useUpdateStoreCoverMutation,
} from "@/services/storeApi";
import { useToast } from "@/hooks/use-toast";
import StoreEditInfoDialog from "./StoreEditInfoDialog";

interface DashboardStoreHeaderProps {
  store: StoreResponse;
}

export default function DashboardStoreHeader({
  store,
}: DashboardStoreHeaderProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [updateLogo, { isLoading: isUpdatingLogo }] =
    useUpdateStoreLogoMutation();
  const [updateCover, { isLoading: isUpdatingCover }] =
    useUpdateStoreCoverMutation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "Paused":
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await updateLogo({ id: store.id, logo: file }).unwrap();
      toast({
        title: "Thành công",
        description: "Ảnh đại diện cửa hàng đã được cập nhật.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.",
      });
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await updateCover({ id: store.id, cover: file }).unwrap();
      toast({
        title: "Thành công",
        description: "Ảnh bìa cửa hàng đã được cập nhật.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật ảnh bìa. Vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl bg-card border border-border/50 shadow-sm">
      <input
        type="file"
        ref={logoInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleLogoChange}
      />
      <input
        type="file"
        ref={coverInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleCoverChange}
      />

      <div className="relative h-48 overflow-hidden group">
        <img
          src={store.coverUrl || "/images/shop-showcase.jpg"}
          className="w-full h-full object-cover"
          alt="Store cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <Button
          size="sm"
          variant="outline"
          className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 gap-2"
          onClick={() => coverInputRef.current?.click()}
          disabled={isUpdatingCover}
        >
          {isUpdatingCover ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          Chỉnh sửa ảnh bìa
        </Button>
      </div>

      <div className="px-8 py-6 flex flex-col md:flex-row md:items-start gap-6 -mt-10 relative z-10">
        <div className="relative shrink-0">
          <div className="h-24 w-24 rounded-2xl border-4 border-card bg-muted overflow-hidden shadow-xl shadow-black/10 flex items-center justify-center relative">
            {isUpdatingLogo && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
            <img
              src={store.logoUrl || "/images/hero-aquarium.jpg"}
              className="h-full w-full object-cover"
              alt="Store logo"
            />
          </div>
          <button
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-4 border-card hover:scale-105 transition-transform disabled:opacity-50"
            onClick={() => logoInputRef.current?.click()}
            disabled={isUpdatingLogo}
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 pb-1 md:pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold text-foreground">{store.name}</h2>
            <Badge className={cn("px-3", getStatusColor(store.status))}>
              {store.status === "Active" ? "Đang hoạt động" : store.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary/60" /> {store.address}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary/60" /> {store.phoneNumber}
            </span>
            {store.deliveryArea && (
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary/60" />{" "}
                {store.deliveryArea}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
              <span className="font-bold text-foreground">
                {store.averageRating}
              </span>
              <span className="opacity-60">
                ({store.totalReviews} đánh giá)
              </span>
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary/60" />
              <span className="font-bold text-foreground">1.2k</span>
              <span className="opacity-60">Người theo dõi</span>
            </span>
          </div>
        </div>

        <div className="flex gap-2 md:pt-10">
          <Button
            variant="outline"
            className="gap-2 font-bold h-11 px-6 rounded-xl border-primary/20 hover:bg-primary/5"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Chỉnh sửa thông tin
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/25"
            onClick={() => window.open(`/stores/${store.slug}`, "_blank")}
          >
            <Eye className="h-4 w-4" />
            Xem Shop
          </Button>
        </div>
      </div>

      <StoreEditInfoDialog
        store={store}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
