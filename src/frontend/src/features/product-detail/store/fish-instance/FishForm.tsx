"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UploadCloud, X, Video, Loader2 } from "lucide-react";
import {
  useCreateFishInstanceMutation,
  useUpdateFishInstanceMutation,
} from "@/services/fishInstanceApi";
import { FishInstance } from "@/types/product.type";
import { toast } from "sonner";
import { STATUS_CONFIG, GENDER_OPTIONS } from "./fishInstance.constants";

const fishInstanceSchema = z.object({
  price: z.number().positive("Giá phải lớn hơn 0"),
  size: z.string().min(1, "Vui lòng nhập kích thước"),
  color: z.string().optional(),
  features: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().optional(),
});

type FishInstanceFormValues = z.infer<typeof fishInstanceSchema>;

interface FilePreview {
  file: File;
  url: string;
}

export interface FishFormProps {
  productId: string;
  editTarget?: FishInstance;
  onBack: () => void;
}

export function FishForm({ productId, editTarget, onBack }: FishFormProps) {
  const isEdit = !!editTarget;

  const [createFishInstance, { isLoading: isCreating }] =
    useCreateFishInstanceMutation();
  const [updateFishInstance, { isLoading: isUpdating }] =
    useUpdateFishInstanceMutation();

  const [imagePreviews, setImagePreviews] = useState<FilePreview[]>([]);
  const [videoPreview, setVideoPreview] = useState<FilePreview | null>(null);

  const form = useForm<FishInstanceFormValues>({
    resolver: zodResolver(fishInstanceSchema),
    defaultValues: {
      price: editTarget?.price ?? 0,
      size: editTarget?.size ?? "",
      color: editTarget?.color ?? "",
      features: editTarget?.features ?? "",
      gender: editTarget?.gender ?? "Unknown",
      status: editTarget?.status ?? "Available",
    },
  });

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoPreview) URL.revokeObjectURL(videoPreview.url);
    setVideoPreview({ file, url: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const removeImagePreview = (idx: number) => {
    URL.revokeObjectURL(imagePreviews[idx].url);
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (values: FishInstanceFormValues) => {
    try {
      if (isEdit && editTarget) {
        await updateFishInstance({
          productId,
          fishInstanceId: editTarget.id,
          data: {
            price: values.price,
            size: values.size,
            color: values.color,
            features: values.features,
            gender: values.gender,
            status: (values.status as any) ?? "Available",
          },
        }).unwrap();
        toast.success("Đã cập nhật cá cảnh!");
      } else {
        await createFishInstance({
          productId,
          data: {
            price: values.price,
            size: values.size,
            color: values.color,
            features: values.features,
            gender: values.gender,
            images: imagePreviews.map((p) => p.file),
            video: videoPreview?.file,
          },
        }).unwrap();
        toast.success("Đã thêm cá cảnh mới!");
      }
      onBack();
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Separator orientation="vertical" className="h-5" />
        <h3 className="font-semibold text-foreground">
          {isEdit ? "Chỉnh sửa cá cảnh" : "Thêm cá cảnh mới"}
        </h3>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pr-1"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá (VND) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="350000"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? "" : parseFloat(value));
                      }}
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kích thước *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: 5cm, M, Large"
                      {...field}
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Màu sắc</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Đỏ đuôi xanh"
                      {...field}
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới tính</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đặc điểm nổi bật</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="VD: Đuôi dài, màu sắc rực rỡ, khỏe mạnh..."
                    {...field}
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEdit && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                        <SelectItem key={value} value={value}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {!isEdit && (
            <div className="space-y-2">
              <FormLabel>Ảnh minh hoạ</FormLabel>
              <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-border/60 rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Chọn ảnh (có thể chọn nhiều)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImagesChange}
                />
              </label>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 w-20 rounded-xl overflow-hidden border border-border/50"
                    >
                      <Image
                        src={p.url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImagePreview(idx)}
                        className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center shadow"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isEdit && (
            <div className="space-y-2">
              <FormLabel>Video (tùy chọn)</FormLabel>
              <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-border/60 rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Video className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {videoPreview ? videoPreview.file.name : "Chọn video"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoChange}
                />
              </label>
              {videoPreview && (
                <div className="relative rounded-xl overflow-hidden border border-border/50">
                  <video
                    src={videoPreview.url}
                    controls
                    className="w-full max-h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(videoPreview.url);
                      setVideoPreview(null);
                    }}
                    className="absolute top-2 right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center shadow"
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onBack}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-primary text-primary-foreground"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Thêm cá"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
