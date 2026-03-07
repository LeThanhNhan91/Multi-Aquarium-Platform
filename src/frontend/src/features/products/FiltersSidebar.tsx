"use client";

import React, { useMemo, useRef, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/utils";
import { useGetTreeCategoriesQuery } from "@/services/categoryApi";
import { getSlugPrefix } from "@/helper/formatter";
import { CategoryNodeProps, EnhancedCategoryTree } from "@/types/category.type";

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
  "ca-canh": { icon: Fish, color: "bg-primary/10 text-primary" },
  "ho-ca": { icon: Waves, color: "bg-accent/10 text-accent" },
  "dung-dich-xu-ly": {
    icon: FlaskConical,
    color: "bg-primary/10 text-primary",
  },
  "dung-cu-va-vat-lieu-loc": { icon: Lamp, color: "bg-accent/10 text-accent" },
  "do-trang-tri": { icon: Shell, color: "bg-primary/10 text-primary" },
  "cay-thuy-sinh-lua": { icon: Leaf, color: "bg-accent/10 text-accent" },
};

type TreeNode = { id: string; children: TreeNode[] };

function getLeafIds(node: TreeNode): string[] {
  if (node.children.length === 0) return [node.id];
  return node.children.flatMap(getLeafIds);
}

function getAllDescendantIds(node: TreeNode): string[] {
  return node.children.flatMap((c) => [c.id, ...getAllDescendantIds(c)]);
}

function findNode(forest: TreeNode[], id: string): TreeNode | null {
  for (const node of forest) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

function getAncestorIds(forest: TreeNode[], targetId: string): string[] {
  const result: string[] = [];
  const dfs = (nodes: TreeNode[], path: string[]): boolean => {
    for (const node of nodes) {
      if (node.id === targetId) {
        result.push(...path);
        return true;
      }
      if (dfs(node.children, [...path, node.id])) return true;
    }
    return false;
  };
  dfs(forest, []);
  return result;
}

type CheckState = "checked" | "unchecked" | "indeterminate";

function getCheckState(node: TreeNode, selected: Set<string>): CheckState {
  const leaves = getLeafIds(node);
  if (leaves.length === 0)
    return selected.has(node.id) ? "checked" : "unchecked";
  const checkedCount = leaves.filter((id) => selected.has(id)).length;
  if (checkedCount === 0) return "unchecked";
  if (checkedCount === leaves.length) return "checked";
  return "indeterminate";
}

/**
 * Check a node:
 *   - Add all its leaf descendants to selection
 *   - If it IS a leaf, add itself
 *   - Remove all ancestor intermediate nodes (they were tracked as "selected"
 *     only when fully checked — we recompute via getCheckState so we never
 *     store non-leaf nodes; instead we only ever store leaf ids)
 *
 * Uncheck a node:
 *   - Remove all its leaf descendants (and itself if leaf)
 *
 * This "leaves-only" storage strategy means:
 *   - `selectedCategories` only ever contains leaf ids
 *   - Parent state (checked/indeterminate/unchecked) is derived on render
 *   - API receives only leaf ids, which is what the backend expects
 */
function computeNewSelection(
  forest: TreeNode[],
  nodeId: string,
  checked: boolean,
  currentSelected: string[],
): string[] {
  const node = findNode(forest, nodeId);
  if (!node) return currentSelected;

  const leaves = getLeafIds(node);
  const selectedSet = new Set(currentSelected);

  if (checked) {
    leaves.forEach((id) => selectedSet.add(id));
  } else {
    leaves.forEach((id) => selectedSet.delete(id));
  }

  return Array.from(selectedSet);
}

interface IndeterminateCheckboxProps {
  state: CheckState;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

function IndeterminateCheckbox({
  state,
  onChange,
  id,
  className,
}: IndeterminateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.checked = state === "checked";
    ref.current.indeterminate = state === "indeterminate";
  }, [state]);

  return (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        // Base sizing & shape
        "h-4 w-4 shrink-0 cursor-pointer rounded appearance-none border-2 transition-all duration-150",
        // Unchecked
        "border-slate-300 bg-white",
        // Checked & indeterminate via custom CSS (see style tag below)
        "indeterminate-checkbox",
        className,
      )}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

interface EnhancedCategoryNodeProps {
  node: TreeNode & { name: string; children: any[] };
  depth: number;
  icon?: LucideIcon;
  selectedSet: Set<string>;
  expandedGroups: string[];
  onToggle: (id: string) => void;
  onCheck: (id: string, checked: boolean) => void;
}

function CategoryNode({
  node,
  depth,
  icon: Icon,
  selectedSet,
  expandedGroups,
  onToggle,
  onCheck,
}: EnhancedCategoryNodeProps) {
  const isLeaf = node.children.length === 0;
  const isExpanded = expandedGroups.includes(node.id);
  const checkState = getCheckState(node, selectedSet);
  const indent = depth * 14;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2.5 py-2 pr-3 rounded-lg transition-colors",
          checkState !== "unchecked" ? "bg-primary/5" : "hover:bg-secondary/30",
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        {/* Indeterminate-capable checkbox */}
        <IndeterminateCheckbox
          id={`cat-${node.id}`}
          state={checkState}
          onChange={(checked) => onCheck(node.id, checked)}
        />

        <label
          htmlFor={`cat-${node.id}`}
          className={cn(
            "flex flex-1 items-center justify-between cursor-pointer min-w-0",
          )}
        >
          <span
            className={cn(
              "flex items-center gap-2 font-medium truncate",
              depth === 0
                ? "text-sm text-foreground"
                : "text-xs text-foreground/80",
              checkState === "checked" && "text-primary font-semibold",
            )}
          >
            {Icon && depth === 0 && (
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <Icon className="h-3.5 w-3.5" />
              </div>
            )}
            {(node as any).name}
          </span>
        </label>

        {/* Expand chevron for non-leaf */}
        {!isLeaf && (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="p-0.5 rounded hover:bg-secondary/50 transition-colors shrink-0"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      {/* Children */}
      {!isLeaf && isExpanded && (
        <div className="mt-0.5 ml-3 pl-3 border-l-2 border-primary/15 space-y-0.5">
          {node.children.map((child: any) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedSet={selectedSet}
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
  const [minPriceInput, setMinPriceInput] = useState(
    filters.priceRange[0].toString(),
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.priceRange[1].toString(),
  );

  // Sync inputs with filters.priceRange when it changes from slider or reset
  useEffect(() => {
    setMinPriceInput(filters.priceRange[0].toString());
    setMaxPriceInput(filters.priceRange[1].toString());
  }, [filters.priceRange]);

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

  const selectedSet = useMemo(
    () => new Set(filters.selectedCategories),
    [filters.selectedCategories],
  );

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handlePriceInputBlur = () => {
    const min = Math.max(0, parseInt(minPriceInput) || 0);
    const max = Math.min(10000000, Math.max(min, parseInt(maxPriceInput) || 0));

    // Update local inputs to valid values
    setMinPriceInput(min.toString());
    setMaxPriceInput(max.toString());

    // Apply filters
    onFiltersChange({ ...filters, priceRange: [min, max] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePriceInputBlur();
    }
  };

  const selectedRating =
    filters.selectedRatings.length > 0 ? filters.selectedRatings[0] : 0;

  const handleRatingChange = (rating: number) => {
    const newRating = selectedRating === rating ? 0 : rating;
    onFiltersChange({
      ...filters,
      selectedRatings: newRating > 0 ? [newRating] : [],
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = computeNewSelection(
      enhancedCategoryTree,
      categoryId,
      checked,
      filters.selectedCategories,
    );
    onFiltersChange({ ...filters, selectedCategories: newCategories });
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
    <>
      {/* Scoped styles for the indeterminate + checked state of native checkbox */}
      <style>{`
        .indeterminate-checkbox {
          border-color: #cbd5e1;
          background-color: #ffffff;
        }
        .indeterminate-checkbox:checked {
          background-color: #0e7490;
          border-color: #0e7490;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5l2.5 2.5 4.5-4.5' stroke='%23ffffff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-size: 75%;
          background-repeat: no-repeat;
          background-position: center;
        }
        .indeterminate-checkbox:indeterminate {
          background-color: #0e7490;
          border-color: #0e7490;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='1' y='1.5' width='8' height='1.5' rx='0.75' fill='%23ffffff'/%3E%3C/svg%3E");
          background-size: 75%;
          background-repeat: no-repeat;
          background-position: center;
        }
        .indeterminate-checkbox:focus-visible {
          outline: 2px solid #0e7490;
          outline-offset: 2px;
        }
        .indeterminate-checkbox:hover:not(:checked):not(:indeterminate) {
          border-color: #0e7490;
        }
      `}</style>

      <Card
        className={cn(
          "h-fit rounded-2xl border-border/50 bg-linear-to-b from-card to-card/80 p-6 sticky top-24 shadow-lg",
          !isOpen && "hidden md:block",
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-linear-to-b from-primary to-accent" />
            <h3 className="text-lg font-bold text-foreground">Bộ Lọc</h3>
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

        {/* Price Range */}
        <div className="space-y-4 mb-8">
          <Label className="text-sm font-bold text-foreground">
            Khoảng Giá
          </Label>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-wider">
                Tối thiểu
              </span>
              <Input
                type="number"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onBlur={handlePriceInputBlur}
                onKeyDown={handleKeyDown}
                className="h-9 text-xs px-3 bg-secondary/40 border-none transition-all hover:bg-secondary/60 focus:bg-background focus:ring-1 focus:ring-primary rounded-lg"
              />
            </div>
            <div className="pt-5 shrink-0 text-muted-foreground/30 font-light">
              —
            </div>
            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-wider">
                Tối đa
              </span>
              <Input
                type="number"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onBlur={handlePriceInputBlur}
                onKeyDown={handleKeyDown}
                className="h-9 text-xs px-3 bg-secondary/40 border-none transition-all hover:bg-secondary/60 focus:bg-background focus:ring-1 focus:ring-primary rounded-lg"
              />
            </div>
          </div>
          <Slider
            min={0}
            max={10000000}
            step={100000}
            value={filters.priceRange}
            onFocus={() => {}}
            onValueChange={handlePriceChange}
            className="w-full"
          />
        </div>

        <Separator className="bg-border/40" />

        {/* Rating */}
        <div className="space-y-4">
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

        {/* Categories */}
        <div className="space-y-2 mb-8">
          <h4 className="text-sm font-bold text-foreground px-2 mb-4">
            Danh Mục
          </h4>
          <div className="space-y-0.5">
            {enhancedCategoryTree.map((group) => (
              <CategoryNode
                key={group.id}
                node={group}
                depth={0}
                icon={(group as any).icon}
                selectedSet={selectedSet}
                expandedGroups={expandedGroups}
                onToggle={toggleGroup}
                onCheck={handleCategoryChange}
              />
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            className="w-full bg-linear-to-b from-primary to-accent hover:shadow-lg transition-shadow text-primary-foreground font-semibold rounded-lg"
            onClick={onReset}
          >
            Xoá Tất Cả Bộ Lọc
          </Button>
        )}
      </Card>
    </>
  );
}
