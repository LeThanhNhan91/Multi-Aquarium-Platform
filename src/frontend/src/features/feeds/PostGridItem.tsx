"use client";

import React from "react";
import Image from "next/image";
import { Heart, MessageCircle, Play } from "lucide-react";
import { PostFeed } from "@/types/post.type";
import Link from "next/link";
import { cn } from "@/utils/utils";

interface PostGridItemProps {
  post: PostFeed;
}

/**
 * TikTok-style grid item for social posts.
 * Shows first media thumbnail with engagement overlay on hover.
 */
export function PostGridItem({ post }: PostGridItemProps) {
  const firstMedia = post.media[0];
  const isVideo = firstMedia?.type === "Video";

  return (
    <Link 
      href={`/posts/${post.id}`}
      className="group relative aspect-3/4 rounded-xl overflow-hidden bg-muted border border-border/50 hover:shadow-xl transition-all duration-500 block"
    >
      {/* Thumbnail */}
      {firstMedia ? (
        <div className="h-full w-full relative">
          <Image
            src={firstMedia.url}
            alt="Post preview"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Video Indicator */}
          {isVideo && (
            <div className="absolute top-2 right-2 p-1 bg-black/40 rounded-full backdrop-blur-sm z-10 border border-white/20">
              <Play className="h-3 w-3 text-white fill-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center p-4 bg-linear-to-br from-muted to-muted/50">
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center font-medium line-clamp-4">
            {post.content || "Không có nội dung"}
          </p>
        </div>
      )}

      {/* Hover Overlay - Engagement Info */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center gap-1.5 drop-shadow-md">
            <Heart className="h-4 w-4 fill-white" />
            <span className="text-xs font-bold">{post.likeCount}</span>
          </div>
          <div className="flex items-center gap-1.5 drop-shadow-md">
            <MessageCircle className="h-4 w-4 fill-white" />
            <span className="text-xs font-bold">{post.commentCount}</span>
          </div>
        </div>
        
        {/* Caption Preview */}
        <p className="text-[10px] text-white/90 font-medium line-clamp-1 mt-1 drop-shadow-md">
          {post.content.replace(/<[^>]*>/g, "")}
        </p>
      </div>

      {/* Bottom info (Mobile always visible or slightly dimmed) */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 sm:hidden">
         <Heart className="h-3 w-3 fill-white/80 text-white/80" />
         <span className="text-[10px] text-white font-bold">{post.likeCount}</span>
      </div>
    </Link>
  );
}
