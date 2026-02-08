"use client";

import { Fish, Waves, FlaskConical, Lamp, Shell, Leaf } from "lucide-react";
import { cn } from "@/utils/utils";

const categories = [
  {
    icon: Fish,
    title: "Tropical Fish",
    description:
      "Exotic freshwater and saltwater species from trusted breeders worldwide.",
    count: "2,400+",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Waves,
    title: "Aquariums & Tanks",
    description:
      "Premium glass and acrylic tanks in every size, from nano to custom builds.",
    count: "850+",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: FlaskConical,
    title: "Water Treatment",
    description:
      "Filters, conditioners, and testing kits to maintain perfect water quality.",
    count: "1,200+",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Lamp,
    title: "Lighting Systems",
    description:
      "LED and specialized lighting for aquariums of all types and planted tanks.",
    count: "600+",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Shell,
    title: "Decorations",
    description:
      "Natural rocks, driftwood, substrates, and ornamental decorations.",
    count: "3,100+",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Leaf,
    title: "Live Plants",
    description:
      "Aquatic plants for beautiful planted aquascapes and natural habitats.",
    count: "900+",
    color: "bg-accent/10 text-accent",
  },
];

export function CategoriesSection() {
  return (
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
          {categories.map((cat) => (
            <button
              key={cat.title}
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
                    {cat.title}
                  </h3>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {cat.count}
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
  );
}
