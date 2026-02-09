"use client"

import { Camera, MapPin, Calendar, Star, Settings, Share2, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const stats = [
  { label: "Shops", value: "3" },
  { label: "Products", value: "147" },
  { label: "Orders", value: "1,986" },
  { label: "Revenue", value: "263.6M" },
]

export function ProfileHeader() {
  return (
    <section className="relative">
      {/* Cover image */}
      <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
        <img
          src="/images/hero-aquarium.jpg"
          alt="Profile cover - beautiful planted aquarium"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

        {/* Cover edit button */}
        <Button
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 bg-card/20 backdrop-blur-md border-background/20 text-background hover:bg-card/40 hover:text-background gap-2"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Edit Cover</span>
        </Button>
      </div>

      {/* Profile info bar */}
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 sm:-mt-12 pb-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
              <AvatarImage src="/images/product-koi.jpg" alt="Nguyen Minh Tuan" />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-serif">
                NT
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
              aria-label="Change avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold font-serif text-foreground">Nguyen Minh Tuan</h1>
              <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
              <Badge className="bg-primary/10 text-primary border-0">Shop Owner</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Ho Chi Minh City, Vietnam
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Member since Jan 2024
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                4.9 avg rating
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-border text-foreground hover:bg-muted gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 py-5 border-t border-border">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold font-serif text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
