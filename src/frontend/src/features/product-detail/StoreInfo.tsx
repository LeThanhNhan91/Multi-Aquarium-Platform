import { Store, Star, MapPin, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface StoreInfoProps {
  storeName: string
  storeId: string
  storeRating?: number
  storeReviews?: number
  storeLocation?: string
}

export function StoreInfo({
  storeName,
  storeId,
  storeRating = 4.8,
  storeReviews = 2450,
  storeLocation = 'Ho Chi Minh City',
}: StoreInfoProps) {
  return (
    <Card className="border-border/50 bg-card rounded-2xl p-6 space-y-5">
      {/* Store Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Store className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground text-lg font-serif truncate">
              {storeName}
            </h3>
            <p className="text-xs text-muted-foreground">Nhà bán chính thức</p>
          </div>
        </div>
      </div>

      {/* Store Stats */}
      <div className="space-y-3 py-4 border-y border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">
              {storeRating}
            </span>
          </div>
          <button className="text-xs font-medium text-primary hover:underline">
            {storeReviews.toLocaleString()} đánh giá
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{storeLocation}</span>
        </div>
      </div>

      {/* Store Actions */}
      <div className="space-y-2">
        <Link href={`/shop/${storeId}`}>
          <Button variant="outline" className="w-full rounded-lg border-primary/30 text-primary hover:bg-primary/5">
            Xem cửa hàng
          </Button>
        </Link>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold gap-2">
          <MessageSquare className="h-4 w-4" />
          Liên hệ shop
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="space-y-2 pt-4 border-t border-border/50">
        <p className="text-xs font-semibold text-foreground/70 uppercase">Chứng thực</p>
        <div className="flex gap-2">
          <div className="px-2.5 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-xs font-semibold text-green-600">✓ Chính hãng</p>
          </div>
          <div className="px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs font-semibold text-blue-600">⚡ Nhanh</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
