"use client";

import React, { useState } from "react";
import Image from "next/image";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ArrowLeft,
  Fish,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  useGetFishInstancesQuery,
  useDeleteFishInstanceMutation,
} from "@/services/fishInstanceApi";
import { useGetProductByIdQuery } from "@/services/productApi";
import { FishInstance } from "@/types/product.type";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FishForm } from "./FishForm";
import { FishThumbnailCard } from "./FishThumbnailCard";
import { ViewDetailDialog } from "./ViewDetailDialog";

interface FishInstancesProps {
  storeId: string;
  productId: string;
}

export default function FishInstances({
  storeId,
  productId,
}: FishInstancesProps) {
  const router = useRouter();

  // View state
  const [view, setView] = useState<"list" | "form">("list");
  const [editTarget, setEditTarget] = useState<FishInstance | undefined>();
  const [viewTarget, setViewTarget] = useState<FishInstance | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<FishInstance | undefined>();

  const { data: productResponse, isLoading: isProductLoading } =
    useGetProductByIdQuery(productId);
  const product = productResponse?.data;

  const { data: fishInstances = [], isLoading: isFishLoading } =
    useGetFishInstancesQuery(productId, { skip: !productId });

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
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-xl hover:bg-muted shrink-0"
          onClick={() =>
            router.push(`/dashboard/stores/${storeId}?tab=products`)
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />

        {isProductLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : product ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 relative rounded-xl overflow-hidden bg-muted border border-border/50 shrink-0">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Fish className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">
                {product.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {fishInstances.length} con · {availableCount} còn hàng
              </p>
            </div>
          </div>
        ) : null}

        {view === "list" && (
          <Button
            size="sm"
            className="ml-auto shrink-0 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4" />
            Thêm cá
          </Button>
        )}
      </div>

      <Separator className="mb-6" />

      {view === "form" ? (
        <div className="max-w-2xl">
          <FishForm
            productId={productId}
            editTarget={editTarget}
            onBack={handleFormBack}
          />
        </div>
      ) : isFishLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-border/50"
            >
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : fishInstances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
            <Fish className="h-12 w-12 text-primary/30" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">
              Chưa có cá cảnh nào
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Nhấn &quot;Thêm cá&quot; để bắt đầu thêm từng con cá vào sản phẩm
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-in fade-in duration-300">
          {fishInstances.map((fish) => (
            <FishThumbnailCard
              key={fish.id}
              fish={fish}
              onView={setViewTarget}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {viewTarget && (
        <ViewDetailDialog
          fish={viewTarget}
          open={!!viewTarget}
          onClose={() => setViewTarget(undefined)}
          onDelete={setDeleteTarget}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(undefined)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cá cảnh?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Con cá sẽ bị xóa vĩnh viễn cùng
              toàn bộ ảnh/video liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
