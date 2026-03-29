"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Info, Thermometer, Droplets, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  useGetAttributesQuery,
  useUpsertAttributesMutation,
} from "@/services/productAttributeApi";
import { toast } from "sonner";
import { AttributeInput } from "@/types/product.type";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProductAttributeFormProps {
  productId: string;
}

const ATTRIBUTE_KEYS = [
  { key: "WaterType", label: "Môi trường nước", icon: Droplets },
  { key: "Temperament", label: "Tính cách", icon: Zap },
  { key: "MinTemp", label: "Nhiệt độ tối thiểu (°C)", icon: Thermometer },
  { key: "MaxTemp", label: "Nhiệt độ tối đa (°C)", icon: Thermometer },
];

const WATER_TYPES = ["Freshwater", "Saltwater", "Brackish"];
const TEMPERAMENTS = ["Peaceful", "Semi-Aggressive", "Aggressive", "Predator"];

const WATER_TYPE_LABELS: Record<string, string> = {
  Freshwater: "Nước ngọt",
  Saltwater: "Nước mặn",
  Brackish: "Nước lợ",
};

const TEMPERAMENT_LABELS: Record<string, string> = {
  Peaceful: "Hiền lành",
  "Semi-Aggressive": "Bán dữ",
  Aggressive: "Hung dữ",
  Predator: "Săn mồi",
};

export function ProductAttributeForm({ productId }: ProductAttributeFormProps) {
  const { data: response, isLoading } = useGetAttributesQuery(productId);
  const [upsertAttributes, { isLoading: isUpdating }] =
    useUpsertAttributesMutation();

  const [attributes, setAttributes] = useState<AttributeInput[]>([]);

  useEffect(() => {
    if (response?.data) {
      setAttributes(
        response.data.map((a) => ({
          attributeKey: a.attributeKey,
          attributeValue: a.attributeValue,
        }))
      );
    }
  }, [response]);

  const handleAddAttribute = () => {
    setAttributes([...attributes, { attributeKey: "", attributeValue: "" }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleUpdateAttribute = (
    index: number,
    field: keyof AttributeInput,
    value: string
  ) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  };

  const handleSave = async () => {
    // Filter out empty ones
    const activeAttrs = attributes.filter(
      (a) => a.attributeKey.trim() !== "" && a.attributeValue.trim() !== ""
    );

    try {
      await upsertAttributes({
        productId,
        attributes: activeAttrs,
      }).unwrap();
      toast.success("Cập nhật thuộc tính thành công");
    } catch (error: any) {
      toast.error(error.data?.message || "Không thể cập nhật thuộc tính");
    }
  };

  if (isLoading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-sm font-bold text-primary">Thông tin tương thích</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          Cung cấp thông tin chính xác giúp người mua biết được các loài cá có thể sống chung với nhau hay không.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {attributes.map((attr, index) => {
          const attrDef = ATTRIBUTE_KEYS.find((k) => k.key === attr.attributeKey);
          const Icon = attrDef?.icon || Droplets;

          return (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50 relative group transition-all hover:bg-muted/50"
            >
              <div className="flex-1 space-y-3">
                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Loại thuộc tính
                  </Label>
                  <Select
                    value={attr.attributeKey}
                    onValueChange={(val) =>
                      handleUpdateAttribute(index, "attributeKey", val)
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-background border-border/40 focus:ring-primary/20">
                      <SelectValue placeholder="Chọn thuộc tính..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTRIBUTE_KEYS.map((k) => (
                        <SelectItem key={k.key} value={k.key}>
                          <div className="flex items-center gap-2">
                             <k.icon className="h-3.5 w-3.5" />
                             <span>{k.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                   <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Giá trị
                  </Label>
                  {attr.attributeKey === "WaterType" ? (
                    <Select
                      value={attr.attributeValue}
                      onValueChange={(val) =>
                        handleUpdateAttribute(index, "attributeValue", val)
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-background border-border/40 focus:ring-primary/20">
                        <SelectValue placeholder="Chọn môi trường..." />
                      </SelectTrigger>
                      <SelectContent>
                        {WATER_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {WATER_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : attr.attributeKey === "Temperament" ? (
                    <Select
                      value={attr.attributeValue}
                      onValueChange={(val) =>
                        handleUpdateAttribute(index, "attributeValue", val)
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-background border-border/40 focus:ring-primary/20">
                        <SelectValue placeholder="Chọn tính cách..." />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPERAMENTS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TEMPERAMENT_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="number"
                      placeholder="VD: 25"
                      value={attr.attributeValue}
                      onChange={(e) =>
                        handleUpdateAttribute(index, "attributeValue", e.target.value)
                      }
                      className="h-10 rounded-xl bg-background border-border/40 focus:ring-primary/20"
                    />
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col justify-end pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddAttribute}
          className="w-full h-12 border-dashed border-2 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all text-muted-foreground hover:text-primary font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm thuộc tính
        </Button>
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="rounded-xl px-8 h-10 font-bold bg-primary hover:shadow-lg transition-all"
        >
          {isUpdating ? "Đang lưu..." : "Lưu thuộc tính"}
        </Button>
      </div>
    </div>
  );
}
