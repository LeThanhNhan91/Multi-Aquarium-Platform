"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Fish,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Ruler,
  Palette,
  CircleUser,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FishInstance } from "@/types/product.type";
import { formatToVND, formatVietnameseDate } from "@/helper/formatter";
import { cn } from "@/utils/utils";
import { STATUS_CONFIG } from "./fishInstance.constants";

export interface ViewDetailDialogProps {
  fish: FishInstance;
  open: boolean;
  onClose: () => void;
  onDelete?: (fish: FishInstance) => void;
}

export function ViewDetailDialog({
  fish,
  open,
  onClose,
  onDelete,
}: ViewDetailDialogProps) {
  const [imageIdx, setImageIdx] = useState(0);

  const statusCfg = STATUS_CONFIG[fish.status] ?? {
    label: fish.status,
    className: "bg-muted text-muted-foreground border-muted",
  };
  const images = fish.images ?? [];
  const hasVideo = !!fish.videoUrl;
  const genderLabel =
    fish.gender === "Male"
      ? "Đực"
      : fish.gender === "Female"
        ? "Cái"
        : "Chưa xác định";

  const details = [
    {
      icon: <Fish className="h-4 w-4" />,
      label: "Giá bán",
      value: formatToVND(fish.price),
      highlight: true,
    },
    {
      icon: <Ruler className="h-4 w-4" />,
      label: "Kích thước",
      value: fish.size,
    },
    ...(fish.color
      ? [
          {
            icon: <Palette className="h-4 w-4" />,
            label: "Màu sắc",
            value: fish.color,
          },
        ]
      : []),
    {
      icon: <CircleUser className="h-4 w-4" />,
      label: "Giới tính",
      value: genderLabel,
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Ngày thêm",
      value: formatVietnameseDate(fish.createdAt),
    },
    ...(fish.features
      ? [
          {
            icon: <FileText className="h-4 w-4" />,
            label: "Đặc điểm",
            value: fish.features,
            full: true,
          },
        ]
      : []),
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setImageIdx(0);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-7xl w-[1000px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex h-[600px] flex-col md:flex-row">
          <div className="md:w-[65%] shrink-0 bg-muted flex flex-col border-r border-border/30">
            <Tabs defaultValue="images" className="flex flex-col h-full">
              <div className="px-4 pt-4 pb-0 bg-muted border-b border-border/30">
                <TabsList className="h-8 bg-background/60 rounded-lg p-0.5">
                  <TabsTrigger
                    value="images"
                    className="h-7 px-3 text-xs gap-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Ảnh
                    {images.length > 0 && (
                      <span className="text-muted-foreground">
                        ({images.length})
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    disabled={!hasVideo}
                    className="h-7 px-3 text-xs gap-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm disabled:opacity-40"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Video
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="images"
                className="flex-1 m-0 relative overflow-hidden"
              >
                {images.length > 0 ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={images[imageIdx]}
                      alt={`Cá #${fish.id.slice(0, 6)}`}
                      fill
                      className="object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setImageIdx(
                              (i) => (i - 1 + images.length) % images.length,
                            )
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-sm"
                        >
                          <ChevronLeft className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() =>
                            setImageIdx((i) => (i + 1) % images.length)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-sm"
                        >
                          <ChevronRight className="h-4 w-4 text-white" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setImageIdx(i)}
                              className={cn(
                                "h-1.5 rounded-full transition-all duration-200",
                                i === imageIdx
                                  ? "w-4 bg-white"
                                  : "w-1.5 bg-white/50 hover:bg-white/75",
                              )}
                            />
                          ))}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {imageIdx + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <ImageIcon className="h-16 w-16 opacity-20" />
                    <p className="text-sm">Chưa có ảnh</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="video"
                className="flex-1 m-0 overflow-hidden bg-black"
              >
                {hasVideo ? (
                  <video
                    src={fish.videoUrl!}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Video className="h-16 w-16 opacity-20" />
                    <p className="text-sm">Không có video</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/50 shrink-0">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Fish className="h-5 w-5 text-primary shrink-0" />
                Chi tiết cá cảnh
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-2xl font-bold text-primary">
                  {formatToVND(fish.price)}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs border px-2 py-0.5",
                    statusCfg.className,
                  )}
                >
                  {statusCfg.label}
                </Badge>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {details
                .filter((d) => !d.highlight)
                .map((detail, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      detail.full
                        ? "flex flex-col gap-1"
                        : "flex items-start gap-3",
                    )}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground shrink-0 min-w-[110px]">
                      <span className="text-primary/60">{detail.icon}</span>
                      <span className="text-xs font-medium">
                        {detail.label}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm text-foreground",
                        detail.full && "leading-relaxed text-muted-foreground",
                      )}
                    >
                      {detail.value}
                    </p>
                  </div>
                ))}
            </div>
            <div className="px-6 py-4 border-t border-border/30 mt-auto flex items-center justify-end bg-card/50 shrink-0">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg px-3"
                  onClick={() => {
                    onClose();
                    onDelete(fish);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Xóa</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
