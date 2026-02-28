"use client";

import React, { useMemo } from "react";

import { useState } from "react";
import {
  X,
  ChevronDown,
  Fish,
  Leaf,
  Waves,
  LucideIcon,
  FlaskConical,
  Lamp,
  Shell,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/utils";
import { useGetTreeCategoriesQuery } from "@/services/categoryApi";
import { getSlugPrefix } from "@/helper/formatter";
import { CategoryNodeProps, EnhancedCategoryTree } from "@/types/category.type";
import { CategoryTreeResponse } from "@/types/category.type";

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

const categoryStyles: Record<string, { icon: LucideIcon; color: string }> = {
  "ca-canh": {
    icon: Fish,
    color: "bg-primary/10 text-primary",
  },
  "ho-ca": {
    icon: Waves,
    color: "bg-accent/10 text-accent",
  },
  "dung-dich-xu-ly": {
    icon: FlaskConical,
    color: "bg-primary/10 text-primary",
  },
  "dung-cu-va-vat-lieu-loc": {
    icon: Lamp,
    color: "bg-accent/10 text-accent",
  },
  "do-trang-tri": {
    icon: Shell,
    color: "bg-primary/10 text-primary",
  },
  "cay-thuy-sinh-lua": {
    icon: Leaf,
    color: "bg-accent/10 text-accent",
  },
};

function CategoryNode({
  node,
  depth,
  icon: Icon,
  selectedCategories,
  expandedGroups,
  onToggle,
  onCheck,
}: CategoryNodeProps) {
  const isLeaf = node.children.length === 0;
  const isExpanded = expandedGroups.includes(node.id);
  const indent = depth * 12; // px indentation per level

  if (isLeaf) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/30 transition-colors"
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        <Checkbox
          id={`category-${node.id}`}
          checked={selectedCategories.includes(node.id)}
          onCheckedChange={(checked) => onCheck(node.id, checked as boolean)}
        />
        <Label
          htmlFor={`category-${node.id}`}
          className="flex items-center gap-2 text-sm cursor-pointer text-foreground/80 font-medium"
        >
          {Icon && depth === 0 && (
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          {node.name}
        </Label>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors"
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        <Checkbox
          id={`category-${node.id}`}
          checked={selectedCategories.includes(node.id)}
          onCheckedChange={(checked) => onCheck(node.id, checked as boolean)}
        />

        <button
          onClick={() => onToggle(node.id)}
          className="flex-1 flex items-center justify-between group"
        >
          <Label
            htmlFor={`category-${node.id}`}
            className={cn(
              "flex items-center gap-2 cursor-pointer font-semibold pointer-events-none",
              depth === 0
                ? "text-sm text-foreground"
                : "text-xs text-foreground/80",
            )}
          >
            {Icon && depth === 0 && (
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors text-primary">
                <Icon className="h-4 w-4" />
              </div>
            )}
            {node.name}
          </Label>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
              isExpanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="ml-2 mt-1 space-y-1 border-l-2 border-primary/20 pl-3">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedCategories={selectedCategories}
              expandedGroups={expandedGroups}
              onToggle={onToggle}
              onCheck={onCheck}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FiltersSidebar({
  filters,
  onFiltersChange,
  onReset,
  isOpen = true,
  onClose,
}: FiltersSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const { data: categoriesTree, isLoading } = useGetTreeCategoriesQuery({
    pageIndex: 1,
    pageSize: 10,
  });

  const enhancedCategoryTree = useMemo(() => {
    if (!categoriesTree?.data) return [];

    return categoriesTree.data.map((cat) => {
      const slugPrefix = getSlugPrefix(cat.slug);

      const styles = categoryStyles[slugPrefix] || {
        icon: Fish,
        color: "bg-primary/10 text-primary",
      };

      return {
        ...cat,
        icon: styles.icon,
        color: styles.color,
      } as EnhancedCategoryTree;
    });
  }, [categoriesTree]);

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const selectedRating =
    filters.selectedRatings.length > 0 ? filters.selectedRatings[0] : 0;

  const handleRatingChange = (rating: number) => {
    // Toggle: clicking the same star deselects
    const newRating = selectedRating === rating ? 0 : rating;
    onFiltersChange({
      ...filters,
      selectedRatings: newRating > 0 ? [newRating] : [],
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

  if (isLoading) return <Loader />;

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
          <h3 className="text-lg font-bold  text-foreground">
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
        <div className="flex items-center gap-1 px-2 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className="transition-transform hover:scale-125 focus:outline-none"
              aria-label={`Lọc ${star} sao`}
            >
              <span
                className={cn(
                  "text-2xl leading-none transition-colors duration-150",
                  star <= selectedRating
                    ? "text-amber-400"
                    : "text-muted-foreground/30 hover:text-amber-300",
                )}
              >
                ★
              </span>
            </button>
          ))}
          {selectedRating > 0 && (
            <span className="ml-2 text-xs text-muted-foreground font-semibold">
              &gt;= {selectedRating}
            </span>
          )}
        </div>
      </div>

      <Separator className="mb-8 bg-border/40" />

      {/* Hierarchical Category Filter */}
      <div className="space-y-2 mb-8">
        <h4 className="text-sm font-bold text-foreground px-2 mb-4">
          Danh Mục
        </h4>
        <div className="space-y-1">
          {enhancedCategoryTree.map((group) => (
            <CategoryNode
              key={group.id}
              node={group}
              depth={0}
              icon={group.icon}
              selectedCategories={filters.selectedCategories}
              expandedGroups={expandedGroups}
              onToggle={toggleGroup}
              onCheck={handleCategoryChange}
            />
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
