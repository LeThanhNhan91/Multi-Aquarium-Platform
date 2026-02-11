"use client";

import React from "react";

import { useState } from "react";
import { X, ChevronDown, Fish, Zap, Leaf, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/utils";

export interface FilterState {
  priceRange: [number, number];
  selectedRatings: number[];
  selectedCategories: string[];
}

interface FiltersSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface CategoryGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: Array<{ id: string; label: string }>;
}

const categoryGroups: CategoryGroup[] = [
  {
    id: "fish",
    label: "Cá",
    icon: <Fish className="h-4 w-4" />,
    children: [
      { id: "tropical-fish", label: "Cá Nhiệt Đới" },
      { id: "koi", label: "Cá Koi" },
      { id: "planted-tank", label: "Cá Để Bể Cây" },
    ],
  },
  {
    id: "equipment",
    label: "Thiết Bị",
    icon: <Droplet className="h-4 w-4" />,
    children: [
      { id: "aquariums", label: "Bể Cá" },
      { id: "filters", label: "Lọc Nước" },
      { id: "co2-systems", label: "Hệ Thống CO2" },
    ],
  },
  {
    id: "supplies",
    label: "Phụ Kiện",
    icon: <Leaf className="h-4 w-4" />,
    children: [
      { id: "decorations", label: "Trang Trí" },
      { id: "lighting", label: "Đèn LED" },
      { id: "food-supplements", label: "Thức Ăn & Bổ Sung" },
    ],
  },
];

const ratings = [{ value: 5 }, { value: 4 }, { value: 3 }];

export function FiltersSidebar({
  filters,
  onFiltersChange,
  onReset,
  isOpen = true,
  onClose,
}: FiltersSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "fish",
    "equipment",
  ]);

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    const newRatings = checked
      ? [...filters.selectedRatings, rating]
      : filters.selectedRatings.filter((r) => r !== rating);
    onFiltersChange({
      ...filters,
      selectedRatings: newRatings,
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.selectedCategories, categoryId]
      : filters.selectedCategories.filter((c) => c !== categoryId);
    onFiltersChange({
      ...filters,
      selectedCategories: newCategories,
    });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const hasActiveFilters =
    filters.selectedRatings.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000000;

  return (
    <Card
      className={cn(
        "h-fit rounded-2xl border-border/50 bg-linear-to-b from-card to-card/80 p-6 sticky top-24 shadow-lg",
        !isOpen && "hidden md:block",
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 rounded-full bg-linear-to-b from-primary to-accent" />
          <h3 className="text-lg font-bold font-serif text-foreground">
            Bộ Lọc
          </h3>
        </div>
        {isOpen && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4 mb-8">
        <div>
          <Label className="text-sm font-bold text-foreground">
            Khoảng Giá
          </Label>
          <div className="mt-3 p-3 bg-secondary/40 rounded-lg flex">
            <p className="text-xs font-semibold text-primary mr-1">
              {filters.priceRange[0].toLocaleString()}đ
            </p>
            <p className="text-xs font-semibold text-primary">
              - {filters.priceRange[1].toLocaleString()}đ
            </p>
          </div>
        </div>
        <Slider
          min={0}
          max={10000000}
          step={100000}
          value={filters.priceRange}
          onValueChange={handlePriceChange}
          className="w-full"
        />
      </div>

      <Separator className="mb-8 bg-border/40" />

      {/* Rating Filter */}
      <div className="space-y-4 mb-8">
        <h4 className="text-sm font-bold text-foreground">Đánh Giá</h4>
        <div className="space-y-3">
          {ratings.map((rating) => (
            <div
              key={rating.value}
              className="group flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <Checkbox
                id={`rating-${rating.value}`}
                checked={filters.selectedRatings.includes(rating.value)}
                onCheckedChange={(checked) =>
                  handleRatingChange(rating.value, checked as boolean)
                }
              />
              <Label
                htmlFor={`rating-${rating.value}`}
                className="text-sm font-medium cursor-pointer flex-1 flex items-center gap-2"
              >
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-xl",
                      i < rating.value
                        ? "text-amber-400"
                        : "text-muted-foreground/30",
                    )}
                  >
                    ★
                  </span>
                ))}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-8 bg-border/40" />

      {/* Hierarchical Category Filter */}
      <div className="space-y-2 mb-8">
        <h4 className="text-sm font-bold text-foreground px-2 mb-4">
          Danh Mục
        </h4>
        <div className="space-y-2">
          {categoryGroups.map((group) => (
            <div key={group.id}>
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors text-primary">
                    {group.icon}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {group.label}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    expandedGroups.includes(group.id) && "rotate-180",
                  )}
                />
              </button>

              {expandedGroups.includes(group.id) && (
                <div className="ml-2 mt-2 space-y-2 border-l-2 border-primary/20 pl-3">
                  {group.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <Checkbox
                        id={`category-${child.id}`}
                        checked={filters.selectedCategories.includes(child.id)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(child.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`category-${child.id}`}
                        className="text-sm font-medium cursor-pointer text-foreground/80"
                      >
                        {child.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          className="w-full bg-linear-to-b from-primary to-accent hover:shadow-lg transition-shadow text-primary-foreground font-semibold rounded-lg"
          onClick={onReset}
        >
          Xoá Tất Cả Bộ Lọc
        </Button>
      )}
    </Card>
  );
}
