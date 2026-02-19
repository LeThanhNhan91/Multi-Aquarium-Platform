"use client";

import {
  Fish,
  Waves,
  FlaskConical,
  Lamp,
  Shell,
  Leaf,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useGetParentCategoriesQuery } from "@/services/categoryApi";
import { useMemo } from "react";
import { CategoryItem, EnhancedCategory } from "@/types/category.type";
import { getSlugPrefix } from "@/helper/formatter";
import { FishLoading } from "@/app/Loading";

// Mapping object for category icons and colors (using slug prefixes without random suffix)
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

export function CategoriesSection() {
  const { data: apiData, isLoading } = useGetParentCategoriesQuery({
    pageIndex: 1,
    pageSize: 10,
  });

  // Combine API data with visual properties
  const enhancedCategories = useMemo(() => {
    if (!apiData?.data?.items) return [];

    return apiData.data.items.map((cat) => {
      // Get slug prefix without random suffix
      const slugPrefix = getSlugPrefix(cat.slug);

      const styles = categoryStyles[slugPrefix] || {
        icon: Fish,
        color: "bg-primary/10 text-primary",
      };

      return {
        ...cat,
        icon: styles.icon,
        color: styles.color,
      } as EnhancedCategory;
    });
  }, [apiData]);

  return (
    <>
      <FishLoading isLoading={isLoading} />
      <section id="categories" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Browse Categories
            </p>
            <h2 className="text-3xl font-bold font-serif text-foreground sm:text-4xl text-balance">
              Everything Your Aquarium Needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From rare exotic fish to professional-grade equipment, find
              everything to create and maintain your dream aquarium.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enhancedCategories.map((cat) => (
              <button
                key={cat.id}
                className={cn(
                  "group relative flex flex-col items-start gap-4 rounded-2xl border border-border/50 bg-card p-8 text-left",
                  "transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1",
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    cat.color,
                  )}
                >
                  <cat.icon className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {cat.name}
                    </h3>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {cat.productCount}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
                <div className="absolute bottom-8 right-8 h-8 w-8 rounded-full bg-muted flex items-center justify-center opacity-0 translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
