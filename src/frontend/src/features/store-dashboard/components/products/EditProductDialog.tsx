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
  ImagePlus,
  X,
  Lock,
  Loader2,
  Tag,
  FileText,
  Images,
  Settings2,
} from "lucide-react";
import Image from "next/image";
import { ProductAttributeForm } from "./ProductAttributeForm";

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

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  const isLiveFish = product?.productType === "LiveFish";

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: { name: "", description: "", basePrice: 0 },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        basePrice: product.basePrice || 0,
      });
      setCurrentImages(product.images || []);
      setRemovedImageUrls([]);
      setSelectedImages([]);
      setPreviewUrls([]);
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
    setPreviewUrls((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setRemovedImageUrls((prev) => [...prev, url]);
    setCurrentImages((prev) => prev.filter((img) => img !== url));
  };

  const onSubmit = async (data: EditProductFormValues) => {
    if (!product) return;
    try {
      await updateProduct({
        id: product.id,
        data: {
          name: data.name,
          description: data.description,
          basePrice: isLiveFish ? undefined : data.basePrice,
          newImages: selectedImages,
          removeImageUrls: removedImageUrls,
        },
      }).unwrap();
      toast.success("Cập nhật sản phẩm thành công");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.data?.message || "Không thể cập nhật sản phẩm");
    }
  };

  const totalImages = currentImages.length + selectedImages.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-border/40 shadow-2xl flex flex-col gap-0">
        <div className="px-6 pt-6 pb-5 border-b border-border/50 bg-muted/20 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
              Chỉnh sửa sản phẩm
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {product?.name && (
                <span className="font-medium text-foreground/70">
                  "{product.name}"
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Tên sản phẩm
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên sản phẩm..."
                        {...field}
                        disabled={isLoading}
                        className="rounded-xl border-border/50 bg-muted/30 h-10 px-3 text-sm font-medium focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Danh mục
                  </p>
                  <div className="flex items-center gap-2 h-10 px-3 bg-muted/50 rounded-xl border border-border/40 text-sm font-medium text-foreground/70">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="truncate">{product?.categoryName}</span>
                  </div>
                </div>

                {!isLiveFish && (
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Giá bán (VND)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            disabled={isLoading}
                            className="rounded-xl border-border/50 bg-muted/30 h-10 px-3 text-sm font-bold text-primary focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Mô tả */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <FileText className="h-3 w-3" /> Mô tả sản phẩm
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết sản phẩm của bạn..."
                        className="min-h-[100px] rounded-xl border-border/50 bg-muted/30 p-3 text-sm resize-none focus:ring-primary/20"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Images className="h-3 w-3" /> Hình ảnh sản phẩm
                  </p>
                  <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    {totalImages} ảnh
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                  {currentImages.map((url, index) => (
                    <div
                      key={`current-${index}`}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border/40 group bg-muted/20"
                    >
                      <Image
                        src={url}
                        alt="Current"
                        fill
                        className="object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Ảnh mới */}
                  {previewUrls.map((url, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/30 group bg-primary/5"
                    >
                      <Image
                        src={url}
                        alt="New Preview"
                        fill
                        className="object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-primary text-[9px] text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Mới
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  <label className="border-2 border-dashed border-border/50 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <ImagePlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                    <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wide">
                      Thêm
                    </span>
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

              {/* Compatibility Attributes Section */}
              {isLiveFish && product?.id && (
                <div className="pt-6 border-t border-border/50 space-y-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Thuộc tính chuyên sâu</h4>
                      <p className="text-[10px] text-muted-foreground">Các thuộc tính giúp hệ thống kiểm tra tính tương thích</p>
                    </div>
                  </div>
                  <ProductAttributeForm productId={product.id} />
                </div>
              )}
            </form>
          </Form>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-xl px-5 h-9 text-sm font-semibold hover:bg-muted text-muted-foreground"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
            className="rounded-xl px-6 h-9 text-sm font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
