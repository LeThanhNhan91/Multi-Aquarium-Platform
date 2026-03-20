"use client";

import React from "react";
import { useGetLikedPostsQuery } from "@/services/postApi";
import { PostCard } from "@/features/feeds/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";

export function SavedPostsPage() {
  const { data, isLoading } = useGetLikedPostsQuery({ page: 1, size: 20 });
  const posts = data?.data?.items ?? [];

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-rose-500 to-pink-500 flex items-center justify-center">
          <Bookmark className="h-5 w-5 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Bài viết đã thích</h1>
          <p className="text-xs text-muted-foreground">Các bài viết bạn đã thích</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <Bookmark className="h-10 w-10 text-rose-300" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Chưa có bài viết nào được lưu</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Thích các bài viết để lưu chúng vào đây và xem lại bất cứ lúc nào.
          </p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
