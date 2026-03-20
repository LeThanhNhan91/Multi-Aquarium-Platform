"use client";

import Image from "next/image";
import React, { useState } from "react";
import { PostMedia } from "@/types/post.type";
import { cn } from "@/utils/utils";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";

interface PostMediaViewerProps {
  media: PostMedia[];
}

export function PostMediaViewer({ media }: PostMediaViewerProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const renderMediaItem = (
    item: PostMedia,
    index: number,
    className?: string,
  ) => {
    const isLast = index === 3 && media.length > 4;

    if (item.type === "Video") {
      return (
        <div
          key={item.id}
          className={cn("relative bg-black cursor-pointer group", className)}
          onClick={() => setLightboxIndex(index)}
        >
          <video
            src={item.url}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 group-hover:bg-black/70 transition-all">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
          {isLast && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="text-white text-2xl font-bold">
                +{media.length - 4}
              </span>
            </div>
          )}
        </div>
      );
    }
    return (
      <div
        key={item.id}
        className={cn(
          "relative overflow-hidden cursor-pointer group",
          className,
        )}
        onClick={() => setLightboxIndex(index)}
      >
        <Image
          src={item.url}
          alt="Post media"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isLast && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              +{media.length - 4}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-full">
        {/* 1 Item */}
        {media.length === 1 && (
          <div className="relative w-full aspect-4/3 max-h-[500px] bg-muted/20">
            {renderMediaItem(media[0], 0, "absolute inset-0")}
          </div>
        )}

        {/* 2 Items */}
        {media.length === 2 && (
          <div className="grid grid-cols-2 gap-0.5 aspect-3/2 bg-muted/20">
            {media.map((item, i) => (
              <div key={item.id} className="relative h-full">
                {renderMediaItem(item, i, "absolute inset-0")}
              </div>
            ))}
          </div>
        )}

        {/* 3 Items - 1 big left, 2 small right */}
        {media.length === 3 && (
          <div className="grid grid-cols-3 grid-rows-2 gap-0.5 aspect-3/2 bg-muted/20">
            <div className="col-span-2 row-span-2">
              {renderMediaItem(media[0], 0, "relative h-full")}
            </div>
            <div className="col-span-1 row-span-1">
              {renderMediaItem(media[1], 1, "relative h-full")}
            </div>
            <div className="col-span-1 row-span-1">
              {renderMediaItem(media[2], 2, "relative h-full")}
            </div>
          </div>
        )}

        {/* 4+ Items - 2x2 Grid */}
        {media.length >= 4 && (
          <div className="grid grid-cols-2 gap-0.5 aspect-square bg-muted/20">
            {media.slice(0, 4).map((item, i) => (
              <div key={item.id} className="relative h-full">
                {renderMediaItem(item, i, "absolute inset-0")}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-8 w-8" />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white hover:text-gray-300 z-10 p-2 bg-black/40 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {media[lightboxIndex].type === "Video" ? (
              <video
                src={media[lightboxIndex].url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg"
              />
            ) : (
              <div
                className="relative"
                style={{
                  width: "min(90vw, 800px)",
                  height: "min(90vh, 600px)",
                }}
              >
                <Image
                  src={media[lightboxIndex].url}
                  alt="Post media"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {lightboxIndex < media.length - 1 && (
            <button
              className="absolute right-4 text-white hover:text-gray-300 z-10 p-2 bg-black/40 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="absolute bottom-4 flex gap-2">
            {media.map((_, i) => (
              <button
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === lightboxIndex ? "bg-white scale-125" : "bg-white/40",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(i);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
