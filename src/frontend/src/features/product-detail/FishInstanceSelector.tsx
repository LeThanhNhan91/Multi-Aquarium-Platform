"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import { FishInstance } from "@/types/product.type";
import { Ruler, Tag, Palette, Sparkles, Video } from "lucide-react";

interface FishInstanceSelectorProps {
  fishInstances: FishInstance[];
  selectedId: string | null;
  onSelect: (fish: FishInstance) => void;
}

const statusMap: Record<FishInstance["status"], { label: string; color: string }> = {
  Available: { label: "Còn hàng", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  Sold: { label: "Đã bán", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  Reserved: { label: "Đang giữ", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
};

const genderMap: Record<string, string> = {
  đực: "♂ Đực",
  cái: "♀ Cái",
  male: "♂ Đực",
  female: "♀ Cái",
};

export function FishInstanceSelector({
  fishInstances,
  selectedId,
  onSelect,
}: FishInstanceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold  text-foreground">
          Chọn cá
        </h3>
        <span className="text-sm text-muted-foreground">
          {fishInstances.filter((f) => f.status === "Available").length} con khả dụng
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fishInstances.map((fish) => {
          const isSelected = selectedId === fish.id;
          const isAvailable = fish.status === "Available";
          const status = statusMap[fish.status] ?? {
            label: fish.status,
            color: "bg-muted text-muted-foreground",
          };
          const genderLabel = genderMap[fish.gender.toLowerCase()] ?? fish.gender;

          return (
            <button
              key={fish.id}
              onClick={() => isAvailable && onSelect(fish)}
              disabled={!isAvailable}
              className={cn(
                "relative flex flex-col rounded-2xl border-2 overflow-hidden text-left transition-all duration-200",
                isAvailable
                  ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                  : "cursor-not-allowed opacity-60",
                isSelected
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/50 hover:border-primary/40",
              )}
            >
              {/* Image Strip */}
              {fish.images.length > 0 && (
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <Image
                    src={fish.images[0]}
                    alt={`Cá ${fish.color}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {/* Thumbnail strip */}
                  {fish.images.length > 1 && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {fish.images.slice(1, 4).map((img, i) => (
                        <div
                          key={i}
                          className="relative h-8 w-8 rounded-md overflow-hidden border border-white/50"
                        >
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                      ))}
                      {fish.images.length > 4 && (
                        <div className="h-8 w-8 rounded-md bg-black/50 flex items-center justify-center border border-white/50">
                          <span className="text-xs text-white font-bold">
                            +{fish.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {fish.videoUrl && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                      <Video className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className={cn("text-xs border", status.color)}>
                      {status.label}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {fish.price.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {genderLabel}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-foreground/80">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{fish.size} cm</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/80">
                    <Palette className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="line-clamp-1">{fish.color}</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground/80">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-xs">{fish.features}</span>
                  </div>
                </div>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
