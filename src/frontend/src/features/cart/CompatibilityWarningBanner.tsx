"use client";

import React from "react";
import { TriangleAlert, Droplets, Zap, Thermometer, Info } from "lucide-react";
import { CompatibilityWarning } from "@/types/cart.type";
import { cn } from "@/utils/utils";

interface CompatibilityWarningBannerProps {
  warnings: CompatibilityWarning[];
  className?: string;
}

export function CompatibilityWarningBanner({
  warnings,
  className,
}: CompatibilityWarningBannerProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <TriangleAlert className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-bold text-orange-700">
          Cảnh báo tương thích ({warnings.length})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {warnings.map((warning, index) => (
          <div
            key={index}
            className="group relative p-4 bg-background border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-500/30 transition-all overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50" />

            <div className="flex gap-4">
              <div className="mt-1">
                {warning.warningType === "WaterType" && (
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Droplets className="h-5 w-5 text-blue-500" />
                  </div>
                )}
                {warning.warningType === "Temperament" && (
                  <div className="p-2 bg-yellow-500/10 rounded-xl">
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                )}
                {warning.warningType === "Temperature" && (
                  <div className="p-2 bg-red-500/10 rounded-xl">
                    <Thermometer className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    {warning.warningType === "WaterType"
                      ? "Môi trường nước"
                      : warning.warningType === "Temperament"
                        ? "Tính cách"
                        : "Nhiệt độ"}
                  </span>
                </div>

                <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                  {warning.message}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <div className="flex -space-x-2">
                    <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <Info className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Xung đột giữa{" "}
                    <span className="text-foreground font-bold">
                      {warning.productName}
                    </span>{" "}
                    &{" "}
                    <span className="text-foreground font-bold">
                      {warning.conflictWithProductName}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground px-1 italic">
        * Lưu ý: Cảnh báo này dựa trên thuộc tính do cửa hàng cung cấp. Vui lòng
        kiểm tra kỹ trước khi thả chung các loài cá này.
      </p>
    </div>
  );
}
