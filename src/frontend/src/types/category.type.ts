import { LucideIcon } from "lucide-react";

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  productCount: number;
}

export interface CategoryTreeResponse {
  id: string;
  name: string;
  slug: string;
  children: CategoryTreeResponse[];
}

// Extended category type with visual properties
export type EnhancedCategory = CategoryItem & {
  icon: LucideIcon;
  color: string;
};

export type EnhancedCategoryTree = CategoryTreeResponse & {
  icon: LucideIcon;
  color: string;
};

export interface CategoryNodeProps {
  node: CategoryTreeResponse;
  depth: number;
  icon?: LucideIcon;
  selectedCategories: string[];
  expandedGroups: string[];
  onToggle: (id: string) => void;
  onCheck: (id: string, checked: boolean) => void;
}
