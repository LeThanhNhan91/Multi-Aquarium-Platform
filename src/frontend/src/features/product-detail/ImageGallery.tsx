"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(false);
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl overflow-hidden group">
        <Image
          src={images[selectedImage]}
          alt="Product image"
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            zoom && "scale-150 cursor-zoom-out",
            !zoom && "cursor-zoom-in",
          )}
          onClick={() => setZoom(!zoom)}
        />

        {/* Zoom Icon */}
        <button
          onClick={() => setZoom(!zoom)}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          title={zoom ? "Zoom out" : "Zoom in"}
        >
          <ZoomIn className="h-5 w-5 text-primary" />
        </button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5 text-primary" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImage(index);
                setZoom(false);
              }}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                selectedImage === index
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border hover:border-primary/50",
              )}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
