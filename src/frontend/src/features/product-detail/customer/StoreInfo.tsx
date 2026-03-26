"use client";

import { useState } from "react";
import { Store, Star, MapPin, MessageSquare, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/libs/redux/hook";
import { StoreBadges } from "@/components/shared/StoreBadges";

interface StoreInfoProps {
  storeName: string;
  storeId: string;
  storeRating?: number;
  storeReviews?: number;
  storeLocation?: string;
  onContactStore?: () => void;
}

export function StoreInfo({
  storeName,
  storeId,
  storeRating = 4.8,
  storeReviews = 2450,
  storeLocation = "Ho Chi Minh City",
  onContactStore,
}: StoreInfoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleContactClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    onContactStore?.();
  };

  const handleGoLogin = () => {
    const returnUrl = encodeURIComponent(pathname);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  return (
    <>
      <Card className="border-border/50 bg-card rounded-2xl p-6 space-y-5">
        {/* Store Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-14 w-14 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Store className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-foreground text-lg  truncate">
                {storeName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Nhà bán chính thức
              </p>
            </div>
          </div>
        </div>

        {/* Store Stats */}
        <div className="space-y-3 py-4 border-y border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">
                {storeRating}
              </span>
            </div>
            <button className="text-xs font-medium text-primary hover:underline">
              {storeReviews.toLocaleString()} đánh giá
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{storeLocation}</span>
          </div>
        </div>

        {/* Store Actions */}
        <div>
          <Link href={`/stores/${storeId}`}>
            <Button
              variant="outline"
              className="w-full rounded-lg border-primary/30 text-primary hover:bg-primary/5 mb-4"
            >
              Xem cửa hàng
            </Button>
          </Link>
          <Button
            className={cn(
              "w-full rounded-lg font-semibold gap-2",
              onContactStore
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
            onClick={handleContactClick}
            disabled={!onContactStore}
          >
            <MessageSquare className="h-4 w-4" />
            {onContactStore ? "Liên hệ shop" : "Cửa hàng của bạn"}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <p className="text-xs font-semibold text-foreground/70 uppercase">
            Chứng thực
          </p>
          <StoreBadges storeId={storeId} />
          <div className="flex gap-2">
            <div className="px-2.5 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs font-semibold text-green-600">
                ✓ Chính hãng
              </p>
            </div>
            <div className="px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-semibold text-blue-600">⚡ Nhanh</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Login required modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mx-auto mb-2">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center">
              Đăng nhập để nhắn tin
            </DialogTitle>
            <DialogDescription className="text-center">
              Bạn cần đăng nhập để có thể nhắn tin với chủ cửa hàng{" "}
              <span className="font-semibold text-foreground">{storeName}</span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-2">
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button onClick={handleGoLogin}>
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
