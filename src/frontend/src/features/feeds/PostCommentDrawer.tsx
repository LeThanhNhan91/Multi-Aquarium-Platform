"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useGetCommentsQuery, useAddCommentMutation } from "@/services/postApi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, SendHorizonal } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

interface PostCommentDrawerProps {
  postId: string;
  commentCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostCommentDrawer({ postId, commentCount, open, onOpenChange }: PostCommentDrawerProps) {
  const [content, setContent] = useState("");
  const [addComment, { isLoading: isSending }] = useAddCommentMutation();
  const auth = useSelector((state: RootState) => state.auth);
  const isLoggedIn = !!auth?.accessToken;

  const { data, isLoading } = useGetCommentsQuery(
    { postId, page: 1, size: 20 },
    { skip: !open }
  );

  const comments = data?.data?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập để bình luận.");
      return;
    }
    try {
      await addComment({ postId, content }).unwrap();
      setContent("");
    } catch {
      toast.error("Không thể gửi bình luận. Thử lại sau.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col h-full border-l shadow-2xl bg-background"
      >
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-10 w-full">
          <SheetTitle className="text-lg font-bold">Bình luận ({commentCount})</SheetTitle>
        </SheetHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 mt-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <SendHorizonal className="w-8 h-8 text-muted-foreground rotate-45 opacity-20" />
              </div>
              <p className="text-base font-medium">Chưa có bình luận nào</p>
              <p className="text-sm opacity-70">Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary/80 to-accent/80 flex items-center justify-center shrink-0 border border-background shadow-sm">
                  {comment.userAvatar ? (
                    <Image src={comment.userAvatar} alt={comment.userName} width={36} height={36} className="rounded-full object-cover" />
                  ) : (
                    <UserCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1 max-w-[85%]">
                  <div className="bg-muted px-4 py-2.5 rounded-2xl shadow-xs">
                    <p className="text-[13px] font-bold text-foreground mb-0.5">{comment.userName}</p>
                    <p className="text-sm text-foreground leading-relaxed wrap-break-word">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-2">
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                    <button className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors">Thích</button>
                    <button className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors">Phản hồi</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment input footer */}
        <div className="p-4 border-t bg-background shrink-0 pb-safe">
          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="flex gap-3 items-end group">
              <div className="flex-1 bg-muted rounded-2xl px-1 py-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-transparent focus-within:border-primary/20">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Viết phản hồi của bạn..."
                  className="w-full min-h-[44px] max-h-[120px] resize-none rounded-xl text-sm bg-transparent border-none focus-visible:ring-0 shadow-none px-3 py-2.5 placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={isSending || !content.trim()}
                className={cn(
                  "rounded-full h-10 w-10 shrink-0 shadow-lg transition-all scale-100 hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground",
                  (!content.trim() || isSending) && "opacity-50 grayscale"
                )}
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="text-center py-2 px-4 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-primary hover:underline cursor-pointer transition-all" onClick={() => onOpenChange(false)}>
                  Đăng nhập
                </span> 
                {" "}để tham gia thảo luận
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageCircleIcon() {
  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
  );
}
