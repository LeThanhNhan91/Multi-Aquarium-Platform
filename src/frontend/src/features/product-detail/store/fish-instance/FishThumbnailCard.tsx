"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Image as ImageIcon, Video } from "lucide-react";
import { FishInstance } from "@/types/product.type";
import { formatToVND } from "@/helper/formatter";
import { cn } from "@/utils/utils";
import { STATUS_CONFIG } from "./fishInstance.constants";

export interface FishThumbnailCardProps {
  fish: FishInstance;
  onView: (fish: FishInstance) => void;
  onEdit: (fish: FishInstance) => void;
  onDelete: (fish: FishInstance) => void;
}

export function FishThumbnailCard({
  fish,
  onView,
  onEdit,
  onDelete,
}: FishThumbnailCardProps) {
  const statusCfg = STATUS_CONFIG[fish.status] ?? {
    label: fish.status,
    className: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="aspect-square overflow-hidden bg-muted">
          {fish.images?.[0] ? (
            <img
              src={fish.images[0]}
              alt={`Cá #${fish.id.slice(0, 6)}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl bg-white/90 text-foreground hover:bg-white shadow-lg"
                onClick={() => onView(fish)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xem chi tiết</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl bg-white/90 text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg"
                onClick={() => onEdit(fish)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chỉnh sửa</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl bg-white/90 text-foreground hover:bg-destructive hover:text-destructive-foreground shadow-lg"
                onClick={() => onDelete(fish)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xóa</TooltipContent>
          </Tooltip>
        </div>

        <div className="absolute top-2 left-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] border px-1.5 py-0 backdrop-blur-sm bg-white/80",
              statusCfg.className,
            )}
          >
            {statusCfg.label}
          </Badge>
        </div>

        {fish.videoUrl && (
          <div className="absolute top-2 right-2">
            <div className="h-5 w-5 rounded-full bg-black/60 flex items-center justify-center">
              <Video className="h-3 w-3 text-white" />
            </div>
          </div>
        )}

        <div className="p-3 border-t border-border/50">
          <p className="text-sm font-bold text-primary truncate">
            {formatToVND(fish.price)}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {fish.size}
            {fish.color ? ` · ${fish.color}` : ""}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
