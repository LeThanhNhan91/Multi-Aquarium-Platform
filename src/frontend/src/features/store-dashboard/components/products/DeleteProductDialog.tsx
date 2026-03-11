"use client";

import React from "react";
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
import { useDeleteProductMutation } from "@/services/productApi";
import { toast } from "sonner";
import { ProductItem } from "@/types/product.type";
import { AquariumLoader } from "@/components/shared/AquariumLoader";

interface DeleteProductDialogProps {
  product: ProductItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
}: DeleteProductDialogProps) {
  const [deleteProduct, { isLoading }] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct(product.id).unwrap();
      toast.success("Xóa sản phẩm thành công");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.data?.message || "Không thể xóa sản phẩm");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa sản phẩm?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa sản phẩm{" "}
            <span className="font-bold text-foreground">"{product?.name}"</span>?
            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-border/50">
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Đang xóa..." : "Xác nhận xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
