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

interface PostCommentDrawerProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostCommentDrawer({ postId, open, onOpenChange }: PostCommentDrawerProps) {
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
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl flex flex-col p-0">
        <SheetHeader className="p-4 pb-0 border-b">
          <SheetTitle className="text-base font-bold">Bình luận</SheetTitle>
        </SheetHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <MessageCircleIcon />
              <p className="text-sm mt-2">Chưa có bình luận nào</p>
              <p className="text-xs">Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-cyan-400 flex items-center justify-center shrink-0">
                  {comment.userAvatar ? (
                    <Image src={comment.userAvatar} alt={comment.userName} width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <UserCircle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-2xl px-3 py-2">
                    <p className="text-xs font-bold text-foreground">{comment.userName}</p>
                    <p className="text-sm text-foreground mt-0.5 leading-relaxed">{comment.content}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 ml-3">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment input */}
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 items-end">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 min-h-[48px] max-h-[120px] resize-none rounded-2xl text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isSending || !content.trim()}
              className="rounded-full h-10 w-10 shrink-0 bg-blue-500 hover:bg-blue-600"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="p-4 border-t text-center text-sm text-muted-foreground">
            <span className="font-medium text-blue-500 cursor-pointer" onClick={() => onOpenChange(false)}>Đăng nhập</span> để bình luận
          </div>
        )}
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
