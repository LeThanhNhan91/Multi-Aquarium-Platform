"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateProductMutation } from "@/services/productApi";
import { useGetTreeCategoriesQuery } from "@/services/categoryApi";
import { CategoryTreeResponse } from "@/types/category.type";
import { CreateProductRequest } from "@/types/product.type";
import { useToast } from "@/hooks/use-toast";
import { getSlugPrefix } from "@/helper/formatter";
import {
  Loader2,
  UploadCloud,
  X,
  Check,
  ChevronsUpDown,
  Tag,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/utils/utils";

// Schema matching CreateProductRequest.cs
const createProductSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0").optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  images: z.any().optional(), // Handled manually for FileList
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  storeId,
}: CreateProductDialogProps) {
  const { toast } = useToast();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetTreeCategoriesQuery({});

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Custom Category Selection State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);

  // Trace navigation: [Root, Sub, Sub-Sub]
  const [selectionTrace, setSelectionTrace] = useState<CategoryTreeResponse[]>(
    [],
  );

  // Current level nodes to display
  const currentLevelNodes = useMemo(() => {
    if (!categoriesResponse?.data) return [];
    if (selectionTrace.length === 0) return categoriesResponse.data;
    return selectionTrace[selectionTrace.length - 1].children || [];
  }, [categoriesResponse, selectionTrace]);

  const handleDrillDown = (node: CategoryTreeResponse) => {
    if (node.children && node.children.length > 0) {
      setSelectionTrace([...selectionTrace, node]);
    } else {
      handleCategorySelect(node.id, node.name); // Final selection
      setOpenCombobox(false);
    }
  };

  const handleGoBack = () => {
    setSelectionTrace(selectionTrace.slice(0, -1));
  };

  const leafCategories = useMemo(() => {
    const list: {
      id: string;
      name: string;
      path: string;
      rootName: string;
      breadcrumb: string;
      isLiveFish: boolean;
      slug: string;
    }[] = [];

    const traverse = (
      nodes: CategoryTreeResponse[],
      path = "",
      rootName = "",
      isLiveFish = false,
    ) => {
      nodes.forEach((node) => {
        const currentPath = path ? `${path} > ${node.name}` : node.name;
        const currentRootName = rootName || node.name;
        // Inherit isLiveFish or detect from root slug (robust check)
        const currentIsLiveFish =
          isLiveFish ||
          node.slug === "ca-canh" ||
          node.slug.startsWith("ca-canh-");

        if (!node.children || node.children.length === 0) {
          const breadcrumb = path;
          list.push({
            id: node.id,
            name: node.name,
            path: currentPath,
            rootName: currentRootName,
            breadcrumb,
            isLiveFish: currentIsLiveFish,
            slug: node.slug,
          });
        } else {
          traverse(
            node.children,
            currentPath,
            currentRootName,
            currentIsLiveFish,
          );
        }
      });
    };

    if (categoriesResponse?.data) {
      traverse(categoriesResponse.data);
    }
    return list;
  }, [categoriesResponse]);

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      categoryId: "",
    },
  });

  // Access category info for conditional UI
  const categoryId = form.watch("categoryId");
  const selectedCategory = useMemo(
    () => leafCategories.find((c) => c.id === categoryId),
    [categoryId, leafCategories],
  );
  const isLiveFish = selectedCategory?.isLiveFish ?? false;

  // Debug log to verify detection
  useEffect(() => {
    if (categoryId) {
      console.log("Category Change:", {
        categoryId,
        name: selectedCategory?.name,
        isLiveFish,
        slug: selectedCategory?.slug,
      });
    }
  }, [categoryId, isLiveFish, selectedCategory]);

  // Reset basePrice when selecting a Live Fish category
  useEffect(() => {
    if (isLiveFish) {
      form.setValue("basePrice", undefined);
    }
  }, [isLiveFish, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const combinedFiles = [...selectedImages, ...filesArray].slice(0, 5); // Limit 5
      setSelectedImages(combinedFiles);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviews].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);

    const newPreviews = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviews[index]); // Free memory
    newPreviews.splice(index, 1);
    setImagePreviewUrls(newPreviews);
  };

  const handleCategorySelect = (id: string, name: string) => {
    setSelectedCategoryId(id);
    setSelectedCategoryName(name);
    form.setValue("categoryId", id, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateProductFormValues) => {
    try {
      const request: CreateProductRequest = {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description,
        // Exclude basePrice if it's Live Fish
        basePrice: isLiveFish ? undefined : data.basePrice,
        images: selectedImages,
      };

      await createProduct(request).unwrap();
      toast({
        title: "Thành công",
        description: "Tạo sản phẩm thành công!",
      });
      resetFormAndClose();
    } catch (error: any) {
      console.error("Create product error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.Message || "Đã xảy ra lỗi khi tạo sản phẩm.",
      });
    }
  };

  const resetFormAndClose = () => {
    form.reset();
    setSelectedImages([]);
    imagePreviewUrls.forEach(URL.revokeObjectURL);
    setImagePreviewUrls([]);
    setSelectedCategoryId("");
    setSelectedCategoryName("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetFormAndClose();
        else onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho sản phẩm.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên sản phẩm..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Danh mục (Bắt buộc chọn cấp cuối) *</FormLabel>
                  <Popover
                    open={openCombobox}
                    onOpenChange={(val) => {
                      setOpenCombobox(val);
                      if (!val) setSelectionTrace([]); // Reset trace on close
                    }}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className={cn(
                            "w-full justify-between font-normal h-12 rounded-xl border-border/60 bg-background/50 backdrop-blur-sm transition-all hover:bg-muted/50 hover:border-primary/30 active:scale-[0.98] shadow-sm",
                            !selectedCategoryId && "text-muted-foreground",
                            selectedCategoryId &&
                              "border-primary/20 bg-primary/5",
                          )}
                          disabled={isLoading || isLoadingCategories}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Tag className="h-4 w-4 text-primary/60 shrink-0" />
                            <span className="truncate">
                              {selectedCategoryName || "Chọn danh mục..."}
                            </span>
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0 rounded-2xl shadow-2xl border-primary/10 overflow-hidden"
                      align="start"
                    >
                      <Command className="bg-background">
                        <div className="p-3 border-b border-border/50 bg-muted/20">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border/50 shadow-inner">
                            <CommandInput
                              placeholder="Tìm kiếm danh mục..."
                              className="border-none focus:ring-0 h-8 p-0"
                            />
                          </div>
                        </div>

                        <CommandList className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin">
                          <CommandEmpty className="py-6 text-center text-muted-foreground">
                            Không tìm thấy kết quả.
                          </CommandEmpty>

                          {/* Navigation Header */}
                          {selectionTrace.length > 0 && (
                            <div className="px-2 pb-2 mb-2 border-b border-border/50">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleGoBack();
                                }}
                                className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors p-1 rounded-md hover:bg-primary/5 w-full text-left"
                              >
                                <ChevronLeft className="h-3 w-3" />
                                Quay lại
                              </button>
                              <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground px-1 uppercase tracking-wider font-bold">
                                Root
                                {selectionTrace.map((node, i) => (
                                  <React.Fragment key={node.id}>
                                    <ChevronRight className="h-2 w-2 opacity-50" />
                                    <span
                                      className={
                                        i === selectionTrace.length - 1
                                          ? "text-primary"
                                          : ""
                                      }
                                    >
                                      {node.name}
                                    </span>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}

                          <CommandGroup
                            heading={
                              selectionTrace.length === 0
                                ? "Danh mục gốc"
                                : "Danh mục con"
                            }
                          >
                            {currentLevelNodes.map((node) => {
                              const hasChildren =
                                node.children && node.children.length > 0;
                              return (
                                <CommandItem
                                  key={node.id}
                                  value={node.name}
                                  onSelect={() => handleDrillDown(node)}
                                  className="flex items-center justify-between py-3 px-3 rounded-xl cursor-pointer aria-selected:bg-primary/5 transition-colors group mb-1"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        hasChildren
                                          ? "bg-muted-foreground/30"
                                          : "bg-primary",
                                      )}
                                    />
                                    <span
                                      className={cn(
                                        "font-medium text-foreground group-hover:text-primary transition-colors",
                                        !hasChildren && "font-bold",
                                      )}
                                    >
                                      {node.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {hasChildren ? (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                    ) : (
                                      <Check
                                        className={cn(
                                          "h-4 w-4 text-primary transition-all",
                                          selectedCategoryId === node.id
                                            ? "opacity-100 scale-110"
                                            : "opacity-0 scale-50",
                                        )}
                                      />
                                    )}
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {isLiveFish && (
                      <span className="text-primary font-medium">
                        Cá cảnh sẽ được tính giá theo từng con.
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isLiveFish && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Nhập 0 nếu đây là Cá Cảnh (giá tính theo từng cá thể).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Viết mô tả về sản phẩm..."
                      className="resize-none min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Hình ảnh sản phẩm (Tối đa 5 ảnh)</FormLabel>
              <div className="flex flex-wrap gap-4 mt-2">
                {imagePreviewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/50 group"
                  >
                    <Image
                      src={url}
                      alt={`Preview ${index}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}

                {selectedImages.length < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-colors">
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            </FormItem>

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={resetFormAndClose}
                disabled={isLoading}
                className="rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !selectedCategoryId}
                className="rounded-xl px-8 shadow-md"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo sản phẩm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
