"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  UploadCloud,
  X,
  Fish,
  Loader2,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import {
  useGetFishInstancesQuery,
  useCreateFishInstanceMutation,
  useUpdateFishInstanceMutation,
  useDeleteFishInstanceMutation,
} from "@/services/fishInstanceApi";
import { FishInstance } from "@/types/product.type";
import { formatToVND, formatVietnameseDate } from "@/helper/formatter";
import { cn } from "@/utils/utils";
import { toast } from "sonner";


const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  Available: {
    label: "Còn hàng",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  Sold: {
    label: "Đã bán",
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
  Reserved: {
    label: "Đã đặt",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  OnHold: {
    label: "Tạm giữ",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

const GENDER_OPTIONS = [
  { value: "Male", label: "Đực" },
  { value: "Female", label: "Cái" },
  { value: "Unknown", label: "Chưa xác định" },
];


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

interface FishFormProps {
  productId: string;
  editTarget?: FishInstance;
  onBack: () => void;
}

function FishForm({ productId, editTarget, onBack }: FishFormProps) {
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
    <div className="flex flex-col h-full mx-2">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-xl hover:bg-muted"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h3 className="font-semibold text-foreground">
          {isEdit ? "Chỉnh sửa cá cảnh" : "Thêm cá cảnh mới"}
        </h3>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1"
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
                      <img
                        src={p.url}
                        alt=""
                        className="h-full w-full object-cover"
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


interface FishCardProps {
  fish: FishInstance;
  onEdit: (fish: FishInstance) => void;
  onDelete: (fish: FishInstance) => void;
}

function FishCard({ fish, onEdit, onDelete }: FishCardProps) {
  const statusCfg = STATUS_CONFIG[fish.status] ?? {
    label: fish.status,
    className: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <div className="flex gap-3 rounded-2xl border border-border/50 bg-card p-3 hover:shadow-sm transition-shadow">
      {/* Image */}
      <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/40">
        {fish.images?.[0] ? (
          <img
            src={fish.images[0]}
            alt={`Cá #${fish.id.slice(0, 6)}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-bold text-primary">
              {formatToVND(fish.price)}
            </p>
            <Badge
              variant="outline"
              className={cn("text-xs border px-2 py-0", statusCfg.className)}
            >
              {statusCfg.label}
            </Badge>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit(fish)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(fish)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span>
            Kích thước: <span className="text-foreground font-medium">{fish.size}</span>
          </span>
          {fish.color && (
            <span>
              Màu: <span className="text-foreground font-medium">{fish.color}</span>
            </span>
          )}
          {fish.gender && fish.gender !== "Unknown" && (
            <span>
              Giới tính:{" "}
              <span className="text-foreground font-medium">
                {fish.gender === "Male" ? "Đực" : "Cái"}
              </span>
            </span>
          )}
        </div>

        {fish.features && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {fish.features}
          </p>
        )}

        {fish.videoUrl && (
          <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
            <Video className="h-3 w-3" /> Có video
          </span>
        )}

        <p className="mt-1 text-xs text-muted-foreground/60">
          Thêm {formatVietnameseDate(fish.createdAt)}
        </p>
      </div>
    </div>
  );
}

interface FishInstancesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function FishInstancesDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: FishInstancesDialogProps) {
  const [view, setView] = useState<"list" | "form">("list");
  const [editTarget, setEditTarget] = useState<FishInstance | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<FishInstance | undefined>();

  const { data: fishInstances = [], isLoading } = useGetFishInstancesQuery(
    productId,
    { skip: !open || !productId },
  );

  const [deleteFishInstance, { isLoading: isDeleting }] =
    useDeleteFishInstanceMutation();

  const handleAddNew = () => {
    setEditTarget(undefined);
    setView("form");
  };

  const handleEdit = (fish: FishInstance) => {
    setEditTarget(fish);
    setView("form");
  };

  const handleFormBack = () => {
    setEditTarget(undefined);
    setView("list");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFishInstance({
        productId,
        fishInstanceId: deleteTarget.id,
      }).unwrap();
      toast.success("Đã xóa cá cảnh!");
    } catch {
      toast.error("Không thể xóa. Vui lòng thử lại.");
    } finally {
      setDeleteTarget(undefined);
    }
  };

  const availableCount = fishInstances.filter(
    (f) => f.status === "Available",
  ).length;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setView("list");
            setEditTarget(undefined);
          }
          onOpenChange(v);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col rounded-2xl">
          <DialogHeader className="shrink-0">
            <div className="flex items-center justify-between gap-4 mt-4">
              <div className="min-w-0">
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Fish className="h-5 w-5 text-primary shrink-0" />
                  <span className="truncate">{productName}</span>
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {fishInstances.length} con · {availableCount} còn hàng
                </p>
              </div>
              {view === "list" && (
                <Button
                  size="sm"
                  className="shrink-0 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleAddNew}
                >
                  <Plus className="h-4 w-4" />
                  Thêm cá
                </Button>
              )}
            </div>
          </DialogHeader>

          <Separator />

          <div className="flex-1 overflow-y-auto min-h-0 py-2">
            {view === "form" ? (
              <FishForm
                productId={productId}
                editTarget={editTarget}
                onBack={handleFormBack}
              />
            ) : isLoading ? (
              <div className="flex flex-col gap-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-2xl border border-border/50 p-3"
                  >
                    <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : fishInstances.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Fish className="h-12 w-12 text-muted-foreground/30" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Chưa có cá cảnh nào
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nhấn "Thêm cá" để bắt đầu thêm từng con cá vào sản phẩm
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-2 rounded-xl bg-primary text-primary-foreground"
                  onClick={handleAddNew}
                >
                  <Plus className="h-4 w-4" />
                  Thêm cá đầu tiên
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 py-1">
                {fishInstances.map((fish) => (
                  <FishCard
                    key={fish.id}
                    fish={fish}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(undefined)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cá cảnh?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Con cá sẽ bị xóa vĩnh viễn
              cùng toàn bộ ảnh/video liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
