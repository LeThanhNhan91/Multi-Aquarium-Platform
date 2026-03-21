"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useGetFeedQuery } from "@/services/postApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "lucide-react";
import { PostFeed } from "@/types/post.type";

const VirtualizedFeedList = dynamic(() => import("./VirtualizedFeedList"), {
  ssr: false,
});

const PAGE_INITIAL = 1;

export function FeedsPage() {
  const [page, setPage] = useState(PAGE_INITIAL);
  const [posts, setPosts] = useState<PostFeed[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<any>(null);

  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    new Set(),
  );

  // Optimized: Only toggle the state, no manual height math or resetAfterIndex needed
  // ResizeObserver in VirtualizedFeedList will handle the rest
  const handleToggleExpand = React.useCallback((index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const { data, isLoading, isFetching } = useGetFeedQuery(
    { page, size: 10 },
    { skip: !hasMore && page > 1 },
  );

  useEffect(() => {
    if (data?.data?.items) {
      const newPosts = data.data.items;
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const filtered = newPosts.filter((p) => !ids.has(p.id));
        if (filtered.length === 0) return prev;
        return [...prev, ...filtered];
      });
      if (posts.length + newPosts.length >= data.data.totalCount) {
        setHasMore(false);
      }
    }
  }, [data]);

  const onRowsRendered = React.useCallback(({ stopIndex }: { stopIndex: number }) => {
    if (hasMore && !isFetching && stopIndex >= posts.length - 2) {
      setPage((p) => p + 1);
    }
  }, [hasMore, isFetching, posts.length]);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-background overflow-hidden">
      {/* Virtualized List Container */}
      <div className="flex-1 w-full overflow-hidden">
        {isLoading && posts.length === 0 ? (
          <div className="max-w-xl mx-auto px-4">
            <FeedSkeletons />
          </div>
        ) : posts.length === 0 ? (
          <EmptyFeed />
        ) : (
          <VirtualizedFeedList
            listRef={listRef}
            posts={posts}
            height={window.innerHeight - 80}
            onRowsRendered={onRowsRendered}
            onToggleExpand={handleToggleExpand}
          />
        )}
      </div>

      {isFetching && (
        <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg border animate-pulse z-50">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

const page_initial = 1;

function FeedSkeletons({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-2"
        >
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
      <h3 className="text-lg font-semibold text-foreground">
        Chưa có bài viết nào
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Các cửa hàng chưa đăng bài viết nào. Hãy quay lại sau!
      </p>
    </div>
  );
}
