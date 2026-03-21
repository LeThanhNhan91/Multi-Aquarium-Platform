"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Heart, MessageCircle, Store, Clock } from "lucide-react";
import { PostFeed } from "@/types/post.type";
import { useToggleLikeMutation } from "@/services/postApi";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { cn } from "@/utils/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { PostMediaViewer } from "./PostMediaViewer";
import { PostCommentDrawer } from "./PostCommentDrawer";
import Link from "next/link";
import { toast } from "sonner";
import DOMPurify from "dompurify";

interface PostCardProps {
  post: PostFeed;
  onToggleExpand?: () => void;
}

export function PostCard({ post, onToggleExpand }: PostCardProps) {
  const [toggleLike] = useToggleLikeMutation();
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);
  const isLoggedIn = !!auth?.accessToken;

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập để thích bài viết.");
      return;
    }
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      await toggleLike(post.id).unwrap();
    } catch {
      setIsLiked(!newLiked);
      setLikeCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  const sanitizedContent = post.content ? DOMPurify.sanitize(post.content) : "";
  const hasLongContent = sanitizedContent.replace(/<[^>]*>/g, "").length > 150;

  return (
    <article className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group">
      {/* Store Header */}
      <div className="flex items-center gap-3 p-4">
        <Link href={`/stores/${post.storeId}`} className="flex items-center gap-3 group/store">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0 ring-2 ring-offset-2 ring-blue-200 group-hover/store:ring-blue-400 transition-all">
            {post.logoUrl ? (
              <Image src={post.logoUrl} alt={post.storeName} fill className="object-cover" />
            ) : (
              <Store className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground group-hover/store:text-blue-600 transition-colors">
              {post.storeName}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(post.createdAt + (post.createdAt.endsWith('Z') ? '' : 'Z')), { addSuffix: true, locale: vi })}
            </div>
          </div>
        </Link>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <style>{`
            .post-content a {
              color: #2563eb !important;
              text-decoration: underline !important;
            }
          `}</style>
          <div 
            className={cn(
              "post-content text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1",
              !isExpanded && "line-clamp-3"
            )}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
          {hasLongContent && (
            <button 
              onClick={() => {
                setIsExpanded(!isExpanded);
                onToggleExpand?.();
              }}
              className="mt-1 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              {isExpanded ? "Ẩn bớt" : "...Xem thêm"}
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media.length > 0 && (
        <PostMediaViewer media={post.media} />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-border/60">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
        >
          <div
            className={cn(
              "p-1.5 rounded-full transition-all",
              isLiked
                ? "bg-red-50 text-red-500"
                : "text-muted-foreground hover:bg-red-50 hover:text-red-400"
            )}
          >
            <Heart
              className={cn("h-5 w-5 transition-all", isLiked && "fill-red-500")}
            />
          </div>
          {likeCount > 0 && (
            <span className={cn("text-muted-foreground", isLiked && "text-red-500")}>
              {likeCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCommentsOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-blue-500 transition-colors"
        >
          <div className="p-1.5 rounded-full hover:bg-blue-50 transition-all">
            <MessageCircle className="h-5 w-5" />
          </div>
          {post.commentCount > 0 && <span>{post.commentCount}</span>}
        </button>
      </div>

      {commentsOpen && (
        <PostCommentDrawer
          postId={post.id}
          commentCount={post.commentCount}
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
        />
      )}
    </article>
  );
}
