"use client";

import { Store, ArrowRight, Sparkles } from "lucide-react";

interface StoreOwnerCTAProps {
  onOpenShop?: () => void;
}

export function StoreOwnerCTA({ onOpenShop }: StoreOwnerCTAProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 flex flex-col items-center text-center gap-6">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />

      {/* Icon badge */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
        <Store className="h-10 w-10 text-primary" />
        <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-primary-foreground" />
        </div>
      </div>

      {/* Text */}
      <div className="relative space-y-2 max-w-md">
        <h3 className="text-xl font-bold  text-foreground">
          Bạn chưa có cửa hàng nào
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Mở cửa hàng trên AquaMarket để bán sản phẩm thủy sinh của bạn đến hàng
          nghìn người yêu cá trên khắp Việt Nam.
        </p>
      </div>

      {/* Highlights */}
      <div className="relative grid grid-cols-3 gap-4 w-full max-w-sm">
        {[
          { label: "Miễn phí", sub: "đăng ký" },
          { label: "Dễ dàng", sub: "quản lý" },
          { label: "Tiếp cận", sub: "khách hàng" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-0.5 rounded-xl bg-secondary/60 px-3 py-3"
          >
            <span className="text-sm font-bold text-primary">{item.label}</span>
            <span className="text-[10px] text-muted-foreground">
              {item.sub}
            </span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <button
        onClick={onOpenShop}
        className="relative inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Store className="h-4 w-4" />
        Mở cửa hàng ngay
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
