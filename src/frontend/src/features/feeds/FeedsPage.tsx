"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useGetFeedQuery } from "@/services/postApi";
import { PostCard } from "@/features/feeds/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "lucide-react";
import { useState } from "react";
import { PostFeed } from "@/types/post.type";

export function FeedsPage() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostFeed[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isFetching } = useGetFeedQuery(
    { page, size: 10 },
    { skip: !hasMore && page > 1 }
  );

  useEffect(() => {
    if (data?.data?.items) {
      const newPosts = data.data.items;
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...newPosts.filter((p) => !ids.has(p.id))];
      });
      if (posts.length + newPosts.length >= data.data.totalCount) {
        setHasMore(false);
      }
    }
  }, [data]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [hasMore, isFetching]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    observerRef.current = new IntersectionObserver(handleObserver, { threshold: 0.5 });
    observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Newspaper className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tin tức</h1>
          <p className="text-xs text-muted-foreground">Bài viết mới nhất từ các cửa hàng</p>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <FeedSkeletons />
      ) : posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="h-6" />

          {isFetching && (
            <div className="space-y-4">
              <FeedSkeletons count={2} />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Bạn đã xem hết tất cả bài viết ✨
            </p>
          )}
        </>
      )}
    </div>
  );
}

function FeedSkeletons({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="px-4 pb-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-48 w-full" />
          <div className="p-4 flex gap-4">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Newspaper className="h-10 w-10 text-blue-300" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Chưa có bài viết nào</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Các cửa hàng chưa đăng bài viết nào. Hãy quay lại sau!
      </p>
    </div>
  );
}
