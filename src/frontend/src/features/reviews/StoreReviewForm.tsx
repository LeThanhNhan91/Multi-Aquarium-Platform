"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImagePlus, Star, X } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/utils";
import {
  useCreateStoreReviewMutation,
} from "@/services/reviewApi";
import { toast } from "sonner";

const reviewSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn số sao").max(5),
  comment: z
    .string()
    .min(10, "Nhận xét phải có ít nhất 10 ký tự")
    .max(1000, "Nhận xét không được quá 1000 ký tự"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface StoreReviewFormProps {
  storeId: string;
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StoreReviewForm({
  storeId,
  orderId,
  open,
  onOpenChange,
  onSuccess,
}: StoreReviewFormProps) {
  const [createReview, { isLoading }] = useCreateStoreReviewMutation();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    form.reset();
    setImageFiles([]);
    setImagePreviews([]);
  };

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      await createReview({
        storeId,
        request: { orderId, rating: values.rating, comment: values.comment, images: imageFiles },
      }).unwrap();

      toast.success("Cảm ơn bạn đã đánh giá cửa hàng!");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.",
      );
    }
  };

  const busy = isLoading;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) { resetForm(); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Viết đánh giá cửa hàng</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm mua hàng của bạn tại cửa hàng này.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-base">Đánh giá của bạn</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="hover:scale-110 transition-transform"
                          onClick={() => field.onChange(star)}
                        >
                          <Star
                            className={cn(
                              "h-8 w-8 transition-colors",
                              star <= field.value
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhận xét</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dịch vụ, đóng gói, tốc độ giao hàng... Hãy chia sẻ!"
                      className="min-h-25 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Hình ảnh{" "}
                <span className="text-muted-foreground font-normal">
                  (tối đa 5)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 rounded-lg overflow-hidden border border-border/50"
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 hover:bg-black/80"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                {imageFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-1 hover:bg-muted/40 transition-colors"
                  >
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Thêm ảnh
                    </span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { resetForm(); onOpenChange(false); }}
                disabled={busy}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={busy}>
                {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
