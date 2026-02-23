"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import Image from "next/image";
import { cn } from "@/utils/utils";

interface ImageGalleryProps {
  images: string[];
  videoUrl?: string | null;
}

type Slide = { type: "image"; src: string } | { type: "video"; src: string };

export function ImageGallery({ images, videoUrl }: ImageGalleryProps) {
  const slides: Slide[] = [
    ...(images ?? []).map((src): Slide => ({ type: "image", src })),
    ...(videoUrl ? [{ type: "video" as const, src: videoUrl }] : []),
  ];

  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset index when slides change (e.g. fish selection changes)
  useEffect(() => {
    setSelected(0);
    setZoom(false);
  }, [images, videoUrl]);

  // Pause video when navigating away
  const goTo = (index: number) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setSelected(index);
    setZoom(false);
  };

  const handlePrevious = () =>
    goTo(selected === 0 ? slides.length - 1 : selected - 1);
  const handleNext = () =>
    goTo(selected === slides.length - 1 ? 0 : selected + 1);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (slides.length === 0) {
    return (
      <div className="w-full aspect-square bg-secondary/30 rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground">Chưa có ảnh</p>
      </div>
    );
  }

  const currentSlide = slides[selected];
  const isVideo = currentSlide.type === "video";
  const isYoutube = isVideo && /youtube|youtu\.be/.test(currentSlide.src);
  const youtubeId = isYoutube
    ? currentSlide.src.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1]
    : null;

  return (
    <div className="space-y-4">
      {/* Main Slide */}
      <div className="relative w-full aspect-square bg-secondary/20 rounded-2xl overflow-hidden group">
        {/* Image slide */}
        {!isVideo && (
          <Image
            src={currentSlide.src}
            alt="Product image"
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              zoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in",
            )}
            onClick={() => setZoom(!zoom)}
          />
        )}

        {/* YouTube embed */}
        {isVideo && isYoutube && youtubeId && (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}

        {/* Native video */}
        {isVideo && !isYoutube && (
          <>
            <video
              ref={videoRef}
              src={currentSlide.src}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              playsInline
            />
            {/* Centre play/pause */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={togglePlay}
            >
              <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 cursor-pointer transition-colors">
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white fill-white" />
                ) : (
                  <Play className="h-6 w-6 text-white fill-white ml-1" />
                )}
              </div>
            </div>
            {/* Static play button when paused */}
            {!isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none"
              >
                <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="h-7 w-7 text-white fill-white ml-1" />
                </div>
              </div>
            )}
            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-t from-black/60 to-transparent">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => videoRef.current?.requestFullscreen()}
                className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* Zoom button (images only) */}
        {!isVideo && (
          <button
            onClick={() => setZoom(!zoom)}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
          >
            <ZoomIn className="h-5 w-5 text-primary" />
          </button>
        )}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
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

        {/* Counter */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground">
          {selected + 1} / {slides.length}
        </div>
      </div>

      {/* Thumbnails */}
      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-muted",
                selected === index
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border hover:border-primary/50",
              )}
            >
              {slide.type === "image" ? (
                <Image
                  src={slide.src}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <Play className="h-6 w-6 text-white fill-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
