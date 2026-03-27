"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Heart, MessageCircle, MoreHorizontal, Store, Send, Loader2 } from "lucide-react";
import DOMPurify from "dompurify";

import { PostFeed } from "@/types/post.type";
import { useGetCommentsQuery, useAddCommentMutation, useToggleLikeMutation } from "@/services/postApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";

interface PostDetailModalProps {
  posts: PostFeed[];
  initialIndex: number;
  onClose: () => void;
}

export function PostDetailModal({ posts, initialIndex, onClose }: PostDetailModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [commentText, setCommentText] = useState("");
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const post = posts[currentIndex];
  
  const { data: commentsRes, isLoading: isLoadingComments } = useGetCommentsQuery({
    postId: post?.id || "",
    page: 1,
    size: 20,
  }, { skip: !post });

  const [addComment, { isLoading: isSubmitting }] = useAddCommentMutation();
  const [toggleLike, { isLoading: isTogglingLike }] = useToggleLikeMutation();

  const handleNext = useCallback(() => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setActiveMediaIndex(0);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex, posts.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setActiveMediaIndex(0);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrev, onClose]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;
    try {
      await addComment({ postId: post.id, content: commentText }).unwrap();
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleToggleLike = async () => {
    if (!post || isTogglingLike) return;
    try {
      await toggleLike(post.id).unwrap();
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/90 backdrop-blur-sm">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Up/Down Navigation Arrows */}
      <div className="absolute right-4 md:right-[32%] top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="p-3 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:hover:bg-black/50 rounded-full text-white transition-all backdrop-blur-md"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
        <button 
          onClick={handleNext} 
          disabled={currentIndex === posts.length - 1}
          className="p-3 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:hover:bg-black/50 rounded-full text-white transition-all backdrop-blur-md"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>

      {/* Left Media Area */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-8">
        <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center overflow-hidden rounded-md bg-black/40 group/media">
           {post.media && post.media.length > 0 ? (
             <>
               <div className="w-full h-full flex items-center justify-center relative">
                 {post.media[activeMediaIndex] && (
                   post.media[activeMediaIndex].type === "Video" ? (
                     <video 
                       src={post.media[activeMediaIndex].url} 
                       controls 
                       className="w-full h-full object-contain"
                     />
                   ) : (
                     <Image 
                       src={post.media[activeMediaIndex].url || "/placeholder.svg"} 
                       alt="Post content" 
                       fill 
                       className="object-contain"
                     />
                   )
                 )}
               </div>

               {/* Media Navigation */}
               {post.media.length > 1 && (
                 <>
                   <button 
                     onClick={() => setActiveMediaIndex(prev => Math.max(0, prev - 1))}
                     disabled={activeMediaIndex === 0}
                     className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 disabled:opacity-0 rounded-full text-white transition-all opacity-0 group-hover/media:opacity-100"
                   >
                     <ChevronLeft className="h-6 w-6" />
                   </button>
                   <button 
                     onClick={() => setActiveMediaIndex(prev => Math.min(post.media.length - 1, prev + 1))}
                     disabled={activeMediaIndex === post.media.length - 1}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 disabled:opacity-0 rounded-full text-white transition-all opacity-0 group-hover/media:opacity-100"
                   >
                     <ChevronRight className="h-6 w-6" />
                   </button>
                   
                   {/* Dots */}
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                     {post.media.map((_, i) => (
                       <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i === activeMediaIndex ? "bg-white scale-125" : "bg-white/50")} />
                     ))}
                   </div>
                 </>
               )}
             </>
           ) : (
             <div className="text-white/50 flex flex-col items-center">
               <Image src="/placeholder.svg" alt="No media" width={100} height={100} className="opacity-20 mb-4" />
               Bài viết chỉ có nội dung chữ
             </div>
           )}
        </div>
      </div>

      {/* Right Interaction Sidebar */}
      <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 bg-background flex flex-col h-full rounded-t-2xl md:rounded-none mt-16 md:mt-0 transition-transform duration-300">
        
        {/* Mobile Media (Shown only on small screens above the sidebar) */}
        <div className="md:hidden w-full aspect-square relative bg-black/90 shrink-0 group/mobilemedia">
           {post.media && post.media.length > 0 && (
             <>
               <div className="w-full h-full flex items-center justify-center relative">
                 {post.media[activeMediaIndex] && (
                   post.media[activeMediaIndex].type === "Video" ? (
                     <video 
                       src={post.media[activeMediaIndex].url} 
                       controls 
                       playsInline
                       className="w-full h-full object-contain"
                     />
                   ) : (
                     <Image src={post.media[activeMediaIndex].url} alt="Post content" fill className="object-contain" />
                   )
                 )}
               </div>
               
               {post.media.length > 1 && (
                 <>
                   <button 
                     onClick={(e) => { e.preventDefault(); setActiveMediaIndex(prev => Math.max(0, prev - 1)); }}
                     disabled={activeMediaIndex === 0}
                     className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white disabled:opacity-0"
                   >
                     <ChevronLeft className="h-5 w-5" />
                   </button>
                   <button 
                     onClick={(e) => { e.preventDefault(); setActiveMediaIndex(prev => Math.min(post.media.length - 1, prev + 1)); }}
                     disabled={activeMediaIndex === post.media.length - 1}
                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white disabled:opacity-0"
                   >
                     <ChevronRight className="h-5 w-5" />
                   </button>
                   <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                     {post.media.map((_, i) => (
                       <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === activeMediaIndex ? "bg-white" : "bg-white/50")} />
                     ))}
                   </div>
                 </>
               )}
             </>
           )}
        </div>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0 bg-card">
          <Link href={`/stores/${post.storeId}`} onClick={onClose} className="flex items-center gap-3 group">
            <div className="h-10 w-10 relative rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {post.logoUrl ? (
                <Image src={post.logoUrl} alt={post.storeName || ""} fill className="object-cover" />
              ) : (
                <Store className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm group-hover:underline text-foreground">{post.storeName}</p>
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt + (post.createdAt.endsWith('Z') ? '' : 'Z')), { addSuffix: true, locale: vi })}</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-5 w-5" /></Button>
        </div>

        {/* Scrollable Content + Comments */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-card/50" style={{ scrollbarWidth: 'thin' }}>
          {/* Post Text */}
          <div className="mb-6">
            <style>{`
              .post-modal-content a {
                color: #2563eb !important;
                text-decoration: underline !important;
              }
            `}</style>
            <div 
              className="post-modal-content text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1"
              dangerouslySetInnerHTML={{ __html: post.content ? DOMPurify.sanitize(post.content) : "" }}
            />
          </div>

          <div className="h-px w-full bg-border/50 mb-4" />

          {/* Action Stats */}
          <div className="flex gap-6 mb-6">
            <button onClick={handleToggleLike} className={cn("flex items-center gap-2 group transition-colors", post.isLikedByCurrentUser ? "text-rose-500" : "text-muted-foreground hover:text-foreground")}>
              <div className={cn("p-2 rounded-full", post.isLikedByCurrentUser ? "bg-rose-500/10" : "bg-muted group-hover:bg-muted/80")}>
                <Heart className={cn("h-5 w-5", post.isLikedByCurrentUser && "fill-current")} />
              </div>
              <span className="font-semibold text-sm">{post.likeCount}</span>
            </button>
            <button className="flex items-center gap-2 text-muted-foreground group">
              <div className="p-2 rounded-full bg-muted group-hover:bg-muted/80 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">{post.commentCount}</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-5">
            <h4 className="font-semibold text-sm sticky top-0 bg-background/95 backdrop-blur-md py-2 z-10 flex items-center gap-2">
              Bình luận 
              {isLoadingComments && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </h4>
            
            {commentsRes?.data?.items && commentsRes.data.items.length > 0 ? (
              commentsRes.data.items.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 relative rounded-full overflow-hidden bg-primary/10 shrink-0">
                    {comment.userAvatar ? (
                      <Image src={comment.userAvatar} alt={comment.userName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xs">{comment.userName?.charAt(0) || "U"}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground/90 inline">{comment.userName} </p>
                    <span className="text-xs text-muted-foreground ml-2">{formatDistanceToNow(new Date(comment.createdAt + (comment.createdAt.endsWith('Z') ? '' : 'Z')), { addSuffix: true, locale: vi })}</span>
                    <p className="text-sm text-foreground/80 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              !isLoadingComments && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </div>
              )
            )}
          </div>
        </div>

        {/* Comment Input Footer */}
        <div className="p-4 border-t border-border/50 bg-card shrink-0">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input 
              placeholder="Thêm bình luận..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="bg-muted border-transparent focus-visible:ring-1 focus-visible:bg-background rounded-full"
            />
            <Button 
              type="submit" 
              disabled={!commentText.trim() || isSubmitting}
              size="icon"
              className="rounded-full shrink-0 bg-primary text-primary-foreground"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -ml-0.5 mt-0.5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
