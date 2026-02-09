"use client"

import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const wishlistItems = [
  {
    name: "Koi Showa Premium",
    shop: "Koi Garden Center",
    price: "5,500,000",
    originalPrice: "6,200,000",
    rating: 5.0,
    reviews: 31,
    image: "/images/product-koi.jpg",
    inStock: true,
  },
  {
    name: "ADA 60P Glass Tank",
    shop: "Nature Aquarium VN",
    price: "2,800,000",
    originalPrice: null,
    rating: 4.8,
    reviews: 86,
    image: "/images/product-tank.jpg",
    inStock: true,
  },
  {
    name: "LED Aquarium Light RGB",
    shop: "Tech Aqua Store",
    price: "1,650,000",
    originalPrice: null,
    rating: 4.5,
    reviews: 97,
    image: "/images/product-light.jpg",
    inStock: false,
  },
  {
    name: "CO2 Diffuser Pro Kit",
    shop: "AquaScape Studio",
    price: "890,000",
    originalPrice: null,
    rating: 4.6,
    reviews: 42,
    image: "/images/product-co2.jpg",
    inStock: true,
  },
]

export function Wishlist() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold font-serif text-foreground">Wishlist</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {wishlistItems.length} items saved for later
          </p>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Heart className="h-4 w-4" />
          Add All to Cart
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {wishlistItems.map((item) => (
          <div
            key={item.name}
            className="flex gap-4 rounded-2xl border border-border/50 bg-card p-4 hover:shadow-md transition-shadow"
          >
            <div className="h-24 w-24 rounded-xl overflow-hidden bg-muted shrink-0">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
            </div>

            <div className="flex flex-1 flex-col min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.shop}</p>
                  <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
                </div>
                <button
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 mt-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-foreground">{item.rating}</span>
                <span className="text-xs text-muted-foreground">({item.reviews})</span>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-primary">{item.price}d</span>
                  {item.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {item.originalPrice}d
                    </span>
                  )}
                </div>
                {item.inStock ? (
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 gap-1.5 text-xs">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
