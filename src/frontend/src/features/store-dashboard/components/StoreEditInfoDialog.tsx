"use client";

import React, { useEffect } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdateStoreInfoMutation } from "@/services/storeApi";
import { useToast } from "@/hooks/use-toast";
import { StoreResponse, UpdateStoreInfoRequest } from "@/types/store.type";

const formSchema = z.object({
  name: z.string().min(2, "Tên cửa hàng phải có ít nhất 2 ký tự"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  deliveryArea: z.string().optional(),
  description: z.string().optional(),
});

interface StoreEditInfoDialogProps {
  store: StoreResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StoreEditInfoDialog({
  store,
  open,
  onOpenChange,
}: StoreEditInfoDialogProps) {
  const { toast } = useToast();
  const [updateStoreInfo, { isLoading }] = useUpdateStoreInfoMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: store.name,
      phoneNumber: store.phoneNumber,
      address: store.address,
      deliveryArea: store.deliveryArea || "",
      description: store.description || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: store.name,
        phoneNumber: store.phoneNumber,
        address: store.address,
        deliveryArea: store.deliveryArea || "",
        description: store.description || "",
      });
    }
  }, [open, store, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateStoreInfo({
        id: store.id,
        request: values as UpdateStoreInfoRequest,
      }).unwrap();

      toast({
        title: "Thành công",
        description: "Thông tin cửa hàng đã được cập nhật.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật thông tin cửa hàng. Vui lòng thử lại.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin cửa hàng</DialogTitle>
          <DialogDescription>
            Cập nhật các thông tin cơ bản của cửa hàng bạn tại đây. Nhấn lưu khi
            hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên cửa hàng</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khu vực giao hàng</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả cửa hàng</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Giới thiệu về cửa hàng của bạn..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
