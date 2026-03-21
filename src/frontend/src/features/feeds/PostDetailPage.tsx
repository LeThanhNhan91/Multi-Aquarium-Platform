"use client";

import React from "react";
import { useGetPostByIdQuery } from "@/services/postApi";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface PostDetailPageProps {
  postId: string;
}

export default function PostDetailPage({ postId }: PostDetailPageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useGetPostByIdQuery(postId);
  const post = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Share2 className="h-10 w-10 text-destructive/50" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Không tìm thấy bài viết
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Bài viết này có thể đã bị xóa hoặc bạn không có quyền truy cập.
        </p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-6 rounded-xl hover:bg-muted"
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50">
      <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/feeds")}
            className="text-muted-foreground hover:text-primary rounded-xl"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="shadow-xl shadow-primary/5">
          <PostCard post={post} />
        </div>

        {/* Additional sections like 'More from this store' could be added here */}
      </div>
    </div>
  );
}
