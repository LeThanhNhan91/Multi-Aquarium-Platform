"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductItem, UpdateProductRequest } from "@/types/product.type";
import { useUpdateProductMutation } from "@/services/productApi";
import { toast } from "sonner";
import { useGetAllCategoriesQuery } from "@/services/categoryApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

const editProductSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0").optional(),
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

interface EditProductDialogProps {
  product: ProductItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const { data: categoriesResponse } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.data.items || [];

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const isLiveFish = product?.productType === "LiveFish";

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        basePrice: product.basePrice || 0,
      });
    }
  }, [product, form]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditProductFormValues) => {
    if (!product) return;

    try {
      const updateRequest: UpdateProductRequest = {
        name: data.name,
        description: data.description,
        basePrice: isLiveFish ? undefined : data.basePrice,
        newImages: selectedImages,
      };

      await updateProduct({ id: product.id, data: updateRequest }).unwrap();
      toast.success("Cập nhật sản phẩm thành công");
      onOpenChange(false);
      form.reset();
      setSelectedImages([]);
      setPreviewUrls([]);
    } catch (error: any) {
      toast.error(error.data?.message || "Không thể cập nhật sản phẩm");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Chỉnh sửa sản phẩm</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết cho sản phẩm của bạn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên sản phẩm..."
                      {...field}
                      disabled={isLoading}
                      className="rounded-xl border-border/50 h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Danh mục</FormLabel>
              <div className="px-4 py-2.5 bg-muted/50 rounded-xl border border-border/50 text-muted-foreground font-medium">
                {product?.categoryName}
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Danh mục cố định để đảm bảo tính nhất quán của loại sản phẩm.
              </p>
            </div>

            {!isLiveFish && (
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán cơ bản (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        disabled={isLoading}
                        className="rounded-xl border-border/50 h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả sản phẩm</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả chi tiết sản phẩm..."
                      className="min-h-[120px] rounded-xl border-border/50 resize-none"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Thêm hình ảnh mới</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden border border-border/50 group"
                  >
                    <Image
                      src={url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive/80 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="border-2 border-dashed border-border/50 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
                  <ImagePlus className="h-8 w-8 mb-2" />
                  <span className="text-xs font-medium">Thêm ảnh</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="rounded-xl px-6 h-11"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl px-8 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
              >
                {isLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
