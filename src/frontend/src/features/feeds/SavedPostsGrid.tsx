"use client";

import React, { useState } from "react";
import { useGetLikedPostsQuery } from "@/services/postApi";
import { PostGridItem } from "./PostGridItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

export default function SavedPostsGrid() {
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, isFetching } = useGetLikedPostsQuery({ 
    page, 
    size: pageSize 
  });

  const posts = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-3/4 rounded-xl overflow-hidden bg-muted animate-pulse">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0 && !isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Bookmark className="h-8 w-8 text-primary/40" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Chưa có bài viết nào</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Những bài viết bạn yêu thích sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid Display */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {posts.map((post) => (
          <PostGridItem key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="rounded-xl h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              // Simple pagination logic for many pages
              if (
                totalPages > 7 && 
                pageNum !== 1 && 
                pageNum !== totalPages && 
                (pageNum < page - 1 || pageNum > page + 1)
              ) {
                if (pageNum === page - 2 || pageNum === page + 2) {
                  return <span key={pageNum} className="text-muted-foreground px-1">...</span>;
                }
                return null;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  disabled={isFetching}
                  className={cn(
                    "h-9 w-9 rounded-xl font-bold transition-all",
                    page === pageNum ? "shadow-md scale-105" : "text-muted-foreground"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isFetching}
            className="rounded-xl h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
