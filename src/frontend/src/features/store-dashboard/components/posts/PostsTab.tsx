"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  FileText,
  Clock,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreatePostMutation,
  useGetFeedQuery,
  useDeletePostMutation,
} from "@/services/postApi";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { PostFeed } from "@/types/post.type";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostsTabProps {
  storeId: string;
}

export function PostsTab({ storeId }: PostsTabProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const { data, isLoading } = useGetFeedQuery({ page: 1, size: 50 });
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  // Filter posts for this store
  const posts = (data?.data?.items ?? []).filter((p) => p.storeId === storeId);

  const handleDelete = async () => {
    if (!deletePostId) return;
    try {
      await deletePost(deletePostId).unwrap();
      toast.success("Đã xóa bài viết.");
    } catch {
      toast.error("Không thể xóa bài viết.");
    } finally {
      setDeletePostId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Bài viết</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý bài viết của cửa hàng
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          Đăng bài mới
        </Button>
      </div>

      {/* Posts grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">Chưa có bài viết nào</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Đăng bài viết đầu tiên của bạn!
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2 rounded-xl"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" /> Đăng bài mới
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostManagementCard
              key={post.id}
              post={post}
              onDelete={() => setDeletePostId(post.id)}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreatePostDialog
        storeId={storeId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deletePostId}
        onOpenChange={() => setDeletePostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết này sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PostManagementCard({
  post,
  onDelete,
}: {
  post: PostFeed;
  onDelete: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      {/* Media preview */}
      {post.media.length > 0 && (
        <div className="relative h-40 w-full bg-muted">
          {post.media[0].type === "Video" ? (
            <video
              src={post.media[0].url}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={post.media[0].url}
              alt="Post"
              fill
              className="object-cover"
            />
          )}
          {post.media.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              +{post.media.length - 1}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <p className="text-sm text-foreground line-clamp-2 mb-3">
          {post.content
            ? post.content.replace(/<[^>]*>/g, "")
            : "Không có nội dung văn bản"}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(
                new Date(
                  post.createdAt + (post.createdAt.endsWith("Z") ? "" : "Z"),
                ),
                { addSuffix: true, locale: vi },
              )}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CreatePostDialogProps {
  storeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreatePostDialog({
  storeId,
  open,
  onOpenChange,
}: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);
  const [createPost, { isLoading }] = useCreatePostMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video") ? "video" : "image",
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast.error("Bài viết cần có nội dung hoặc ít nhất một tệp đính kèm.");
      return;
    }
    try {
      await createPost({ storeId, content, mediaFiles: files }).unwrap();
      toast.success("Bài viết đã được đăng!");
      setContent("");
      setFiles([]);
      setPreviews([]);
      onOpenChange(false);
    } catch {
      toast.error("Không thể đăng bài. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Đăng bài viết mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Chia sẻ về sản phẩm, tin tức cửa hàng của bạn..."
            className="min-h-[150px]"
          />

          {/* Media previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden aspect-square bg-muted group"
                >
                  {preview.type === "video" ? (
                    <video
                      src={preview.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={preview.url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 h-5 w-5 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-1 left-1">
                    {preview.type === "video" ? (
                      <Video className="h-4 w-4 text-white drop-shadow" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-white drop-shadow" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File input */}
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-primary">
              <ImageIcon className="h-4 w-4" />
              Thêm ảnh / video
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? "Đang đăng..." : "Đăng bài"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
